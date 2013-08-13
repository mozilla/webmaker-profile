requirejs.config({
  paths: {
    json: '../json',
    text: '../../bower_components/text/text',
    jquery: '../../bower_components/jquery/jquery',
    jqueryui: '../../bower_components/jquery-ui/ui/jquery-ui',
    jade: '../../bower_components/jade/runtime'
  }
});

require(['jquery', 'templates', 'tiles', 'text!json/fake.json'], function ($, templates, tiles, fakeData) {
  var data = JSON.parse(fakeData);
  var $body = $('body');
  var $tileContainer = $(templates.tileContainer());

  $body.append(templates.header({
    name: 'Herbert West',
    username: 'reanimator2000'
  }));

  $body.append($tileContainer);
  $tileContainer.append(tiles.render(data.makes));
  tiles.init();
});
