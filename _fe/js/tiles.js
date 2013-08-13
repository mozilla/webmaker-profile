define(['jquery', 'templates', 'jqueryui', ], function($, templates) {
  return {
    init: function() {
      $('.sortable').sortable( { revert: true });
      $('.tiles').draggable( { handle: '.handle' } );
    },
    render: function(data) {
      var tileString = '';
      data.forEach(function (tile, i) {
        // TODO: Some type checking
        var tileTemplate = templates[tile.type + 'Tile' ] || templates.defaultTile;
        tileString += tileTemplate(tile);
      });
      return tileString;
    }
  };
});
