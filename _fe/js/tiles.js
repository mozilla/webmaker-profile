define(['jquery', 'templates', 'jqueryui', ], function($, templates) {
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

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
