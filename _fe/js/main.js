requirejs.config({
  baseUrl: '../bower_components',
  paths: {
    config: '../_fe/js/config',
    getUserMedia: 'getUserMedia/getusermedia.bundle',
    gifJS: 'gif-js/dist/gif',
    imagesloaded: 'imagesloaded/imagesloaded',
    jade: 'jade/runtime',
    jquery: 'jquery/jquery',
    js: '../_fe/js',
    json: '../_fe/json',
    komponent: 'komponent/komponent',
    lodash: 'lodash/lodash',
    main: '../_fe/js/main',
    templates: '../_fe/compiled/jade-templates',
    text: 'text/text',
    uuid: 'node-uuid/uuid'
  },
  shim: {
    'gifJS': {
      exports: 'GIF'
    }
  }
});

require([
  'js/device',
  'jquery',
  'js/tiles',
  'js/database',
  'js/localstrings',
  'js/render'
], function (device, $, tiles, db, localStrings, render) {
  var servicesToLoad = 2;
  var servicesLoaded = 0;

  function initUI() {
    if (servicesLoaded === servicesToLoad) {
      var $body = $('body');
      var $tileContainer = $(render('tile-container'));

      $body.append(render('header', {
        avatarSrc: db.get('avatarSrc'),
        name: db.get('realName'),
        username: db.get('username')
      }));

      $body.append($tileContainer);

      tiles.init($tileContainer);
      tiles.render(db.get('makes'));
    }
  }

  // Set up device characteristics and feature detection
  device.init();

  // Initialize UI after localization strings load
  localStrings.on('load', function () {
    servicesLoaded++;
    initUI();
  });

  // TODO - Sniff locale instead of hard coding
  localStrings.init('en-us');

  // Initialize database
  db.on('load', function () {
    servicesLoaded++;
    initUI();
  });

  // Grab username from QueryString, if it exists
  var username = 'reanimator';
  var qs = window.location.search;
  if (qs) {
    qs = qs.replace('?', ''); // get rid of '?'
    var qsArray = qs.split('&');
    for (var i = 0, l = qsArray.length; i < l; i++) {
      var v = qsArray[i].split('=');
      if (v[0] === 'user') {
        username = v[1];
      }
    }
  }

  db.init(username);
});
