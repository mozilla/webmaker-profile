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
      maxFrames: 5,
      delay: 200,
      speed: 10
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
    self.$startbtn = $('.trigger', container);
    self.$editbtn = $('.edit', container);
    self.$progress = $('.progress', container);
    self.$statusMessage = $('.status', container);

    // Setup ------------------------------------------------------------------

    // Bind common tile UI (parent method)
    self.bindCommonUI(container);

    // Properties -------------------------------------------------------------

    self.width = 0;
    self.height = 0;
    self.frames = [];
    self.isCapturing = false;

  };

  Photobooth.prototype = new Tile();

  Photobooth.prototype.enterEditMode = function () {
    var self = this;

    self.$editbtn.show();
    self.enableEditing();
    self.showDeleteButton();
  };

  Photobooth.prototype.exitEditMode = function () {
    var self = this;

    self.$editbtn.hide();
    self.hideDeleteButton();
  };

  Photobooth.prototype.onErr = function (err) {
    var self = this;

    if (err.name === 'PERMISSION_DENIED') {
      self.$statusMessage.html(strings.get('denied'));
    } else if (err.name === 'NOT_SUPPORTED_ERROR') {
      self.$statusMessage.html(strings.get('sucky-browser'));
    } else {
      self.$statusMessage.html(strings.get('mystery-error'));
    }
  };

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
        var animatedImage = document.createElement('img');
        animatedImage.src = 'data:image/gif;base64,' + base64EncodedImage;
        self.persistToServer(base64EncodedImage);
        callback(animatedImage);
      });
    });

    animatedGIF.render();
  };

  Photobooth.prototype.persistToServer = function (base64) {
    var self = this;

    $.ajax({
      url: config.serviceURL + '/store-img',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
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

  Photobooth.prototype.attachClickListener = function () {
    var self = this;
    var interval;
    var count = 0;

    function snapPicture() {
      var img = document.createElement('img');
      self.$startbtn.off('click', onClick);
      self.$progress.removeClass('off');
      self.$canvas[0].getContext('2d').drawImage(self.$video[0], 0, 0, self.width, self.height);
      img.src = self.$canvas[0].toDataURL('image/gif');
      self.frames.push(img);
      // Hide the photo button
      self.$startbtn.addClass('off');
      count++;

      if (count >= self.options.maxFrames) {
        clearInterval(interval);
        self.makeGif(function (gif) {
          var firstFrame = self.frames[0].src;
          self.update({
            gif: gif.src,
            firstFrame: firstFrame
          });
          // Allow editing
          self.enableEditing();
        });
        count = 0;
        self.$startbtn.on('click', onClick);
        self.isCapturing = false;
      }
    }

    function onClick() {
      if (!self.isCapturing) {
        self.isCapturing = true;

        self.width = self.$video.width();
        self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);

        self.$video.attr('width', self.width);
        self.$video.attr('height', self.height);
        self.$canvas.attr('width', self.width);
        self.$canvas.attr('height', self.height);

        interval = setInterval(snapPicture, self.options.delay);

        self.$video.removeAttr('width');
        self.$video.removeAttr('height');
      }
    }

    self.$startbtn.on('click', onClick);
  };

  Photobooth.prototype.enableEditing = function () {
    var self = this;

    self.$editbtn.removeClass('off');
    self.$video.addClass('hidden');
    self.$progress.addClass('off');
    self.frames = [];
  };

  Photobooth.prototype.onStreamLoaded = function (cameraStream) {
    var self = this;
    if (cameraStream) {
      stream = window.URL.createObjectURL(cameraStream);
    }

    self.width = self.$video.width();
    self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);

    self.$statusMessage.remove();
    self.$startbtn.removeClass('off');

    self.$video.attr('width', self.width);
    self.$video.attr('height', self.height);
    self.$video[0].src = stream;
    self.$video[0].play();
    self.attachClickListener();
  };

  Photobooth.prototype.init = function () {
    var self = this;

    if (stream) {
      self.onStreamLoaded();
    } else {
      getUserMedia({
          video: true,
          audio: false
        },
        function (err, cameraStream) {
          // if the browser doesn't support user media
          // or the user says "no" the error gets passed
          // as the first argument.
          if (err) {
            self.onErr(err);
          } else {
            self.onStreamLoaded(cameraStream);
          }
        });
    }

    // Set up edit button
    self.$editbtn.on('click', function () {
      self.$editbtn.addClass('off');
      self.$startbtn.removeClass('off');
      self.$video.removeClass('hidden');
    });

    // Set up resize
    self.$video.on('playing', function () {
      self.fire('resize');
    });

  };

  Photobooth.prototype.update = function (content) {
    var self = this;

    if (!content) {
      return;
    }

    self.$photo.attr('src', content.gif).removeClass('hidden');
    self.$firstFrame.attr('src', content.firstFrame).removeClass('hidden');

    Tile.prototype.update.call(self, content);

  };

  return Photobooth;

});
