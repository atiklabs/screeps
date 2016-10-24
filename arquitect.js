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
    var minConstructionSites = 4;
    var maxConstructionSites = 10;
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
    var minValue = 100;
    var roadRoom = null;
    var roadPosX = null;
    var roadPosY = null;
    var maxValue = null;
    var constructionSiteFound = null;
    var structureFound = null;
    for (var room in Memory.arquitect.probe_locations) {
      for (var posX in Memory.arquitect.probe_locations[room]) {
        for (var posY in Memory.arquitect.probe_locations[room][posX]) {
          if (maxValue === null || maxValue < Memory.arquitect.probe_locations[room][posX][posY]) {
            posXInt = parseInt(posX);
            posYInt = parseInt(posY);
            if (Memory.arquitect.probe_locations[room][posX][posY] >= minValue) {
              constructionSiteFound = Game.rooms[room].lookForAt(LOOK_CONSTRUCTION_SITES, posXInt, posYInt);
              if (constructionSiteFound.length === 0) {
                structureFound = Game.rooms[room].lookForAt(LOOK_STRUCTURES, posXInt, posYInt);
                if (structureFound.length === 0) {
                  maxValue = Memory.arquitect.probe_locations[room][posX][posY];
                  roadRoom = room;
                  roadPosX = posXInt;
                  roadPosY = posYInt;
                }
              }
            }
          }
        }
      }
    }
    if (maxValue !== null) {
      if (Game.rooms[roadRoom].createConstructionSite(roadPosX, roadPosY, STRUCTURE_ROAD) == OK) {
        console.log('Construction site created [road]: ' + roadPosX + ', ' + roadPosY);
      }
    }
  },

  /**
  * Save current probes location
  */
  saveCurentProbeLocations: function() {
    var probes = manager.getAllProbes();
    var probesLength = probes.length;
    for (var i = 0; i < probesLength; i++) {
      if (probes[i].fatigue === 0) {
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
  }
};

module.exports = arquitect;
