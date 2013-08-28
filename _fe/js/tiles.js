define([
  'jquery',
  'templates',
  'packery/js/packery',
  'imagesloaded',
  'draggabilly/draggabilly',
  'js/hackable-tile',
  'js/photobooth-tile',
  'lodash',
  'js/database'
], function (
  $,
  templates,
  Packery,
  imagesLoaded,
  Draggabilly,
  HackableTile,
  PhotoBoothTile,
  _,
  db
) {
  return {
    init: function (target) {
      var self = this;

      // Element references -----------------------------------------------------

      self.$container = $(target);
      self.$tiles = $('.tiles');
      self.$addTile = $('#add-tile');

      // Tile Selector
      self.$tileSelector = $(templates.selectorTile());
      self.$btnPhoto = self.$tileSelector.find('.photo');
      self.$btnHackable = self.$tileSelector.find('.hackable');

      // Properties -------------------------------------------------------------

      self.isSelectorVisible = false;

      // Setup ------------------------------------------------------------------

      self.packery = new Packery(self.$container[0], {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        itemSelector: '.tile'
      });

      // Event Delegation -------------------------------------------------------
      self.packery.on('dragItemPositioned', function () {
        self.packery.layout();
        self.storeOrder();
      });

      self.$addTile.on('click', function (event) {
        event.preventDefault();

        if (!self.isSelectorVisible) {
          self.showSelectorTile();
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
        self.hideSelectorTile();
      });

      self.$btnHackable.on('click', function () {
        self.addHackableTile();
        self.hideSelectorTile();
      });
    },
    /**
     * Show tile type selector UI
     * @return {undefined}
     */
    showSelectorTile: function () {
      var self = this;

      self.$tiles.prepend(self.$tileSelector);
      self.addAndBindDraggable(self.$tileSelector[0], true);
      self.packery.layout();
      self.isSelectorVisible = true;
    },
    /**
     * Hide tile type selector UI
     * @return {undefined}
     */
    hideSelectorTile: function () {
      var self = this;

      self.$tileSelector.detach();
      self.isSelectorVisible = false;
      self.packery.remove(self.$tileSelector[0]);
    },
    /**
     * Make an element draggable
     * @param  {object} element Native tile element reference
     * @param  {boolean} isPrepended If true, prepend the element
     * @return {object} element parameter
     */
    addAndBindDraggable: function (element, isPrepended) {
      var self = this;
      var method = isPrepended ? 'prepended' : 'appended';

      self.packery[method](element);
      self.packery.bindDraggabillyEvents(new Draggabilly(element));

      return element;
    },
    /**
     * Create a hackable tile and append it
     * @return {undefined}
     */
    addHackableTile: function (tile) {
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
        self.packery.layout();
      });

      hackableTile.on('update', function (event) {
        db.storeTileMake({
          id: UUID,
          content: event.content
        });
      });
    },
    /**
     * Create a photo tile and append it
     * @return {undefined}
     */
    addPhotoBooth: function () {
      var self = this;
      var $photoBooth = $(templates.photoboothTile());
      var photoBooth = new PhotoBoothTile($photoBooth[0]);

      self.$tiles.prepend($photoBooth);
      photoBooth.init();

      photoBooth.on('resize', function () {
        self.packery.layout();
      });

      photoBooth.on('destroy', function () {
        self.packery.layout();
      });

      self.packery.prepended($photoBooth[0]);
      self.packery.layout();
    },
    /**
     * Render HTML for tiles and create masonry layout
     * @param  {array} data Array of makes (see fake.json for schema)
     * @return {undefined}
     */
    render: function (data) {
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
          var tileTemplate = templates[tile.type + 'Tile'] || templates.defaultTile;
          var $tile = $(tileTemplate(tile));

          $tile.data('id', tile.id);
          self.$container.append($tile);
          self.addAndBindDraggable($tile[0]);
        } else if (tile.type === 'hackable') {
          self.addHackableTile(tile);
        }
      });

      // Run packery layout after all images have loaded
      var imgLoaded = imagesLoaded(self.container);

      imgLoaded.on('always', function () {
        $('.loader').hide();
        self.packery.layout();
      });
    },
    /**
     * Extract specified order of make tiles from DOM
     * @return {Array} Array of make IDs in display order
     */
    calculateOrder: function () {
      var self = this;
      var order = [];
      var tiles = self.packery.getItemElements();

      tiles.forEach(function (tile) {
        if ($(tile).data('id')) {
          order.push($(tile).data('id'));
        }
      });

      return order;
    },
    /**
     * Store order of tiles in local storage (and eventually server side)
     * @return {undefined}
     */
    storeOrder: function () {
      var self = this;

      db.set('tileOrder', self.calculateOrder());
    },
    /**
     * Fetch order of tiles from local storage (and eventually server side)
     * @return {Array} Array of make IDs in display order
     */
    fetchOrder: function () {
      return db.get('tileOrder');
    }
  };
});
