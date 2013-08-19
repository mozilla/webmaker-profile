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
