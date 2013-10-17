define(['jquery'], function ($) {
  var defaults = {
    serviceURL: 'http://localhost:10179',
    confirmDelete: true,
    usePersona: true
  };

  var config;

  $.ajax({
    url: '/env.json',
    dataType: 'json',
    async: false
  })
    .done(function (data) {
      config = $.extend(defaults, data);
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
