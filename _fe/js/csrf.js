// set and get the CSRF token

define(['jquery'], function ($) {
  var csrfToken = false,
    onCSRF = false;

  var csrfHandler = {
    get: function (callback) {
      if (callback) {
        if (csrfToken) {
          callback(csrfToken);
        } else {
          onCSRF = callback;
        }
      }
      return csrfToken;
    },
    set: function (val) {
      csrfToken = val;
      $('meta[name=\'X-CSRF-TOKEN\']').attr('content', csrfToken);
      if (onCSRF) {
        onCSRF(csrfToken);
        onCSRF = false;
      }
    }
  };

  $.ajax({
    url: '/getcsrf',
    success: function (data) {
      if (!data.csrfToken) {
        throw new Error('no CSRF token found on the csrf route response');
      }
      csrfHandler.set(data.csrfToken);
    },
    error: function (data) {
      throw new Error(data);
    }
  });

  return csrfHandler;
});
