define(['jquery', 'jqueryui'], function($) {
  return {
    init: function() {
      $('.sortable').sortable( { revert: true });
      $('.tiles').draggable( { handle: '.handle' } );
    }
  };
});
