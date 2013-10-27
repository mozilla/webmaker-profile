/* global console: false */

// Persona Authentication

define([
  'jquery',
  'config',
  'js/csrf'
], function ($, config, csrf) {
  return function initPersona(username) {
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

    $login.click(function () {
      navigator.id.request();
    });

    $logout.click(function () {
      navigator.id.logout();
    });

    navigator.id.watch({
      onlogin: function (assertion) {
        csrf.get(function (csrfToken) {
          uiState.loggingIn();
          $.ajax(config.serviceURL + '/persona/verify', {
            type: 'POST',
            data: {
              assertion: assertion
            },
            beforeSend: function (request) {
              request.setRequestHeader('X-CSRF-Token', csrfToken);
            },
            success: function (res) {
              if (res && res.status === 'okay') {
                // TODO Remove this hack before mozfest
                if (username === res.user.username || username === 'reanimator') {
                  uiState.loggedInOwner();
                } else {
                  uiState.loggedIn();
                }
              } else {
                console.log('An error Occured: ' + res.reason);
                navigator.id.logout();
              }
            },
            error: function (jqxhr, txtStatus, err) {
              console.error('Error: ' + txtStatus + err ? ' - ' + err : '');
              uiState.loggedOut();
              navigator.id.logout();
            }
          }, false);
        });
      },
      onlogout: function () {
        csrf.get(function (csrfToken) {
          $.ajax(config.serviceURL + '/persona/logout', {
            type: 'POST',
            beforeSend: function (request) {
              request.setRequestHeader('X-CSRF-Token', csrfToken);
            },
            success: function () {
              uiState.loggedOut();
            },
            error: function (jqxhr, txtStatus, err) {
              console.error('Error: ' + txtStatus + err ? ' - ' + err : '');
            }
          });
        });
      }
    });
  };
});
