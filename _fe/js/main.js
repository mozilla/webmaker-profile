requirejs.config({
  baseUrl: '../bower_components',
  paths: {
    komponent: 'komponent/komponent',
    json: '../_fe/json',
    js: '../_fe/js',
    main: '../_fe/js/main',
    text: 'text/text',
    jquery: 'jquery/jquery',
    jqueryui: 'jquery-ui/ui/jquery-ui',
    jade: 'jade/runtime',
    imagesloaded: 'imagesloaded/imagesloaded',
    templates: '../_fe/compiled/jade-templates'
  }
});

require(['jquery', 'templates', 'js/tiles', 'text!json/fake.json'], function ($, templates, tiles, fakeData) {
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
