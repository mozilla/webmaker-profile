requirejs.config({
  baseUrl: '/bower_components',
  paths: {
    json: '../../_fe/json',
    js: '../../_fe/js',
    text: 'text/text',
    masonry: 'masonry/masonry',
    jquery: 'jquery/jquery',
    jqueryui: 'jquery-ui/ui/jquery-ui',
    jade: 'jade/runtime'
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
  $tileContainer.append(tiles.render(data.makes));
  tiles.init();
});
