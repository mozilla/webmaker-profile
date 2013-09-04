requirejs.config({
  baseUrl: '../bower_components',
  paths: {
    animatedGif: 'Animated_GIF/src/Animated_GIF',
    getUserMedia: 'getUserMedia/getusermedia.bundle',
    imagesloaded: 'imagesloaded/imagesloaded',
    jade: 'jade/runtime',
    jquery: 'jquery/jquery',
    jqueryui: 'jquery-ui/ui/jquery-ui',
    js: '../_fe/js',
    json: '../_fe/json',
    komponent: 'komponent/komponent',
    lodash: 'lodash/lodash',
    main: '../_fe/js/main',
    neuquant: 'Animated_GIF/src/NeuQuant',
    omggif: 'Animated_GIF/src/omggif',
    store: 'store.js/store',
    uuid: 'node-uuid/uuid',
    templates: '../_fe/compiled/jade-templates',
    text: 'text/text'
  }
});

require([
  'js/device',
  'jquery',
  'templates',
  'js/tiles',
  'js/database'
], function (device, $, templates, tiles, db) {
  var $body = $('body');
  var $tileContainer = $(templates.tileContainer());

  // Set up device characteristics and feature detection
  device.init();

  $body.append(templates.header({
    avatarSrc: db.get('avatarSrc'),
    name: db.get('realName'),
    username: db.get('username')
  }));

  $body.append($tileContainer);

  tiles.init($tileContainer);
  tiles.render(db.get('makes'));
});
