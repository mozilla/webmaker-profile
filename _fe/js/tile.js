define(['jquery', 'komponent'], function ($, Komponent) {
  var Tile = function () {};

  Tile.prototype = new Komponent();

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

    // Properties -------------------------------------------------------------

    self.areReorderButtonsVisible = false;
    self.isDeleteButtonVisible = false;

    // Event Delegation -------------------------------------------------------

    // TODO : Move up/down button code from tiles.js here (as much as possible)
    self.$btnUp.on('click', function () {
      // TODO
    });

    self.$btnDown.on('click', function () {
      // TODO
    });

    self.$btnDelete.on('click', function () {
      self.destroy();
    });
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
    self.$target.remove();
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
