define([
  'jquery',
  'js/tile',
  'gifJS',
  'getUserMedia',
  'js/localstrings',
  'config'
], function (
  $,
  Tile,
  Gif,
  getUserMedia,
  strings,
  config
) {

  // We're caching the stream here so all instances of Photobooth can use it once it is set
  var stream;

  var Photobooth = function (container, options) {
    var self = this;

    self.callbacks = {};

    // Options ----------------------------------------------------------------

    options = options || {};

    var defaults = {
      maxFrames: 10,
      speed: 83 // ~12 FPS
    };

    for (var option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    self.options = defaults;

    // Element references -----------------------------------------------------

    self.$container = $(container);
    self.$video = $('video', container);
    self.$photo = $('.gif', container);
    self.$firstFrame = $('.first-frame', container);
    self.$photoContainer = $('.photo-container', container);
    self.$canvas = $('canvas', container);
    self.$camerabtn = $('.trigger', container);
    self.$editbtn = $('.edit', container);
    self.$donebtn = $('.done', container);
    self.$statusMessage = $('.status', container);
    self.$progressContainer = $('.progress-bar', container);
    self.$progressBar = $('.progress-bar .bar', container);
    self.$spinner = $('.spinner', container);

    // Setup ------------------------------------------------------------------

    // Bind common tile UI (parent method)
    self.bindCommonUI(container);

    // Properties -------------------------------------------------------------

    self.width = 0;
    self.height = 0;
    self.frames = [];
    self.framesCaptured = 0;
    self.isCapturing = false;
    self.justSnapped = false;
    self.makingGif = false;

    // Event Delegation -------------------------------------------------------

    function onClick() {
      if (!self.isCapturing) {
        self.enterCaptureMode();
      }

      self.snapPicture();
    }

    self.$camerabtn.on('click', onClick);
    self.$video.on('click', onClick);

    self.$donebtn.on('click', function () {
      self.exitCaptureMode();
      self.constructGif();
    });

    // Set up edit button
    self.$editbtn.on('click', function () {
      self.enterCaptureMode();
    });

    self.$video.on('play', function () {
      // Accomodate for race condition with video height
      var heightCheck = setInterval(function () {
        if (self.$video.height()) {
          clearInterval(heightCheck);
          self.fire('resize');
        }
      }, 1);
    });
  };

  Photobooth.prototype = new Tile();

  /**
   * Initialize video stream
   * @return {undefined}
   */
  Photobooth.prototype.init = function () {
    var self = this;

    /**
     * Setup UI post-stream load and track stream
     * @param  {Object} cameraStream Stream object
     * @return {undefined}
     */

    function onStreamLoaded(cameraStream) {
      if (cameraStream) {
        stream = window.URL.createObjectURL(cameraStream);
      }

      self.width = self.$video.width();

      // TODO : This is NaN for some reason (although everything seems to work regardless?)
      //        Could be a race condition.
      self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);

      self.$statusMessage.remove();
      self.$camerabtn.show();
      self.$progressContainer.show();

      self.$video.attr('width', self.width);
      self.$video.attr('height', self.height);
      self.$video[0].src = stream;
      self.$video[0].play();
    }

    if (stream) {
      onStreamLoaded();
    } else {
      getUserMedia({
          video: true,
          audio: false
        },
        function (err, cameraStream) {
          // if the browser doesn't support user media
          // or the user says "no" show an error message
          if (err) {
            if (err.name === 'PERMISSION_DENIED') {
              self.$statusMessage.html(strings.get('denied'));
            } else if (err.name === 'NOT_SUPPORTED_ERROR') {
              self.$statusMessage.html(strings.get('sucky-browser'));
            } else {
              self.$statusMessage.html(strings.get('mystery-error'));
            }
          } else {
            onStreamLoaded(cameraStream);
          }
        });
    }
  };

  /**
   * Display UI for Profile global edit mode
   * @return {undefined}
   */
  Photobooth.prototype.enterEditMode = function () {
    var self = this;

    self.showDeleteButton();
    self.$video.removeClass('hidden');
    self.$camerabtn.show();
    self.$progressContainer.show();

    if (!self.isCapturing) {
      self.$editbtn.show();
    }
  };

  /**
   * Configure UI visibility for Profile preview mode
   * @return {undefined}
   */
  Photobooth.prototype.exitEditMode = function () {
    var self = this;

    self.hideDeleteButton();
    self.$video.addClass('hidden');
    self.$camerabtn.hide();
    self.$progressContainer.hide();

    if (!self.isCapturing) {
      self.$editbtn.hide();
    }
  };

  /**
   * Enter GIF capture mode
   * @return {undefined}
   */
  Photobooth.prototype.enterCaptureMode = function () {
    var self = this;

    self.fire('enterCaptureMode');

    self.frames = []; // Erase all frames

    self.width = self.$video.width();
    self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);

    self.$video.attr('width', self.width);
    self.$video.attr('height', self.height);

    self.$canvas.attr('width', self.width);
    self.$canvas.attr('height', self.height);

    self.$video.removeAttr('width');
    self.$video.removeAttr('height');

    self.$camerabtn.show();
    self.$donebtn.show();
    self.$progressContainer.show();
    self.$editbtn.hide();
    self.$video.removeClass('hidden');

    // Get rid of old images
    self.$photo.removeAttr('src');
    self.$firstFrame.removeAttr('src');

    self.isCapturing = true;
    self.fire('resize');
  };

  /**
   * Exit GIF capture mode
   * @return {undefined}
   */
  Photobooth.prototype.exitCaptureMode = function () {
    var self = this;

    self.fire('exitCaptureMode');

    self.$camerabtn.hide();
    self.$donebtn.hide();
    self.$progressContainer.hide();
    self.$progressBar.css('width', 0);
    self.$editbtn.show();
    self.$video.addClass('hidden');

    self.framesCaptured = 0;
    self.isCapturing = false;

    self.fire('resize');
  };

  // TODO - merge makeGif and constructGif ?

  Photobooth.prototype.makeGif = function (callback) {
    var self = this;

    function blobToBase64(blob, cb) {
      var reader = new FileReader();

      reader.onload = function () {
        var dataUrl = reader.result;
        var base64 = dataUrl.split(',')[1];
        cb(base64);
      };

      reader.readAsDataURL(blob);
    }

    if (!self.makingGif) {
      self.makingGif = true;

      var animatedGIF = new Gif({
        workers: 2,
        workerScript: '/bower_components/gif-js/dist/gif.worker.js',
        quality: 10,
        width: self.width,
        height: self.height
      });

      for (var i = 0; i < self.frames.length; i++) {
        animatedGIF.addFrame(self.frames[i], {
          delay: self.options.speed
        });
      }

      animatedGIF.on('finished', function (blob) {
        blobToBase64(blob, function (base64EncodedImage) {
          self.persistToServer(base64EncodedImage);
          callback('data:image/gif;base64,' + base64EncodedImage);
          self.hideSpinner();
          self.makingGif = false;
        });
      });

      self.showSpinner();
      animatedGIF.render();
    }
  };

  Photobooth.prototype.constructGif = function () {
    var self = this;

    self.makeGif(function (src) {
      var firstFrame = self.frames[0].src;

      self.update({
        gif: src,
        firstFrame: firstFrame
      });
    });
  };

  /**
   * Show spinner
   * @return {undefined}
   */
  Photobooth.prototype.showSpinner = function () {
    var self = this;

    // Center the spinner
    self.$spinner.css({
      top: (self.height - 50) / 2,
      left: (self.width - 50) / 2
    });

    self.$spinner.show();
  };

  /**
   * Hide spinner
   * @return {undefined}
   */
  Photobooth.prototype.hideSpinner = function () {
    var self = this;

    self.$spinner.hide();
  };

  /**
   * Save GIF to server
   * @param  {String} base64 Base 64 encoded GIF
   * @return {undefined}
   */
  Photobooth.prototype.persistToServer = function (base64) {
    var self = this;

    $.ajax({
      url: config.serviceURL + '/store-img',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify({
        image: base64
      })
    })
      .done(function (data) {
        self.fire('imageStored', {
          href: data.imageURL
        });
      })
      .fail(function () {
        self.fire('error', {
          id: 'persistFail',
          message: strings.get('persistFail')
        });
      });
  };

  /**
   * Capture a frame to add to the GIF
   * @return {undefined}
   */
  Photobooth.prototype.snapPicture = function () {
    var self = this;

    if (!self.justSnapped && !self.makingGif) {
      self.justSnapped = true;
      self.framesCaptured++;
      var img = document.createElement('img');
      self.$canvas[0].getContext('2d').drawImage(self.$video[0], 0, 0, self.width, self.height);
      img.src = self.$canvas[0].toDataURL('image/gif');
      self.frames.push(img);
      self.$progressBar.css('width', self.framesCaptured * (100 / self.options.maxFrames) + '%');

      if (self.framesCaptured === self.options.maxFrames) {
        self.constructGif();
        self.exitCaptureMode();
      }

      // Debounce capturing for super fast tappers/clickers
      setTimeout(function () {
        self.justSnapped = false;
      }, 250);
    }
  };

  /**
   * Update contents of the tile
   * @param  {Object} content Contains 2 img sources for poster frame and gif
   * @return {undefined}
   */
  Photobooth.prototype.update = function (content) {
    var self = this;

    if (!content) {
      return;
    }

    self.$photo.attr('src', content.gif).removeClass('hidden');
    self.$firstFrame.attr('src', content.firstFrame).removeClass('hidden');

    // Fire standard Tile update events
    Tile.prototype.update.call(self, content);
  };

  /**
   * Get the SRC of the current GIF (if it exists)
   * @return {String|null}
   */
  Photobooth.prototype.getContent = function () {
    var self = this;

    return self.$photo.attr('src') ? self.$photo.attr('src') : null;
  };

  return Photobooth;

});
