define([
  'store',
  'lodash',
  'uuid',
  'text!json/fake.json'
], function (store, _, uuid, fakeData) {

  // Eventually this will be pulled from a service
  //  or inlined on index in a JSON script block
  var blob = JSON.parse(fakeData);

  for (var key in blob) {
    // Only populate missing keys (eventually stale keys should be replaced)
    if (typeof store.get(key) === 'undefined') {
      store.set(key, blob[key]);
      console.log('Populating: ' + key);
    }
  }

  var db = {
    get: function (key) {
      return store.get(key);
    },
    set: function (key, value) {
      store.set(key, value);
    },
    storeTileMake: function (tile) {
      var makes = store.get('makes');

      // todo - check for existing tile and update it
      makes.push(tile);
      store.set('makes', makes);
    },
    updateTileMake: function (id, key, value) {

    },
    getMakeById: function (id) {
      return _.find(store.get('makes'), {
        id: id
      });
    },
    // This is temporary until we get server persistence
    // Most likely we'll need a web service to give us a fresh UUID
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

  return db;
});
