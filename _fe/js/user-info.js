define([
  'jquery',
  'js/tile',
  'js/render'
], function ($, Tile, render) {

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
    self.$descriptionInput = self.$wrapper.find('[name="description"]');
    self.$descriptionOutput = self.$wrapper.find('.description-output');
    self.$linkList = self.$wrapper.find('.link-list');
    self.$linkInput = self.$wrapper.find('[name="link-url"]');
    self.$addLinkButton = self.$wrapper.find('.add');
    self.$makesNum = self.$wrapper.find('.makes-number');
    self.$likesNum = self.$wrapper.find('.likes-number');

    // Properties -------------------------------------------------------------

    self.linkUrls = [];

    // Setup ------------------------------------------------------------------

    self.$addLinkButton.on('click', function () {
      self.addLink();
    });

    // Add links when user presses enter inside link input
    self.$linkInput.on('keypress', function (event) {
      if (event.keyCode === 13) {
        self.addLink();
      }
    });

    // Event Delegation -------------------------------------------------------
  };

  UserInfo.prototype = new Tile();

  UserInfo.prototype.showEditor = function () {
    var self = this;

    self.$wrapper.addClass('editing');
    self.fire('resize');
  };

  UserInfo.prototype.checkUrl = function (url) {
    // TODO: Check url, choose icon/title based on type
    // var REGEX_MAP = {
    //   twitter: 'twitter\.com/[\d[a-zA-Z0-9_]+',
    //   tumblr: 'tumblr\.com'
    // };
    return {
      icon: 'icon-link',
      url: url,
      title: url
    };
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
    self.$wrapper.removeClass('editing');
  };

  UserInfo.prototype.update = function (data, saveData) {
    var self = this;

    data = data || {};

    if (data.description) {
      self.$descriptionInput.val(data.description);
      self.$descriptionOutput.html(data.description);
    }

    self.updateMetaData(data);

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

  UserInfo.prototype.updateMetaData = function (data) {
    var makes = data.makes || {};
    var numOfMakes = makes.length || 0;
    var likes = 0;
    if (numOfMakes) {
      likes = makes.reduce(function (prev, current) {
        return prev + (current.likes ? current.likes.length : 0);
      }, 0);
    }

    this.$makesNum.html(numOfMakes);
    this.$likesNum.html(likes);
  };

  return UserInfo;

});
