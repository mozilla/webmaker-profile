define([
  'jquery',
  'js/tile',
  'js/render',
  'lodash'
], function ($, Tile, render, _) {

  var UserInfo = function (target, options) {
    var self = this;
    var defaults;
    var option;

    self.callbacks = {};

    // Options ----------------------------------------------------------------

    defaults = {};

    for (option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    self.options = defaults;

    // Element references -----------------------------------------------------

    self.$wrapper = $(target);
    self.$editButton = self.$wrapper.find('.edit');
    self.$descriptionInput = self.$wrapper.find('[name="description"]');
    self.$descriptionOutput = self.$wrapper.find('.description-output');
    self.$saveButton = self.$wrapper.find('.save');
    self.$linkList = self.$wrapper.find('.link-list');
    self.$linkInput = self.$wrapper.find('[name="link-url"]')
    self.$addLinkButton = self.$wrapper.find('.add');

    // Properties -------------------------------------------------------------

    self.linkUrls = [];

    // Setup ------------------------------------------------------------------

    self.$wrapper.attr('data-editing', false);

    self.$editButton.on('click', function () {
      self.showEditor();
    });

    self.$saveButton.on('click', function () {
      self.save();
    });

    self.$addLinkButton.on('click', function () {
      self.addLink();
    });

    // Event Delegation -------------------------------------------------------
  };

  UserInfo.prototype = new Tile();

  UserInfo.prototype.showEditor = function () {
    var self = this;

    self.$editButton.addClass('disabled');
    self.$wrapper.attr('data-editing', true);
    self.fire('resize');
  };

  UserInfo.prototype.checkUrl = function (url) {
    // TODO: Check url, choose icon/title based on type
    var REGEX_MAP = {
      twitter: 'twitter\.com/[\d[a-zA-Z0-9_]+',
      tumblr: 'tumblr\.com'
    };
    return {
      icon: 'icon-link',
      url: url,
      title: url
    }
  };

  UserInfo.prototype.addLink = function () {
    var self = this;
    var url = self.$linkInput.val();
    if (!url) {
      return;
    }
    var linkData = self.checkUrl(url);
    self.linkUrls.push(linkData);
    self.update();
  };

  UserInfo.prototype.removeLink = function (obj) {
    var self = this;
    var position = self.linkUrls.indexOf(obj);
    if (position > -1) {
      self.linkUrls.splice(position, 1);
    }
    self.update();
  };

  UserInfo.prototype.renderLinks = function () {
    var self = this;
    var $newLinkElement;

    self.$linkList.empty();
    self.linkUrls.forEach(function (linkUrl) {

      $newLinkElement = $(render('link-item', {
        link: linkUrl
      }));

      $newLinkElement.find('.remove').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        self.removeLink(linkUrl);
      });

      self.$linkList.append($newLinkElement);
    });
  };

  UserInfo.prototype.save = function () {
    var self = this;
    var data = {};

    data.description = self.$descriptionInput.val();
    data.linkUrls = self.linkUrls;
    self.update(data, true);
    self.$editButton.removeClass('disabled');
    self.$wrapper.attr('data-editing', false);
  }

  UserInfo.prototype.update = function (data, saveData) {
    var self = this;

    data = data || {};

    if (data.description) {
      self.$descriptionInput.val(data.description);
      self.$descriptionOutput.html(data.description);
    }

    if (data.linkUrls) {
      self.linkUrls = data.linkUrls;
    }

    self.renderLinks();
    self.$linkInput.val('');

    if (saveData) {
      Tile.prototype.update.call(self, data);
    } else {
      self.fire('resize');
    }

  };

  return UserInfo;

});
