define(['jquery', 'js/templates', 'komponent'], function ($, templates) {

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

    self.$textarea.on('blur', function (event) {
      self.pullText();
      self.$textarea.hide();
      self.$hackButton.show();
      self.$saveButton.hide();
      self.$hackButton.fadeTo(400, 1);
      self.$hackedContent.show();
      self.fire('resize');
    });

    self.$hackButton.on('click', function (event) {
      self.$textarea.show();
      self.$hackButton.fadeTo(400, 0.5);
      self.$saveButton.show();
      self.$textarea.focus();
      self.fire('resize');
    });
  };

  HackableTile.prototype = new Komponent();

  HackableTile.prototype.pullText = function () {
    var self = this;
    var textContent = self.$textarea.val();

    function wrapImg(text) {
      return '<img src="' + text + '">';
    }

    if (textContent.length) {
      // Wrap Image URL in IMG tag
      if (textContent) {
        self.$hackedContent.html(wrapImg(textContent));
        self.$textarea.val(wrapImg(textContent));
      } else {
        self.$hackedContent.html(textContent);
      }

      self.$hackedContent.show();
    } else {
      self.$hackedContent.hide();
    }

    // TODO: Temp hack; need to make a content loaded event (use imagesloaded)
    setTimeout(function() {
      self.fire('resize');
    }, 1000);
  };

  return HackableTile;

});
