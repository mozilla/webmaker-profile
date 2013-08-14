requirejs.config({
  baseUrl: '../bower_components',
  shim: {
    'komponent/komponent': {
      exports: 'Komponent'
    }
  },
  paths: {
    komponent: 'komponent/komponent',
    json: '../_fe/json',
    js: '../_fe/js',
    main: '../_fe/js/main',
    text: 'text/text',
    jquery: 'jquery/jquery',
    jqueryui: 'jquery-ui/ui/jquery-ui',
    jade: 'jade/runtime',
    imagesloaded: 'imagesloaded/imagesloaded'
  }
});

require(['jquery', 'js/templates', 'js/tiles', 'text!json/fake.json'], function ($, templates, tiles, fakeData) {
  var data = JSON.parse(fakeData);
  var $body = $('body');
  var $tileContainer = $(templates.tileContainer());

  $body.append(templates.header({
    name: 'Herbert West',
    username: 'reanimator2000'
  }));

  $body.append($tileContainer);
  tiles.init({
    container: $tileContainer[0]
  });
  tiles.render(data.makes);
});
