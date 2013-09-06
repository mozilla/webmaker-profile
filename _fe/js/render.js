define([
  'templates',
  'lodash',
  'js/localstrings'
], function (
  templates,
  _,
  strings
) {
  /**
   * Render a named Jade template
   * @param  {string} templateName        Template name minus suffix IE: 'my-tile'
   * @param  {object} nonLocalizedStrings Any non-localized content you want to send to the template
   * @return {string}                     HTML of the rendered template
   */
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
