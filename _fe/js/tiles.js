define([
  'jquery',
  'js/render',
  'packery/js/packery',
  'imagesloaded',
  'draggabilly/draggabilly',
  'js/tile',
  'js/user-info',
  'js/hackable-tile',
  'js/photobooth-tile',
  'lodash',
  'js/database',
  'js/localstrings',
  'komponent'
], function (
  $,
  render,
  Packery,
  imagesLoaded,
  Draggabilly,
  Tile,
  UserInfo,
  HackableTile,
  PhotoBoothTile,
  _,
  db,
  strings,
  Komponent
) {

  var tiles = new Komponent();

  /**
   * Set up the Tiles component
   * @param  {jQuery || Element} Wrapper element for tiles
   * @return {undefined}
   */

  tiles.init = function (target) {
    var self = this;

    self.callbacks = {};
    self.dynamicTiles = {};
    self.userInfo = {};

    // Element references -----------------------------------------------------

    self.$container = $(target).find('.tiles');
    self.$tiles = $('.tiles');
    self.$editButton = $('.edit-mode');

    // Tile Selector
    self.$tileSelector = $(render('selector-tile'));
    self.$btnPhoto = self.$tileSelector.find('.photo');
    self.$btnHackable = self.$tileSelector.find('.hackable');

    // Properties -------------------------------------------------------------

    self.isEditMode = false;
    self.isLayingOut = false;
    self.tileOrder = [];

    // Setup ------------------------------------------------------------------

    // Hide the add photo button if it isn't supported
    if (!(navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia)) {
      self.$btnPhoto.hide();
    }

    // Create Packery instance
    self.packery = new Packery(self.$container[0], {
      columnWidth: '.grid-sizer',
      gutter: '.gutter-sizer',
      itemSelector: '.tile',
      transitionDuration: '0.3s'
    });

    self.hideTileSelector();

    // Attach the tile selector before the tile list
    self.$container.before(self.$tileSelector);

    // Event Delegation -------------------------------------------------------

    self.packery.on('dragItemPositioned', function () {
      self.doLayout();

      var newOrder = self.calculateOrder();

      if (!_.isEqual(self.tileOrder, newOrder)) {
        self.fire('tileOrderChange', {});
      }

      self.tileOrder = newOrder;
    });

    self.packery.on('layoutComplete', function () {
      self.isLayingOut = false;
    });

    self.on('tileOrderChange', function () {
      self.storeOrder();
    });

    self.$editButton.on('click', function (event) {
      event.preventDefault();

      if (self.isEditMode) {
        self.exitEditMode();
      } else {
        self.enterEditMode();
      }
    });

    // Prevent clicks on tile links in edit mode
    $('body').on('click', '.tile a', function (e) {
      if (self.isEditMode) {
        e.preventDefault();
      }
    });

    // TODO - use Tile's bindCommonUI to handle DOM events for Tile UI (?)

    self.$tiles.on('click', '.tile-up', function (e) {
      var currentTile = $(e.target).parents('.tile')[0];
      var items = self.packery.items;
      var originalIndex = $.inArray(self.packery.getItem(currentTile), items);
      var newIndex = originalIndex - 1;

      if (newIndex !== -1) {
        items.splice(newIndex, 0, items.splice(originalIndex, 1)[0]);
        self.doLayout();
      }

      self.storeOrder();
    });

    self.$tiles.on('click', '.tile-down', function (e) {
      var currentTile = $(e.target).parents('.tile')[0];
      var items = self.packery.items;
      var originalIndex = $.inArray(self.packery.getItem(currentTile), items);
      var newIndex = originalIndex + 1;

      if (newIndex !== items.length) {
        items.splice(newIndex, 0, items.splice(originalIndex, 1)[0]);
        self.doLayout();
      }

      self.storeOrder();
    });

    self.$btnPhoto.on('click', function () {
      self.addPhotoBooth();
    });

    self.$btnHackable.on('click', function () {
      self.addHackableTile();
    });
  };

  /**
   * Show editing UI
   * @return {undefined}
   */

  tiles.enterEditMode = function () {
    var self = this;

    self.showTileSelector();
    self.$editButton.text(strings.get('save'));
    $('body').addClass('edit-mode');
    self.fire('editing-on');
    $('.tile a').addClass('disabled');
    self.userInfo.showEditor();

    for (var key in self.dynamicTiles) {
      self.dynamicTiles[key].enterEditMode();
    }

    self.doLayout();
    self.isEditMode = true;
  };

  /**
   * Hide editing UI
   * @return {undefined}
   */

  // TODO - This is getting called for every hackable tile on page load and shouldn't be.

  tiles.exitEditMode = function () {
    var self = this;

    self.hideTileSelector();
    self.$editButton.text(strings.get('edit'));
    $('body').removeClass('edit-mode');
    self.fire('editing-off');
    $('.tile a').removeClass('disabled');
    self.userInfo.save();

    for (var key in self.dynamicTiles) {
      self.dynamicTiles[key].exitEditMode();
    }

    self.isEditMode = false;
  };

  /**
   * Show tile selector UI
   * @return {undefined}
   */

  tiles.showTileSelector = function () {
    var self = this;

    self.$tileSelector.css('top', '0');
  };

  /**
   * Hide tile selector UI
   * @return {undefined}
   */

  tiles.hideTileSelector = function () {
    var self = this;

    // Must check for element to have height
    // See https://gist.github.com/gvn/6d09cf0470928064fbb2
    var offsetReady = setInterval(function () {
      if (self.$tileSelector.height()) {
        clearTimeout(offsetReady);
        var offset = -1 * (self.$tileSelector.height() + parseInt(self.$tileSelector.css('padding-top'), 10));
        offset -= 10; // Move a little bit higher so UI doesn't peek through
        self.$tileSelector.css('top', offset + 'px');
      }
    }, 1);
  };

  /**
   * Make an element draggable
   * @param  {object} element Native tile element reference
   * @param  {boolean} isPrepended If true, prepend the element
   * @return {object} element parameter
   */

  tiles.addAndBindDraggable = function (element, isPrepended) {
    var self = this;
    var method = isPrepended ? 'prepended' : 'appended';
    var draggie = new Draggabilly(element);

    self.packery[method](element);
    self.packery.bindDraggabillyEvents(draggie);

    if (!self.isEditMode) {
      draggie.disable();
    }

    self.on('editing-on', function () {
      draggie.enable();
    });

    self.on('editing-off', function () {
      draggie.disable();
    });

    return element;
  };

  /**
   * Create a hackable tile and append it
   *  (or recreate stored tile)
   *
   * @param {object} tile Tile record from DB
   * @return {object} Hackable tile instance
   */

  tiles.addHackableTile = function (tile) {
    var self = this;
    var UUID = (typeof tile !== 'undefined' ? tile.id : db.generateFakeUUID());
    var $hackableTile = $('<div class="tile hackable"></div>'); // TODO - eliminate this HTML string; use jade
    var hackableTile = new HackableTile($hackableTile, UUID);

    self.dynamicTiles[UUID] = hackableTile;
    self.$container.append($hackableTile);

    if (typeof tile === 'undefined') {
      hackableTile.showEditor();
      self.addAndBindDraggable($hackableTile[0], true);
    } else {
      hackableTile.update(tile.content);
      self.addAndBindDraggable($hackableTile[0]);
      self.exitEditMode();
    }

    // Event Delegation -------------------------------------------------------

    hackableTile.on('update', function (event) {
      // Don't persist empty tiles
      if (event.content.length) {
        db.storeTileMake({
          id: UUID,
          content: event.content,
          tool: 'profile',
          type: 'hackable',
          isPrivate: hackableTile.isPrivate
        });
      } else {
        db.destroyTileMake(UUID);
      }

      self.storeOrder();
    });

    self.doCommonTileSetup(hackableTile, $hackableTile, UUID, tile);

    return hackableTile;
  };

  /**
   * Create a photo tile and append it
   * @return {Object} Photo tile instance
   */

  tiles.addPhotoBooth = function () {
    var self = this;
    var $photoBooth = $(render('photobooth-tile'));
    var photoBooth = new PhotoBoothTile($photoBooth[0]);
    var UUID = db.generateFakeUUID();

    // Track a reference for API usage later
    self.dynamicTiles[UUID] = photoBooth;

    self.$container.append($photoBooth);
    self.addAndBindDraggable($photoBooth[0], true);

    photoBooth.init();

    // Event Delegation -------------------------------------------------------

    photoBooth.on('imageStored', function (event) {
      db.storeTileMake({
        id: UUID,
        content: '<img src="' + event.href + '">',
        tool: 'profile',
        type: 'hackable', // Photo tiles become hackable tiles in next session (bad?)
        isPrivate: photoBooth.isPrivate
      });

      self.storeOrder();
    });

    self.doCommonTileSetup(photoBooth, $photoBooth, UUID, undefined);

    return photoBooth;
  };

  /**
   * Add a static tile (Popcorn or Thimble make)
   * @param {Object} tile Tile data
   * @return {Object} Tile instance
   */

  tiles.addStaticTile = function (tile) {
    var self = this;
    var $tile = $(render('static-tile', tile));
    var staticTile = new Tile();

    self.$container.append($tile);
    self.addAndBindDraggable($tile[0]);

    staticTile.init();
    staticTile.bindCommonUI($tile);

    self.doCommonTileSetup(staticTile, $tile, tile.id, tile);

    return staticTile;
  };

  /**
   * Perform setup tasks common to all tiles
   * @param  {Object} tile  Tile instance
   * @param  {Object} $tile jQuery Tile container element reference
   * @param  {String} UUID  UUID for tile
   * @param  {Object} data  Tile data
   * @return {undefined}
   */

  tiles.doCommonTileSetup = function (tile, $tile, UUID, data) {
    var self = this;

    if (typeof data !== 'undefined' && (typeof data.isPrivate === 'undefined' || data.isPrivate)) {
      tile.setPrivacy(true);
    } else {
      tile.setPrivacy(false);
    }

    $tile.data('id', UUID); // For order tracking purposes
    self.doLayout();

    // Event Delegation -------------------------------------------------------

    // Reflow Packery when the hackable tile's layout changes
    tile.on('resize', function () {
      self.doLayout();
    });

    tile.on('destroy', function () {
      self.destroyTile($tile);
    });

    tile.on('privacyChange', function (event) {
      db.storeTileMake({
        id: UUID,
        isPrivate: event.isPrivate
      });
    });
  };

  /**
   * Remove a tile from DOM and DB
   * @param  {jQuery Element} $tile
   * @return {undefined}
   */

  tiles.destroyTile = function ($tile) {
    var self = this;

    var UUID = $tile.data('id');

    // Remove from DOM
    self.packery.remove($tile[0]);

    // Remove from DB
    db.destroyTileMake(UUID);

    // Remove local reference
    delete self.dynamicTiles[UUID];

    self.storeOrder();
    self.doLayout();
  };

  /**
   * Create user info tile
   * @return {undefined}
   */

  tiles.addUserInfo = function () {
    var self = this;

    var $userInfo = $(render('user-info'));
    var userInfo = new UserInfo($userInfo[0]);
    var userInfoData = db.get('userInfo') || {};
    self.userInfo = userInfo;
    userInfoData.makes = db.get('makes') || {};

    self.$container.append($userInfo);
    self.packery.stamp($userInfo[0]);
    userInfo.update(userInfoData);

    userInfo.on('resize', function () {
      self.doLayout();
    });

    userInfo.on('update', function (event) {
      self.doLayout();
      db.set('userInfo', event.content);
    });
  };

  /**
   * Render HTML for tiles and create masonry layout
   * @param  {array} data Array of makes (see fake.json for schema)
   * @return {undefined}
   */

  tiles.render = function (data) {
    var self = this;

    // Sort data if a different order has been stored
    var storedOrder = self.fetchOrder() || [];
    var sortedData = [];

    if (storedOrder.length) {
      storedOrder.forEach(function (id) {
        sortedData.push(_.find(data, {
          id: id
        }));
      });

      data = sortedData;
    }

    // Run packery layout after all images have loaded
    var imgLoaded = imagesLoaded(self.$container[0]);

    imgLoaded.on('always', function () {
      $('.loader').hide();
      self.doLayout();
    });

    // Add user info tile first
    self.addUserInfo();

    // Render HTML for tiles
    data.forEach(function (tile) {
      if (tile.type === 'popcorn' || tile.type === 'thimble') {
        self.addStaticTile(tile);
      } else if (tile.type === 'hackable') {
        self.addHackableTile(tile);
      }
    });
  };

  /**
   * Extract specified order of non-empty make tiles from DOM
   * @return {Array} Array of non-empty make IDs in display order
   */

  tiles.calculateOrder = function () {
    var self = this;
    var order = [];
    var tiles = self.packery.getItemElements();

    tiles.forEach(function (tile) {
      var UUID = $(tile).data('id');

      // Track order of only non-dynamic tiles or a dynamic tile with content
      if (!self.dynamicTiles[UUID] || self.dynamicTiles[UUID].getContent()) {
        order.push(UUID);
      }
    });

    return order;
  };

  /**
   * Store order of tiles on server
   * @return {undefined}
   */

  tiles.storeOrder = function () {
    var self = this;

    // Don't store order if layout is still being done
    // This will prevent data corruption from calculateOrder
    if (!self.isLayingOut) {
      db.set('tileOrder', self.calculateOrder());
    }
  };

  /**
   * Fetch order of tiles
   * @return {Array} Array of make IDs in display order
   */

  tiles.fetchOrder = function () {
    return db.get('tileOrder');
  };

  /**
   * Sort tiles to avoid overlap
   * @return {undefined}
   */

  tiles.doLayout = function () {
    var self = this;

    // Rate limit layout calls and also queue up overflow into a single deferred call

    if (!self.doLayoutCalledRecently) {
      self.isLayingOut = true;
      self.packery.layout();
      self.doLayoutCalledRecently = true;
      self.doLayout.layoutOverflows = 0;
    } else {
      self.doLayout.layoutOverflows++;
    }

    setTimeout(function () {
      self.doLayoutCalledRecently = false;

      if (self.doLayout.layoutOverflows) {
        self.doLayout();
      }
    }, 500);
  };

  return tiles;
});
