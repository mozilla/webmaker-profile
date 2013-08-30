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
    self.$photo = $('img', container);
    self.$canvas = $('canvas', container);
    self.$startbtn = $('.trigger', container);
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

  Photobooth.prototype.onErr = function(err) {
    var self = this;
    if (err.PERMISSION_DENIED) {
      console.err('Looks like you denied us permission to use your camera :(');
    } else if (err.NOT_SUPPORTED) {
      // It's fine, just show the videoInput
    }
  };

  Photobooth.prototype.makeGif = function (callback) {
    var self = this;
    var ag = new Animated_GIF({
      workerPath: '/bower_components/Animated_GIF/src/quantizer.js'
    });
    ag.setSize(320, 240);
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


  Photobooth.prototype.clickListener = function(onOff) {
    var self = this;
    var interval;
    var count = 0;

    function snapPicture() {
      var img = document.createElement('img');
      self.clickListener('off');
      self.$canvas[0].getContext('2d').drawImage(self.$video[0], 0, 0, self.width, self.height);
      img.src = self.$canvas[0].toDataURL('image/gif');
      self.frames.push(img);
      count++;
      if (count === COUNT) {
        clearInterval(interval);
        self.makeGif(function(gif) {
          gif.classList.add('output-img');
          self.$container.append(gif);
        });
        count = 0;
        self.clickListener('on');
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

    self.$video[onOff]('click', onClick);
  }

  Photobooth.prototype.onStreamLoaded = function (stream) {
    var self = this;
    if ( stream ) {
      stream = window.URL.createObjectURL(stream);
      STREAM = stream;
    }

    self.width = self.$video.width();
    self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);

    self.$video.attr('width', self.width);
    self.$video.attr('height', self.height);
    self.$video[0].src = STREAM;
    self.$video[0].play();
    self.clickListener('on');
  }

  Photobooth.prototype.init = function () {
    var self = this;

    if ( STREAM ) {
      self.onStreamLoaded();
    } else {
      getUserMedia(function (err, stream) {
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
  };

  Photobooth.prototype.update = function () {
    var self = this;

    // This method extends Tile's update method
    // TODO - What data will be passed to update? Probably encoded IMG?
    Tile.prototype.update.call(self /*, html */ );

    // TODO - Fill in this method.
    // Probably move over code from init
    // (also break that code up into smaller methods for an API)
  };

  return Photobooth;

});
