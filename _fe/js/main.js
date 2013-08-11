requirejs.config({
  paths: {
    jquery: 'lib/jquery-1.8.3.min',
    jade: 'lib/jade-runtime'
  }
});

require(['jquery', 'templates'], function ($, templates) {
  $('body').append(templates.header({
    name: 'Herbert West'
  }));
});
