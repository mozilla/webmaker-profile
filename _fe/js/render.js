define([
  'templates',
  'lodash',
  'js/localstrings'
], function (
  templates,
  _,
  strings
) {
  return function (templateName, nonLocalizedStrings) {
    var allStrings = {};

    if (nonLocalizedStrings) {
      _.assign(allStrings, strings.prefixedStrings, nonLocalizedStrings);
    } else {
      allStrings = strings.prefixedStrings;
    }

    return templates[templateName](allStrings);
  };
});
