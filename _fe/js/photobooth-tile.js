define(['jquery', 'templates', 'komponent'], function ($, templates) {

  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  var Photobooth = function (container) {
    var self = this;

    self.callbacks = {};
    self.streaming = false;
    self.video = container.querySelector('video');
    self.$video = $(self.video);
    self.$photo = $('img', container);
    self.canvas = container.querySelector('canvas');
    self.$canvas = $(self.canvas);
    self.$startbtn = $('.trigger', container);
    self.width = $('.grid-sizer').width();

  };

  Photobooth.prototype = new Komponent();

  Photobooth.prototype.init = function () {
    var self = this;

    self.video.addEventListener('canplay', function () {
      if (!self.streaming) {
        self.height = self.video.videoHeight / (self.video.videoWidth / self.width);
        self.$video.attr('width', self.width);
        self.$video.attr('height', self.height);
        self.$canvas.attr('width', self.width);
        self.$canvas.attr('height', self.height);
        self.$startbtn.removeClass('hidden');
        self.streaming = true;
        self.fire('resize');
      }
    }, false);

    function resetWidthHeight() {
      self.$photo.css({
        width: '',
        height: ''
      });
      self.$video.attr('height', '');
      self.$video.attr('width', '');
    }

    function startVideo(e) {
      self.$video.attr('width', self.width);
      self.$video.attr('height', self.height);
      self.$canvas.attr('width', self.width);
      self.$canvas.attr('height', self.height);
      self.$photo.addClass('hidden');
      self.$startbtn.removeClass('edit');
      self.$startbtn.off('click', startVideo);
      self.$startbtn.on('click', takePicture);
      self.fire('resize');
    }

    function takePicture(err) {
      var data;

      self.$canvas.width(self.width);
      self.$canvas.height(self.height);
      self.$canvas[0].getContext('2d').drawImage(self.video, 0, 0, self.width, self.height);
      data = self.$canvas[0].toDataURL('image/png');
      self.$photo.attr('src', data);
      self.$photo.removeClass('hidden');

      self.$startbtn.addClass('edit');
      self.$startbtn.on('click', startVideo);
      self.$startbtn.off('click', takePicture);
      resetWidthHeight();
      self.fire('resize');
    }

    self.$startbtn.click(takePicture);

    navigator.getMedia({
        video: true,
        audio: false
      },
      function (stream) {
        if (navigator.mozGetUserMedia) {
          self.video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          self.video.src = vendorURL.createObjectURL(stream);
        }
        self.video.play();
      },
      function (err) {
        console.log('Error - getUserMedia not working');
      }
    );
  };

  return Photobooth;

});
