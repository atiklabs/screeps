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
    var minConstructionSites = 2;
    var maxConstructionSites = 5;
    var structures = Game.spawns.Base.room.find(FIND_STRUCTURES);
    var constructionSites = Game.spawns.Base.room.find(FIND_CONSTRUCTION_SITES);
    var constructionSitesLength = constructionSites.length;

    // study
    this.saveCurentProbeLocations();

    // plan roads
    if (constructionSitesLength < minConstructionSites && Game.time%10 === 0) {
      this.planRoad();
    }
  },

  planRoad: function () {
    var roadRoom = null;
    var roadPosX = null;
    var roadPosY = null;
    var maxValue = null;
    for (var room in Memory.arquitect.probe_locations) {
      for (var posX in Memory.arquitect.probe_locations[room]) {
        for (var posY in Memory.arquitect.probe_locations[room][posX]) {
          if (maxValue === null || maxValue < Memory.arquitect.probe_locations[room][posX][posY]) {
            var constructionSiteFound = Game.rooms[room].lookfor(LOOK_CONSTRUCTION_SITES, posX, posY);
            if (constructionSiteFound.length === 0) {
              var structureFound = Game.rooms[room].lookfor(LOOK_STRUCTURES, posX, posY);
              if (structureFound.length === 0) {
                roadRoom = room;
                roadPosX = posX;
                roadPosY = posY;
              }
            }
          }
        }
      }
    }
    Game.rooms[room].createConstructionSite(roadPosX, roadPosY, STRUCTURE_ROAD);
    console.log('Construction site created [road]: ' + roadPosX + ', ' + roadPosY);
  },

  /**
  * Save current probes location
  */
  saveCurentProbeLocations: function() {
    var probes = manager.getAllProbes();
    var probesLength = probes.length;
    for (var i = 0; i < probesLength; i++) {
      var room = probes[i].room.name;
      var posX = probes[i].pos.x;
      var posY = probes[i].pos.y;
      if (typeof Memory.arquitect.probe_locations[room] == 'undefined') {
        Memory.arquitect.probe_locations[room] = {};
      }
      if (typeof Memory.arquitect.probe_locations[room][posX] == 'undefined') {
        Memory.arquitect.probe_locations[room][posX] = {};
      }
      if (typeof Memory.arquitect.probe_locations[room][posX][posY] == 'undefined') {
        Memory.arquitect.probe_locations[room][posX][posY] = 0;
      }
      Memory.arquitect.probe_locations[room][posX][posY]++;
    }
  }
};

module.exports = arquitect;
