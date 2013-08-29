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
    uuid: 'node-uuid/uuid',
    templates: '../_fe/compiled/jade-templates',
    text: 'text/text'
  }
});

require([
  'jquery',
  'templates',
  'js/tiles',
  'js/database'
], function ($, templates, tiles, db) {
  var $body = $('body');
  var $tileContainer = $(templates.tileContainer());

  $body.append(templates.header({
    avatarSrc: db.get('avatarSrc'),
    name: db.get('realName'),
    username: db.get('username')
  }));

  $body.append($tileContainer);

  tiles.init({
    container: $tileContainer[0]
  });

  tiles.render(db.get('makes'));

  DB = db; // TEMP
});
