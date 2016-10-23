var manager = require('manager');

/**
 * Arquitext
 */
var arquitect = {
  /**
   * Plan the next buildings.
   */
  plan: function() {
    // set some variables
    var minConstructionSites = 5;
    var maxConstructionSites = 10;
    var structures = Game.spawns.Base.room.find(FIND_STRUCTURES);
    var constructionSites = Game.spawns.Base.room.find(FIND_CONSTRUCTION_SITES);
    var constructionSitesLength = constructionSites.length;
    if (constructionSitesLength < minConstructionSites) {

    }
  },

  /**
  * Save current probes location
  */
  saveCurentProbesLocation: function() {
    var probes = manager.getAllProbes();
    var probesLength = probes.length;
    for (var i = 0; i < probesLength; i++) {
      var pos_x = probes[i].pos.x;
      var pos_y = probes[i].pos.y;

    }
  }
};

module.exports = arquitect;
