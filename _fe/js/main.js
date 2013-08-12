requirejs.config({
  paths: {
    jquery: '../../bower_components/jquery/jquery',
    jade: '../../bower_components/jade/runtime'
  }
});

require(['jquery', 'templates'], function ($, templates) {
  $('body').append(templates.header({
    name: 'Herbert West',
    username: 'reanimator2000'
  }));
  $('body').append(templates.tiles({
    makes: [
      {
        title: 'Test Thimble',
        type: 'webmaker'
      },
      {
        title: 'Test Popcorn',
        type: 'webmaker'
      },
      {
        title: 'Vimeo whatever',
        type: 'video'
      }
    ]
  }));
});
