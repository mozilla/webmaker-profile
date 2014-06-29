requirejs.config({
  baseUrl: '../bower_components',
  paths: {
    bleach: 'bleach/lib/bleach',
    config: '../_fe/js/config',
    getUserMedia: 'getUserMedia/getusermedia.bundle',
    gifJS: 'gif-js/dist/gif',
    imagesloaded: 'imagesloaded/imagesloaded',
    jade: 'jade/runtime',
    jquery: 'jquery/jquery',
    'jquery-debounce': 'jquery-throttle-debounce/jquery.ba-throttle-debounce.min',
    js: '../_fe/js',
    json: '../_fe/json',
    komponent: 'komponent/komponent',
    lodash: 'lodash/dist/lodash',
    main: '../_fe/js/main',
    persona: '../_fe/js/persona',
    pris: 'pris/pris',
    templates: '../_fe/compiled/jade-templates',
    text: 'text/text',
    uuid: 'node-uuid/uuid'
  },
  shim: {
    'pris': {
      exports: 'PRIS'
    },
    'gifJS': {
      exports: 'GIF'
    },
    'jquery-debounce': {
      deps: ['jquery']
    }
  }
});

require([
  'js/device',
  'jquery',
  'js/tiles',
  'js/database',
  'js/localstrings',
  'js/render',
  'persona',
  'pris'
], function (device, $, tiles, db, localStrings, render, initPersona, pris) {
  var servicesToLoad = 2;
  var servicesLoaded = 0;

  function initUI() {
    if (servicesLoaded === servicesToLoad) {
      var $body = $('body');
      var $tileContainer = $(render('tile-container'));

      $('title').text(username + ' | ' + localStrings.get('Webmaker'));

      $body.append(render('header', {
        avatarSrc: db.get('avatarSrc'),
        name: db.get('realName'),
        username: db.get('username')
      }));

      $body.append($tileContainer);
      $body.append(render('footer'));

      tiles.init($tileContainer);
      tiles.render(db.get('makes'));

      var navigatorIDReady = setInterval(function () {
        if (navigator.id) {
          clearInterval(navigatorIDReady);
          initPersona(username);
        }
      }, 100);
    }
  }

  // Set up device characteristics and feature detection
  device.init();

  // Initialize UI after localization strings load
  localStrings.on('load', function () {
    servicesLoaded++;
    initUI();
  });

  localStrings.init(pris.get('lang'));

  // Initialize database
  db.on('load', function () {
    servicesLoaded++;
    initUI();
  });

  // Grab username from QueryString, if it exists
  var username = (window.location.search &&
    window.location.search.match(/username=([a-zA-Z0-9]+)/)[1]) ||
    'reanimator';

  db.init(username);
});
