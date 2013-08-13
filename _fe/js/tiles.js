define(['jquery', 'js/templates', 'masonry', 'js/hackable-tile', 'jqueryui'], function($, templates, masonry, HackableTile) {
  return {
    init: function () {
      var self = this;

      // Element references -----------------------------------------------------

      self.$sortable = $('.sortable');
      self.$tiles = $('.tiles');
      self.$addTile = $('#add-tile');

      // Properties -------------------------------------------------------------

      // Setup ------------------------------------------------------------------

      self.$sortable.sortable({
        revert: true
      });

      self.$tiles.draggable({
        handle: '.handle'
      });

      // Event Delegation -------------------------------------------------------

      self.$addTile.on('click', function (event) {
        event.preventDefault();
        self.addHackableTile();
      });
    },
    addHackableTile: function () {
      var self = this;
      var $hackableTile = $('<li class="tile webmaker hackable"></li>');
      var hackableTile = new HackableTile($hackableTile);

      self.$tiles.prepend($hackableTile);
    },
    render: function (data) {
      var self = this;
      var tileString = '';

      data.forEach(function (tile, i) {
        // TODO: Some type checking
        var tileTemplate = templates[tile.type + 'Tile'] || templates.defaultTile;
        tileString += tileTemplate(tile);
      });

      return tileString;
    }
  };
});
