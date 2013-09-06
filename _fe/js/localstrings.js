define(['jquery', 'komponent'], function ($, Komponent) {
  var LocalStrings = {
    init: function (locale) {
      var self = this;

      $.getJSON('/_fe/json/lang/' + locale + '.json', function (json) {
        self.allStrings = json;
        self.prefixedStrings = {};

        // Prefixing strings to avoid collision with non-localized strings
        for (var string in json) {
          self.prefixedStrings['__' + string] = json[string];
        }

        self.fire('load');
      });
    },
    get: function (key) {
      var self = this;

      return self.allStrings[key];
    }
  };

  Komponent.mix(LocalStrings);

  return LocalStrings;
});
