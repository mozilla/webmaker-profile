define([
  'jquery',
  'templates',
  'js/tile',
  'animatedGif',
  'getUserMedia'
], function (
  $,
  templates,
  Tile,
  AnimedGif,
  getUserMedia
) {

  var COUNT = 5;
  var DELAY = 200;
  var STREAM;

  var Photobooth = function (container) {
    var self = this;

    self.callbacks = {};

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

  Photobooth.prototype.onErr = function (err) {
    var self = this;
    if (err.PERMISSION_DENIED) {
      self.$statusMessage.html('Looks like you denied us permission to use your camera :(');
    } else if (err.NOT_SUPPORTED) {
      self.$statusMessage.html('Looks like your browser sucks');
    }
  };

  Photobooth.prototype.makeGif = function (callback) {
    var self = this;
    var ag = new Animated_GIF({
      workerPath: '/bower_components/Animated_GIF/src/quantizer.js'
    });
    ag.setSize(self.width, self.height);
    ag.setDelay(10);
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
      console.log(count, self.frames);
      if (count >= COUNT) {
        clearInterval(interval);
        self.makeGif(function (gif) {
          var firstFrame = self.frames[0].src;
          self.update({
            gif: gif.src,
            firstFrame: firstFrame
          });
          // Allow editing
          self.$editbtn.removeClass('off');;
          self.$video.addClass('hidden');
          self.$progress.addClass('off');
          self.frames = [];
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

      interval = setInterval(snapPicture, DELAY);

      self.$video.removeAttr('width');
      self.$video.removeAttr('height');
    }

    self.$startbtn.on('click', onClick);
  };

  Photobooth.prototype.onStreamLoaded = function (stream) {
    var self = this;
    if (stream) {
      stream = window.URL.createObjectURL(stream);
      STREAM = stream;
    }

    self.width = self.$video.width();
    self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);

    self.$statusMessage.empty();
    self.$startbtn.removeClass('off');

    self.$video.attr('width', self.width);
    self.$video.attr('height', self.height);
    self.$video[0].src = STREAM;
    self.$video[0].play();
    self.attachClickListener();
  };

  Photobooth.prototype.init = function () {
    var self = this;

    if (STREAM) {
      self.onStreamLoaded();
    } else {
      getUserMedia({
          video: true,
          audio: false
        },
        function (err, stream) {
          // if the browser doesn't support user media
          // or the user says "no" the error gets passed
          // as the first argument.
          if (err) {
            self.onErr(err);
          } else {
            self.onStreamLoaded(stream);
          }
        });
    }

    // Set up edit button
    self.$editbtn.on('click', function () {
      self.$editbtn.addClass('off');;
      self.$startbtn.removeClass('off');;
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
