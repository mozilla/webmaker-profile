define([
  'jquery',
  'templates',
  'packery/js/packery',
  'imagesloaded',
  'draggabilly/draggabilly',
  'js/tile',
  'js/hackable-tile',
  'js/photobooth-tile',
  'lodash',
  'js/database',
  'komponent'
], function (
  $,
  templates,
  Packery,
  imagesLoaded,
  Draggabilly,
  Tile,
  HackableTile,
  PhotoBoothTile,
  _,
  db,
  Komponent
) {

  var tiles = new Komponent();

  tiles.init = function (target) {
    var self = this;

    self.callbacks = {};

    // Element references -----------------------------------------------------

    self.$container = $(target);
    self.$tiles = $('.tiles');
    self.$editButton = $('.edit-mode');

    // Tile Selector
    self.$tileSelector = $(templates.selectorTile());
    self.$btnPhoto = self.$tileSelector.find('.photo');
    self.$btnHackable = self.$tileSelector.find('.hackable');

    // Properties -------------------------------------------------------------

    self.isEditMode = false;

    // Setup ------------------------------------------------------------------

    self.packery = new Packery(self.$container[0], {
      columnWidth: '.grid-sizer',
      gutter: '.gutter-sizer',
      itemSelector: '.tile'
    });

    // Attach the tile selector before the tile list
    self.$container.before(self.$tileSelector);

    // Event Delegation -------------------------------------------------------
    self.packery.on('dragItemPositioned', function () {
      self.packery.layout();
      self.storeOrder();
    });

    self.$editButton.on('click', function (event) {
      event.preventDefault();

      if (self.isEditMode) {
        self.fire('editing-off');
      } else {
        self.fire('editing-on');
      }
    });

    self.on('editing-on', function (event) {
      self.$tileSelector.show();
      self.isEditMode = true;
      self.$editButton.text('Save');
    });

    self.on('editing-off', function (event) {
      self.$tileSelector.hide();
      self.isEditMode = false;
      self.$editButton.text('Edit');
    });

    // TODO - use Tile's bindCommonUI to handle DOM events for Tile UI (?)

    self.$tiles.on('click', '.tile-up', function (e) {
      var currentTile = $(e.target).parents('.tile')[0];
      var items = self.packery.items;
      var originalIndex = $.inArray(self.packery.getItem(currentTile), items);
      var newIndex = originalIndex - 1;

      if (newIndex !== -1) {
        items.splice(newIndex, 0, items.splice(originalIndex, 1)[0]);
        self.packery.layout();
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
        self.packery.layout();
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
   * @return {undefined}
   */
  tiles.addHackableTile = function (tile) {
    var self = this;

    // TODO - eliminate this HTML string; use jade
    var $hackableTile = $('<div class="tile hackable"></div>');
    var hackableTile = new HackableTile($hackableTile);

    var UUID = (typeof tile !== 'undefined' ? tile.id : db.generateFakeUUID());

    if (typeof tile === 'undefined') {
      db.storeTileMake({
        id: UUID,
        tool: 'profile',
        type: 'hackable',
        content: null
      });
    }

    self.$container.append($hackableTile);

    if (typeof tile === 'undefined') {
      hackableTile.showEditor();
      self.addAndBindDraggable($hackableTile[0], true);
    } else {
      hackableTile.update(tile.content);
      self.addAndBindDraggable($hackableTile[0]);
    }

    // For order tracking purposes
    $hackableTile.data('id', UUID);

    self.packery.layout();

    if (typeof tile === 'undefined') {
      self.storeOrder();
    }

    // Event Delegation -------------------------------------------------------

    // Reflow Packery when the hackable tile's layout changes
    hackableTile.on('resize', function () {
      self.packery.layout();
    });

    // Reflow Packery when tile is destroyed
    hackableTile.on('destroy', function () {
      self.packery.remove($hackableTile[0]);
      $hackableTile.remove();
      self.storeOrder();
      db.destroyTileMake(UUID);
      self.packery.layout();
    });

    hackableTile.on('update', function (event) {
      db.storeTileMake({
        id: UUID,
        content: event.content
      });
    });
  };
  /**
   * Create a photo tile and append it
   * @return {undefined}
   */
  tiles.addPhotoBooth = function () {
    var self = this;
    var $photoBooth = $(templates.photoboothTile());
    var photoBooth = new PhotoBoothTile($photoBooth[0]);
    // var UUID;

    // Tiles are too big right now to store
    // if (tile) {
    //   UUID = tile.id;
    //   photoBooth.update(tile.content)
    // } else {
    //   UUID = db.generateFakeUUID();
    //   db.storeTileMake({
    //     id: UUID,
    //     tool: 'profile',
    //     type: 'photo',
    //     content: null
    //   });
    // }

    self.$tiles.prepend($photoBooth);
    self.addAndBindDraggable($photoBooth[0], true);
    self.storeOrder();
    photoBooth.init();
    self.packery.layout();

    photoBooth.on('resize', function () {
      self.packery.layout();
    });

    photoBooth.on('destroy', function () {
      self.packery.layout();
    });

    photoBooth.on('update', function () {
      // Need to upload to S3 or something before we can do this

      // db.storeTileMake({
      //   id: UUID,
      //   content: event.content.firstFrame
      // });
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

    // Render HTML for tiles
    data.forEach(function (tile) {
      if (tile.type === 'popcorn' || tile.type === 'thimble') {
        var tileTemplate = templates[tile.type + 'Tile'];
        var $tile = $(tileTemplate(tile));

        $tile.data('id', tile.id);
        self.$container.append($tile);
        self.addAndBindDraggable($tile[0]);

        var genericTile = new Tile();
        genericTile.init();
        genericTile.bindCommonUI($tile);
      } else if (tile.type === 'hackable') {
        self.addHackableTile(tile);
      }
    });

    // Run packery layout after all images have loaded
    var imgLoaded = imagesLoaded(self.$container[0]);

    imgLoaded.on('always', function () {
      $('.loader').hide();
      self.packery.layout();
    });
  };
  /**
   * Extract specified order of make tiles from DOM
   * @return {Array} Array of make IDs in display order
   */
  tiles.calculateOrder = function () {
    var self = this;
    var order = [];
    var tiles = self.packery.getItemElements();

    tiles.forEach(function (tile) {
      if ($(tile).data('id')) {
        order.push($(tile).data('id'));
      }
    });

    return order;
  };
  /**
   * Store order of tiles in local storage (and eventually server side)
   * @return {undefined}
   */
  tiles.storeOrder = function () {
    var self = this;

    db.set('tileOrder', self.calculateOrder());
  };
  /**
   * Fetch order of tiles from local storage (and eventually server side)
   * @return {Array} Array of make IDs in display order
   */
  tiles.fetchOrder = function () {
    return db.get('tileOrder');
  };
  return tiles;
});
