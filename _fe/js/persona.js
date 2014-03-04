/* global console: false */

// Persona Authentication

define([
  'jquery',
  'config',
  'js/csrf',
  'webmaker-auth-client/webmaker-auth-client'
], function ($, config, csrf, WebmakerAuthClient) {

  return function initPersona(username) {

    csrf.get(function (csrfToken) {
      var auth = new WebmakerAuthClient({
        host: config.serviceURL,
        csrfToken: csrfToken
      });

      var $login = $('button.login'),
        $logout = $('button.logout'),
        $edit = $('button.edit-mode');

      var uiState = {
        loggedOut: function () {
          $login.removeClass('hidden');
          $logout.addClass('hidden');
          $edit.addClass('hidden');
        },
        loggedIn: function () {
          $login.addClass('hidden');
          $logout.removeClass('hidden');
          $edit.addClass('hidden');
        },
        loggingIn: function () {
          $login.addClass('hidden');
        },
        loggedInOwner: function () {
          $login.addClass('hidden');
          $logout.removeClass('hidden');
          $edit.removeClass('hidden');
        }
      };

      $login.click(auth.login);
      $logout.click(auth.logout);

      auth.on('login', function (user) {
        if (username === user.username) {
          uiState.loggedInOwner();
        } else {
          uiState.loggedIn();
        }
      });

      auth.on('logout', function () {
        uiState.loggedOut();
      });

      auth.on('error', function (err) {
        console.error('Error: ' + err);
      });

      auth.verify();

    });

  };
});
