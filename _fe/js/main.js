requirejs.config({
  baseUrl: '../bower_components',
  paths: {
    imagesloaded: 'imagesloaded/imagesloaded',
    jade: 'jade/runtime',
    jquery: 'jquery/jquery',
    jqueryui: 'jquery-ui/ui/jquery-ui',
    js: '../_fe/js',
    json: '../_fe/json',
    komponent: 'komponent/komponent',
    lodash: 'lodash/lodash',
    main: '../_fe/js/main',
    store: 'store.js/store',
    templates: '../_fe/compiled/jade-templates',
    text: 'text/text'
  }
});

require([
  'jquery',
  'templates',
  'js/tiles',
  'text!json/fake.json'
], function ($, templates, tiles, fakeData) {
  var data = JSON.parse(fakeData);
  var $body = $('body');
  var $tileContainer = $(templates.tileContainer());

  $body.append(templates.header({
    avatarSrc: data.avatarSrc,
    name: data.realName,
    username: data.username
  }));

  $body.append($tileContainer);

  tiles.init({
    container: $tileContainer[0]
  });

  tiles.render(data.makes);
});
