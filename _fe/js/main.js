requirejs.config({
  paths: {
    json: '../json',
    text: '../../bower_components/text/text',
    jquery: '../../bower_components/jquery/jquery',
    jqueryui: '../../bower_components/jquery-ui/ui/jquery-ui',
    jade: '../../bower_components/jade/runtime'
  }
});


require(['jquery', 'templates', 'tiles', 'text!json/fake.json'], function ($, templates, tiles, tileData) {
  var tileData = JSON.parse(tileData)

  $('body').append(templates.header({
    name: 'Herbert West',
    username: 'reanimator2000'
  }));

  $('body').append(templates.tiles({
    tiles: tileData.makes
  }));

  tiles.init();
});
