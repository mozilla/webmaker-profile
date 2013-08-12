requirejs.config({
  paths: {
    text: '../../bower_components/text/text',
    jquery: '../../bower_components/jquery/jquery',
    jade: '../../bower_components/jade/runtime'
  }
});

require(['jquery', 'templates', 'text!fake.json'], function ($, templates, tileData) {
  var tileData = JSON.parse(tileData)

  $('body').append(templates.header({
    name: 'Herbert West'
  }));

  $('body').append(templates.tiles({
    tiles: tileData
  }));
});
