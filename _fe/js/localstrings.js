define(['jquery', 'komponent'], function ($, Komponent) {
  var LocalStrings = {
    init: function () {
      var self = this;

      // Navigator language polyfill
      navigator.language = navigator.language ||
        (navigator.userLanguage && navigator.userLanguage.replace(/-[a-z]{2}$/, String.prototype.toUpperCase)) ||
        'en';

      var language = navigator.language.split('-')[0];

      function buildStrings(json) {
        self.allStrings = json;
        self.prefixedStrings = {};

        // Prefixing strings to avoid collision with non-localized strings
        for (var string in json) {
          self.prefixedStrings['__' + string] = json[string];
        }

        self.fire('load');
      }

      $.getJSON('/_fe/json/lang/' + language + '.json', function (json) {
        buildStrings(json);
      })
      // Fallback to English
      .fail(function () {
        $.getJSON('/_fe/json/lang/en.json', function (json) {
          buildStrings(json);
        });
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
