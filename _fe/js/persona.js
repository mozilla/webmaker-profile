/* global console: false */

// Persona Authentication

define([
  'jquery',
  'config'
], function ($, config) {
  return function initPersona() {
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
        $logout.removeClass('hidden');
        $login.addClass('hidden');
        // until auth is properly implemented, show the edit button
        // $edit.addClass('hidden');
        $edit.removeClass('hidden');
      },
      loggedInOwner: function () {
        $logout.removeClass('hidden');
        $edit.removeClass('hidden');
        $login.addClass('hidden');
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
        $.ajax(config.serviceURL + '/persona/verify', {
          type: 'POST',
          ContentType: 'application/json',
          data: {
            assertion: assertion
          },
          success: function (res) {
            if (res && res.status === 'okay') {
              // csrf.set(res.data.csrf);
              // Eventually we'll need to figure out if
              // the logged in user owns the page so that they can edit.
              if (false) {
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
      },
      onlogout: function () {
        $.ajax(config.serviceURL + '/persona/logout', {
          type: 'POST',
          success: function () {
            // csrf.set('');
            uiState.loggedOut();
          },
          error: function (jqxhr, txtStatus, err) {
            console.error('Error: ' + txtStatus + err ? ' - ' + err : '');
          }
        });
      }
    });
  };
});
