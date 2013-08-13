requirejs.config({
  paths: {
    text: '../../bower_components/text/text',
    jquery: '../../bower_components/jquery/jquery',
    jqueryui: '../../bower_components/jquery-ui/ui/jquery-ui',
    jade: '../../bower_components/jade/runtime'
  }
});

require(['jquery', 'templates', 'tiles', 'hackable-tile', 'text!fake.json'], function ($, templates, tiles, HackableTile, tileData) {
  tileData = JSON.parse(tileData);

  $('body').append(templates.header({
    name: 'Herbert West',
    username: 'reanimator2000'
  }));

  $('body').append(templates.tiles({
    tiles: tileData
  }));

  tiles.init();

  $('.tiles').append('<li class="tile webmaker hackable">Hackable</li>');

  var hackableTile = new HackableTile($('.hackable'), {});

});
