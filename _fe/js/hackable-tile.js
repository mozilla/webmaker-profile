define([
  'jquery',
  'templates',
  'imagesloaded',
  'komponent'
], function ($, templates, imagesLoaded, Komponent) {

  var HackableTile = function (target, options) {
    var self = this;
    var defaults;
    var option;

    self.callbacks = {};

    self.MEDIAURL_REGEX = {
      'YouTube': /^.*v=([a-zA-Z0-9_-]+).*$/,
      'Vimeo': /^.*\/([0-9]+).*/
    };


    // Options ----------------------------------------------------------------

    defaults = {};

    for (option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    self.options = defaults;

    // Element references -----------------------------------------------------

    self.$wrapper = $(target);
    self.$tileContent = $(templates.hackableTile());
    self.$textarea = self.$tileContent.filter('textarea');
    self.$hackedContent = self.$tileContent.filter('.hacked-content');
    self.$hackButton = self.$tileContent.filter('.hack');
    self.$saveButton = self.$tileContent.filter('.save');

    // Properties -------------------------------------------------------------

    // Setup ------------------------------------------------------------------

    self.$wrapper.html(self.$tileContent);

    // Event Delegation -------------------------------------------------------

    self.$saveButton.on('click', function () {
      self.showMake();
    });

    self.$hackButton.on('click', function () {
      self.showEditor();
    });
  };

  HackableTile.prototype = new Komponent();

  HackableTile.prototype.showEditor = function () {
    var self = this;

    self.$hackButton.addClass('disabled');
    self.$textarea.show();
    self.$saveButton.show();
    self.$textarea.focus();
    self.fire('resize');
  };

  HackableTile.prototype.showMake = function () {
    var self = this;

    self.pullText();
    self.$hackButton.removeClass('disabled');
    self.$textarea.hide();
    self.$hackButton.show();
    self.$saveButton.hide();
    self.$hackedContent.show();
    self.fire('resize');
  };

  HackableTile.prototype.pullText = function () {
    var self = this;
    var textContent = self.$textarea.val();

    function wrapImg(text) {
      return '<img src="' + text + '">';
    }

    function wrapYoutube(url) {
      var id = url.match(self.MEDIAURL_REGEX.YouTube);
      if(id){
        id = id[1]; // second result in array is the ID if there is a match
        var $container = $('<div class="video-container">').append($('<iframe ' +
          'type="text/html" src="http://www.youtube.com/embed/' + id + '">'));
        return $container;
      }
    }

    function wrapVimeo(url) {
      var id = url.match(self.MEDIAURL_REGEX.Vimeo);
      if(id){
        id = id[1]; // second result in array is the ID if there is a match
        var $container = $('<div class="video-container">').append($('<iframe ' +
          'type="text/html" src="http://player.vimeo.com/video/' + id + '" ' +
          'webkitAllowFullScreen mozallowfullscreen allowFullScreen>'));
        return $container;
      }
    }

    if (textContent.length) {
      // Fire resize when all inserted images load
      imagesLoaded(self.$hackedContent, function () {
        self.fire('resize');
      });

      // Wrap Image URL in IMG tag
      if (textContent.match(/(.jpg|.png|.gif)$/)) {
        var imgHTML = wrapImg(textContent);

        self.$hackedContent.html(imgHTML);
        self.$textarea.val(imgHTML);
      } else if (textContent.match(/youtube/)) {
        var ytHTML = wrapYoutube(textContent)[0];
        $(ytHTML).data('aspectRatio', ytHTML.height / ytHTML.width)
          .removeAttr('height')
          .removeAttr('width');

        self.$hackedContent.html(ytHTML);
        self.$textarea.val(ytHTML);
      } else if (textContent.match(/vimeo/)) {
        var vHTML = wrapVimeo(textContent);
        $(vHTML).data('aspectRatio', vHTML.height / vHTML.width)
          .removeAttr('height')
          .removeAttr('width');

        self.$hackedContent.html(vHTML);
        self.$textarea.val(vHTML);
      
      } else {
        self.$hackedContent.html(textContent);
      }

      self.$hackedContent.show();
    } else {
      self.$hackedContent.hide();
    }
  };

  return HackableTile;

});
