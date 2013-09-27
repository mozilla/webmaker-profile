define(['jquery'], function ($) {
  var defaults = {
    serviceURL: 'http://localhost:10179'
  };

  var config;

  $.ajax({
    url: '/env.json',
    dataType: 'json',
    async: false
  })
    .done(function (data) {
      config = data;
    })
    .fail(function () {
      config = false;
    });

  if (config) {
    return config;
  } else {
    return defaults;
  }
});
