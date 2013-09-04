// Device characteristics and feature detection.

define(['komponent', 'jquery'], function (Komponent, $) {
  var Device = {
    init: function (options) {
      var self = this,
        defaults,
        option;

      Komponent.mix(self);

      // Options ----------------------------------------------------------------

      defaults = {};

      for (option in options) {
        defaults[option] = options[option] || defaults[option];
      }

      self.options = defaults;

      // Element references -----------------------------------------------------

      // Properties -------------------------------------------------------------

      // Setup ------------------------------------------------------------------

      // Event Delegation -------------------------------------------------------

      $(window).on('resize', function () {
        self.fire('resize', self.getProperties());
      });

      // Prevent multiple inits
      delete self.init;
    },
    getWidth: function () {
      return document.documentElement.clientWidth;
    },
    getProperties: function () {
      var self = this;

      return {
        width: self.getWidth(),
        isSmallScreen: self.getWidth() <= 320 ? true : false
      };
    }
  };

  return Device;
});
