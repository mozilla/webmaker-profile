define([
  'jquery',
  'js/tile',
  'animatedGif',
  'getUserMedia',
  'js/localstrings'
], function (
  $,
  Tile,
  AnimatedGif,
  getUserMedia,
  strings
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
    if (err.PERMISSION_DENIED) {
      self.$statusMessage.html(strings.get('denied'));
    } else if (err.NOT_SUPPORTED) {
      self.$statusMessage.html(strings.get('sucky-browser'));
    }
  };

  Photobooth.prototype.makeGif = function (callback) {
    var self = this;
    var ag = new AnimatedGif({
      workerPath: '/bower_components/Animated_GIF/src/quantizer.js'
    });
    ag.setSize(self.width, self.height);
    ag.setDelay(self.options.speed);
    for (var i = 0; i < self.frames.length; i++) {
      ag.addFrame(self.frames[i]);
    }
    ag.getBase64GIF(function (image) {
      var animatedImage = document.createElement('img');
      animatedImage.src = image;
      callback(animatedImage);
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
      }
    }

    function onClick() {
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

    self.$statusMessage.empty();
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
