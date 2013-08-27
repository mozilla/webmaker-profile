define(['jquery', 'komponent'], function ($, Komponent) {
  var Tile = function () {};

  Tile.prototype = new Komponent();

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

    self.$btnUp.on('click', function () {
      console.log('up');
    });

    self.$btnDown.on('click', function () {
      console.log('down');
    });

    self.$btnDelete.on('click', function () {
      self.destroy();
    });
  };

  Tile.prototype.update = function (content) {
    var self = this;

    self.fire('update', {
      content: content
    });

    self.fire('resize');
  };

  Tile.prototype.destroy = function () {
    var self = this;

    self.fire('destroy');
    self.$target.remove();
  };

  Tile.prototype.showReorderButtons = function () {
    var self = this;

    self.$movementArrows.show();
    self.areReorderButtonsVisible = true;
    self.fire('resize');
  };

  Tile.prototype.hideReorderButtons = function () {
    var self = this;

    self.$movementArrows.hide();
    self.areReorderButtonsVisible = false;
    self.fire('resize');
  };

  Tile.prototype.showDeleteButton = function () {
    var self = this;

    self.$btnDelete.show();
    self.isDeleteButtonVisible = true;
    self.fire('resize');
  };

  Tile.prototype.hideDeleteButton = function () {
    var self = this;

    self.$btnDelete.hide();
    self.isDeleteButtonVisible = false;
    self.fire('resize');
  };

  return Tile;
});
