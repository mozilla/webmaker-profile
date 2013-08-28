define([
  'jquery',
  'templates',
  'packery/js/packery',
  'imagesloaded',
  'draggabilly/draggabilly',
  'js/hackable-tile',
  'js/photobooth-tile',
  'store',
  'lodash',
  'jqueryui'
], function (
  $,
  templates,
  Packery,
  imagesLoaded,
  Draggabilly,
  HackableTile,
  PhotoBoothTile,
  store,
  _
) {
  return {
    init: function (options) {
      options = options || {};
      var self = this;

      // Element references -----------------------------------------------------

      self.container = options.container;
      self.$tiles = $('.tiles');
      self.$addTile = $('#add-tile');

      // Tile Selector
      self.$tileSelector = $(templates.selectorTile());
      self.$btnPhoto = self.$tileSelector.find('.photo');
      self.$btnHackable = self.$tileSelector.find('.hackable');

      // Properties -------------------------------------------------------------

      self.isSelectorVisible = false;

      // Setup ------------------------------------------------------------------

      self.packery = new Packery(options.container, {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        itemSelector: '.tile'
      });

      // Event Delegation -------------------------------------------------------
      self.packery.on('dragItemPositioned', function() {
        self.packery.layout();
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

      self.packery.on('dragItemPositioned', function () {
        self.storeOrder();
      });
    },
    /**
     * Show tile type selector UI
     * @return {undefined}
     */
    showSelectorTile: function () {
      var self = this;

      self.$tiles.prepend(self.$tileSelector);
      self.addAndBindDraggable(self.$tileSelector[0], 'prepended');
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
    },
    /**
     * Make an element draggable
     * @param  {object} element Native tile element reference
     * @param  {string} method  'prepended' or 'appended'
     * @return {object} element parameter
     */
    addAndBindDraggable: function (element, method) {
      var self = this;
      // Prepended or appended?
      method = ['prepended', 'appended'].indexOf(method) > -1 ? method : 'appended';

      self.packery[method](element);

      var isMobile = $('.mobile').css('display') !== 'none';
      var draggie;

      if (isMobile === false) {
        draggie = new Draggabilly(element);
        self.packery.bindDraggabillyEvents(draggie);
      }

      return element;
    },
    /**
     * Create a hackable tile and append it
     * @return {undefined}
     */
    addHackableTile: function () {
      var self = this;

      // TODO - eliminate this HTML string; use jade
      var $hackableTile = $('<div class="tile webmaker hackable"></div>');
      var hackableTile = new HackableTile($hackableTile);

      // Reflow Packery when the hackable tile's layout changes
      hackableTile.on('resize', function () {
        self.packery.layout();
      });

      // Reflow Packery when tile is destroyed
      hackableTile.on('destroy', function () {
        self.packery.layout();
      });

      self.$tiles.prepend($hackableTile);
      hackableTile.showEditor();
      self.addAndBindDraggable($hackableTile[0], 'prepended');
      self.packery.layout();
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
      var tileString = self.container.innerHTML;
      var tiles;

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
        // TODO: Some type checking
        var tileTemplate = templates[tile.type + 'Tile'] || templates.defaultTile;
        tileString += tileTemplate(tile);
      });

      self.container.innerHTML = tileString;
      tiles = self.container.querySelectorAll('.tile');

      for (var i = 0, ii = tiles.length; i < ii; i++) {
        self.addAndBindDraggable(tiles[i]);
        // Store id on element to use for persisting sort order
        $(tiles[i]).data('id', data[i].id);
      }

      // Run packery layout after all images have loaded
      imagesLoaded(self.container, function () {
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
        order.push($(tile).data('id'));
      });

      return order;
    },
    /**
     * Store order of tiles in local storage (and eventually server side)
     * @return {undefined}
     */
    storeOrder: function () {
      var self = this;

      store.set('tileOrder', self.calculateOrder());
    },
    /**
     * Fetch order of tiles from local storage (and eventually server side)
     * @return {Array} Array of make IDs in display order
     */
    fetchOrder: function () {
      return store.get('tileOrder');
    }
  };
});
