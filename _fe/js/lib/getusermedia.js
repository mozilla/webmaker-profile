define([], function () {
  return function(options) {
    options = options || {};
    var self = this;
    var streaming = false;
    var video = options.input || document.querySelector('.video');
    var photo = options.output || document.querySelector('.photo');
    var canvas = document.createElement('canvas');
    var startbutton = options.trigger || document.querySelector('#startbutton');
    var width = options.width || 320;
    var height = options.height || 0;

    function init(options) {

      navigator.getMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

      navigator.getMedia({
          video: true,
          audio: false
        },
        function (stream) {
          if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
          } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
          }
          video.play();
        },
        function (err) {
          console.log('An error occured! ' + err);
        }
      );

      video.addEventListener('canplay', function () {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);
          video.setAttribute('width', width);
          video.setAttribute('height', height);
          canvas.setAttribute('width', width);
          canvas.setAttribute('height', height);
          streaming = true;
        }
      }, false);

      function takepicture() {
        var data;
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);

        data = canvas.toDataURL('image/png');
        //photo.classList.remove('hidden');
        photo.setAttribute('src', data);
      }

      startbutton.addEventListener('click', function (e) {
        e.preventDefault();
        takepicture();
      }, false);
    }

    self.init = init;
  }
});
