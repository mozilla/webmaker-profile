define(['jquery', 'js/templates'], function ($, templates) {

  var HackableTile = function (target, options) {
    var self = this;
    var defaults;
    var option;

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
    });

    self.$hackButton.on('click', function (event) {
      self.$textarea.show();
      self.$hackButton.fadeTo(400, 0.5);
      self.$saveButton.show();
      self.$textarea.focus();
    });
  };

  HackableTile.prototype = {
    pullText: function () {
      var self = this;
      var textContent = self.$textarea.val();

      if (textContent.length) {
        self.$hackedContent.html(textContent);
        self.$hackedContent.show();
      } else {
        self.$hackedContent.hide();
      }
    }
  };

  return HackableTile;

});
