define(['jquery', 'templates'], function ($, templates) {

  var HackableTile = function (target, options) {
    var self = this,
      defaults,
      option;

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
    self.$hackButton = self.$tileContent.filter('button');

    // Properties -------------------------------------------------------------

    // Setup ------------------------------------------------------------------

    self.$wrapper.html(self.$tileContent);

    // Event Delegation -------------------------------------------------------

    self.$textarea.on('blur', function (event) {
      self.$hackedContent.html(self.$textarea.val());
      self.$textarea.hide();
      self.$hackedContent.show();
    });

    self.$hackButton.on('click', function (event) {
      self.$textarea.show();
      self.$textarea.focus();
    });
  };

  HackableTile.prototype = {

  };

  return HackableTile;

});
