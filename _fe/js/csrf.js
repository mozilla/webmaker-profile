// set and get the CSRF token

define(function () {
  var csrfToken = '';
  return {
    get: function () {
      return csrfToken;
    },
    set: function (val) {
      csrfToken = val;
    }
  };
});
