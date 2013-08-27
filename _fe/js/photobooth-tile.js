define(['jquery', 'templates', 'komponent'], function ($, templates, Komponent) {

  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  var Photobooth = function (container) {
    var self = this;

    self.callbacks = {};
    self.streaming = false;
    self.$video = $('video', container);
    self.$photo = $('img', container);
    self.$canvas = $('canvas', container);
    self.$startbtn = $('.trigger', container);
    self.$statusMessage = $('.status', container);
    self.width = $('.grid-sizer').width();
  };

  Photobooth.prototype = new Komponent();

  Photobooth.prototype.init = function () {
    var self = this;

    function resetWidthHeight() {
      self.$photo.css({
        width: '',
        height: ''
      });
      self.$video.attr('height', '');
      self.$video.attr('width', '');
    }

    function resize() {
      self.width = $('.grid-sizer').width();
      self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);
      self.$video.attr('width', self.width);
      self.$video.attr('height', self.height);
      self.$canvas.attr('width', self.width);
      self.$canvas.attr('height', self.height);
      self.fire('resize');
    }

    function startVideo(e) {
      e.stopPropagation();
      resize();
      self.$photo.addClass('hidden');
      self.$startbtn.removeClass('edit');
      self.$startbtn.off('click', startVideo);
      self.$startbtn.on('click', takePicture);
    }

    function takePicture(e) {
      e.stopPropagation();
      var data;
      self.height = self.$video[0].videoHeight / (self.$video[0].videoWidth / self.width);
      self.$canvas[0].getContext('2d').drawImage(self.$video[0], 0, 0, self.width, self.height);
      data = self.$canvas[0].toDataURL('image/png');
      self.$photo.attr('src', data);
      self.$photo.removeClass('hidden');

      self.$startbtn.addClass('edit');
      self.$startbtn.on('click', startVideo);
      self.$startbtn.off('click', takePicture);
      resetWidthHeight();
      self.fire('resize');
    }

    function onTimeUpdate() {
      if(!self.$video[0].videoHeight) {
        return;
      }
      if (!self.streaming) {
        resize();
        self.$startbtn.removeClass('hidden');
        self.streaming = true;
      }
      self.$video.off('timeupdate', onTimeUpdate);
    }
    self.$video.on('timeupdate', onTimeUpdate);
    self.$startbtn.click(takePicture);

    navigator.getMedia({
        video: true
      },
      function (stream) {
        self.stream = window.URL.createObjectURL(stream);
        self.$video[0].src = self.stream;
        self.$video[0].play();
        self.$statusMessage.empty();
      },
      function (err) {
        var message = 'Oops, there was an error accessing your webcam';

        if (err.PERMISSION_DENIED) {
          message = 'Looks like you denied us permission to use your camera :(';
        } else if (err.NOT_SUPPORTED) {
          message = 'Oops, your browser doesn\'t support access to your webcam';
        }

        self.$statusMessage.html(message);
      }
    );
  };

  return Photobooth;

});
