define([
  'jquery',
  'komponent',
  'js/device',
  'js/localstrings',
  'config'
], function ($, Komponent, device, localStrings, config) {
  var Tile = function () {};

  Tile.prototype = new Komponent();

  Tile.prototype.init = function () {
    this.callbacks = {};
  };

  /**
   * Set up element references and binding for UI shared by all tiles
   * @param  {object} target The wrapper element for the tile
   * @return {undefined}
   */
  Tile.prototype.bindCommonUI = function (target) {
    var self = this;

    // Element references -----------------------------------------------------

    self.$target = $(target);
    self.$movementArrows = self.$target.find('.movement-arrows');
    self.$btnUp = self.$target.find('.tile-up');
    self.$btnDown = self.$target.find('.tile-down');
    self.$btnDelete = self.$target.find('.delete');
    self.$privacyToggle = self.$target.find('.privacyToggle');
    self.$privacyCheckbox = self.$target.find('.privacyToggle .privacy');

    // Properties -------------------------------------------------------------

    self.areReorderButtonsVisible = false;
    self.isDeleteButtonVisible = false;
    self.isPrivate = undefined;

    // Setup ------------------------------------------------------------------

    if (device.getProperties().isSmallScreen) {
      self.showReorderButtons();
    } else {
      self.hideReorderButtons();
    }

    self.bindRender();

    // Event Delegation -------------------------------------------------------

    // TODO : Move up/down button code from tiles.js here (as much as possible)
    self.$btnUp.on('click', function () {
      // TODO
    });

    self.$btnDown.on('click', function () {
      // TODO
    });

    self.$btnDelete.on('click', function () {
      if (!config.confirmDelete || window.confirm(localStrings.get('confirmDelete'))) {
        self.destroy();
      }
    });

    device.on('resize', function (event) {
      if (event.isSmallScreen) {
        self.showReorderButtons();
      } else {
        self.hideReorderButtons();
      }
    });

    self.$privacyToggle.on('mousedown touchstart', function (event) {
      event.stopPropagation();
    });

    self.$privacyCheckbox.on('change', function () {
      if (self.$privacyCheckbox[0].checked) {
        self.setPrivacy(true);
      } else {
        self.setPrivacy(false);
      }
    });
  };

  /**
   * Fire a 'rendered' event when all a tiles contents are loaded.
   * @param  {Object} contents Either native element or jQuery collection
   *                           to parse and find imgs to bind load events to.
   * @return {undefined}
   */
  Tile.prototype.bindRender = function (contents) {
    var self = this;

    var $images;

    if (contents) {
      // Grab images at any level of the tree
      $images = $(contents).filter('img').add($(contents).find('img'));
    } else {
      // Look inside tile container if no contents are specified
      $images = self.$target.find('img');
    }

    var imageCount = $images.length;
    var imagesLoaded = 0;

    if (imageCount) {
      $images.each(function () {
        $(this).bind('load', function () {
          imagesLoaded++;

          if (imagesLoaded === imageCount) {
            self.fire('rendered');
          }
        });
      });
    } else {
      self.fire('rendered');
    }
  };

  /**
   * Toggle the privacy of a tile
   * @param {Boolean} isPrivate Target privacy mode for tile
   * @return {undefined}
   */
  Tile.prototype.setPrivacy = function (isPrivate) {
    var self = this;

    if (typeof isPrivate === 'boolean') {
      self.fire('privacyChange', {
        isPrivate: isPrivate
      });

      // Update UI (if necessary)
      if (self.$privacyCheckbox[0].checked !== isPrivate) {
        self.$privacyCheckbox.attr('checked', isPrivate);
      }

      if (isPrivate) {
        self.$target.addClass('private');
      } else {
        self.$target.removeClass('private');
      }

      self.isPrivate = isPrivate;
    }
  };
  /**
   * Common code to run when a tile content is updated
   * @param  {string} content The stringified content of the tile
   * @return {undefined}
   */
  Tile.prototype.update = function (content) {
    var self = this;

    self.fire('update', {
      content: content
    });

    self.fire('resize');
  };
  /**
   * Destroy the tile
   * @return {undefined}
   */
  Tile.prototype.destroy = function () {
    var self = this;

    self.fire('destroy');
  };
  /**
   * Show the reordering buttons
   * @return {undefined}
   */
  Tile.prototype.showReorderButtons = function () {
    var self = this;

    self.$movementArrows.show();
    self.areReorderButtonsVisible = true;
    self.fire('resize');
  };
  /**
   * Hide redordering buttons
   * @return {undefined}
   */
  Tile.prototype.hideReorderButtons = function () {
    var self = this;

    self.$movementArrows.hide();
    self.areReorderButtonsVisible = false;
    self.fire('resize');
  };
  /**
   * Show delete button
   * @return {undefined}
   */
  Tile.prototype.showDeleteButton = function () {
    var self = this;

    self.$btnDelete.show();
    self.isDeleteButtonVisible = true;
    self.fire('resize');
  };
  /**
   * Hide delete button
   * @return {undefined}
   */
  Tile.prototype.hideDeleteButton = function () {
    var self = this;

    self.$btnDelete.hide();
    self.isDeleteButtonVisible = false;
    self.fire('resize');
  };

  return Tile;
});
