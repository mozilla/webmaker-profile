define([
  'jquery',
  'lodash',
  'uuid',
  'komponent',
  'config',
  'jquery-debounce'
], function (
  $,
  _,
  uuid,
  Komponent,
  config
) {

  var storage = {}; // Session-only storage

  var db = {
    /**
     * Initialize database by fetching JSON from service
     * @return {undefined}
     */
    init: function (username) {
      this.username = username;

      $.ajax({
        xhrFields: {
          withCredentials: true
        },
        url: config.serviceURL + '/user-data/' + this.username,
        type: 'GET',
        dataType: 'json',
        crossDomain: true
      })
        .done(function (data) {
          storage = data;
          db.fire('load');
        });
    },
    /**
     * Get the value of a key from local storage
     * @param  {string} key
     * @return {*}
     */
    get: function (key) {
      return storage[key];
    },
    /**
     * Internal save function, set to batch data every 5 seconds
     * @return {undefined}
     */
    _save: $.debounce(5000, function () {
      $.ajax({
        xhrFields: {
          withCredentials: true
        },
        url: config.serviceURL + '/user-data/' + this.username,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        crossDomain: true,
        data: JSON.stringify(storage)
      })
        .done(function () {
          db.fire('setSuccess');
        })
        .fail(function () {
          db.fire('setError');
        })
        .always(function () {
          db.fire('setComplete');
        });
    }),
    /**
     * Set the value of a key in local storage & server
     * @param  {string} key
     * @param  {*} value
     * @return {undefined}
     */
    set: function (key, value) {
      // Persist to local storage
      storage[key] = value;

      // Queue batched save
      this._save();
    },
    /**
     * Store a new tile or update an existing tile record
     * @param  {object} tile An object with at least an 'id' property
     * @return {undefined}
     */
    storeTileMake: function (tile) {
      // Don't store null value in tiles
      if (tile.content === null) {
        tile.content = '';
      }

      if (typeof tile.id === 'undefined') {
        throw ('Tile must have ID property for storage.');
      }

      var makes = storage.makes;
      var existingMake = _.find(makes, {
        id: tile.id
      });

      if (typeof existingMake !== 'undefined') {
        existingMake = _.merge(existingMake, tile);
      } else {
        makes.push(tile);
      }

      db.set('makes', makes);
    },
    /**
     * Destroy a make in the database
     * @param  {string} id Make UUID
     * @return {undefined}
     */
    destroyTileMake: function (id) {
      db.set('makes', _.reject(storage.makes, {
        id: id
      }));
    },
    /**
     * Fetch a specific make record
     * @param  {string} id UUID of make
     * @return {object} Make object
     */
    getMakeById: function (id) {
      return _.find(storage.makes, {
        id: id
      });
    },

    // This is temporary until we get server persistence
    // Most likely we'll need a web service to give us a real UUID

    /**
     * Generate a UUID
     * @return {string} UUID
     */
    generateFakeUUID: function () {
      var existingIDs = [];
      var UUID;
      var idExists;

      storage.makes.forEach(function (make) {
        existingIDs.push(make.id);
      });

      // Make sure UUID isn't already used
      do {
        idExists = false;
        UUID = uuid.v4();

        for (var i = 0, ii = existingIDs.length; i < ii; i += 1) {
          if (UUID === existingIDs[i]) {
            idExists = true;
            break;
          }
        }
      } while (idExists);

      return UUID;
    }
  };

  Komponent.mix(db);

  return db;
});
