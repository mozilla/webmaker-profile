define([
  'jquery',
  'store',
  'lodash',
  'uuid',
  'komponent',
], function (
  $,
  store,
  _,
  uuid,
  Komponent
) {

  var db = {
    /**
     * Initialize database by fetching JSON from service
     * @return {undefined}
     */
    init: function (username) {
      var blob;

      $.ajax({
        url: 'http://localhost:8080/user-data/' + username,
        type: 'GET',
        dataType: 'json'
      })
        .done(function (data) {
          blob = data;

          for (var key in blob) {
            // Only populate missing keys (eventually stale keys should be replaced)
            if (!store.get(key)) {
              store.set(key, blob[key]);
            }
          }

          db.fire('load');
        });
    },
    /**
     * Get the value of a key from local storage
     * @param  {string} key
     * @return {*}
     */
    get: function (key) {
      return store.get(key);
    },
    /**
     * Set the value of a key in local storage
     * @param  {string} key
     * @param  {*} value
     * @return {undefined}
     */
    set: function (key, value) {
      store.set(key, value);
    },
    /**
     * Store a new tile or update an existing tile record
     * @param  {object} tile An object with at least an 'id' property
     * @return {undefined}
     */
    storeTileMake: function (tile) {
      if (typeof tile.id === 'undefined') {
        throw ('Tile must have ID property for storage.');
      }

      var makes = store.get('makes');
      var existingMake = _.find(makes, {
        id: tile.id
      });

      if (typeof existingMake !== 'undefined') {
        existingMake = _.merge(existingMake, tile);
      } else {
        makes.push(tile);
      }

      store.set('makes', makes);
    },
    /**
     * Destroy a make in the database
     * @param  {string} id Make UUID
     * @return {undefined}
     */
    destroyTileMake: function (id) {
      store.set('makes', _.reject(store.get('makes'), {
        id: id
      }));
    },
    /**
     * Fetch a specific make record
     * @param  {string} id UUID of make
     * @return {object} Make object
     */
    getMakeById: function (id) {
      return _.find(store.get('makes'), {
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

      store.get('makes').forEach(function (make) {
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
