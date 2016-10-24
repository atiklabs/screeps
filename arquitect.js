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
    if (this.getMode() == 'study') {
      this.saveCurrentProbeLocations();
      if (Game.time%100 === 0) {
        this.ageProbeLocations();
      }
    }

    // plan roads
    if (this.getMode() == 'plan') {
      if (constructionSitesLength < minConstructionSites && Game.time%10 === 0) {
        this.planRoad();
      }
    }
  },

  /**
   * Will plan one road in the most transited location
   */
  planRoad: function () {
    var roadRoom = null;
    var roadPosX = null;
    var roadPosY = null;
    var maxValue = null;
    var constructionSiteFound = null;
    var structureFound = null;
    for (var room in Memory.arquitect.probe_locations) {
      if (typeof Game.rooms[room] !== 'undefined') {
        for (var posX in Memory.arquitect.probe_locations[room]) {
          for (var posY in Memory.arquitect.probe_locations[room][posX]) {
            if (maxValue === null || maxValue < Memory.arquitect.probe_locations[room][posX][posY]) {
              posXInt = parseInt(posX);
              posYInt = parseInt(posY);
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
  saveCurrentProbeLocations: function() {
    var probes = manager.getAllProbes();
    var probesLength = probes.length;
    for (var i = 0; i < probesLength; i++) {
      //if (probes[i].fatigue === 0) {
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
    //}
  },

  /**
   * Age all probe locations by one.
   */
  ageProbeLocations: function() {
    for (var room in Memory.arquitect.probe_locations) {
      for (var posX in Memory.arquitect.probe_locations[room]) {
        for (var posY in Memory.arquitect.probe_locations[room][posX]) {
          if (Memory.arquitect.probe_locations[room][posX][posY] > 0) {
            Memory.arquitect.probe_locations[room][posX][posY]--;
          }
        }
      }
    }
  },

  /**
   * Set current manager mode
   * @return {string} getMode
   */
  getMode: function() {
    return Memory.arquitect.mode;
  },

  /**
   * Set current manager mode
   * @param {string} mode
   */
  setMode: function(mode) {
    if  (Memory.arquitect.mode != mode) {
      Memory.arquitect.mode = mode;
      console.log('Arquitect: ' + mode);
    }
  },
};

module.exports = arquitect;
