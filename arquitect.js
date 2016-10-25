// jshint esversion: 6
var manager = require('manager');
/**
 * Arquitext
 */
var arquitect = {
  /**
   * Plan the next buildings.
   */
  plan: function() {
    // study
    if (this.getMode() == 'study') {
      this.saveCurrentWorkerLocations();
      if (Game.time%100 === 0) {
        this.ageWorkerLocations();
      }
    }

    // plan roads
    if (this.getMode() == 'plan') {
      for (let roomName in Game.rooms) {
        this.planRoad(roomName);
      }
    }
  },

  /**
   * Will plan one road in the most transited location
   */
  planRoad: function (roomName) {
    var room = Game.rooms[roomName];
    var maxConstructionSites = 2;
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxConstructionSites) {
      return;
    }
    var roadRoom = null;
    var roadPosX = null;
    var roadPosY = null;
    var posXInt = null;
    var posYInt = null;
    var maxValue = null;
    var constructionSiteFound = null;
    var structureFound = null;
    if (typeof Memory.arquitect.worker_locations[room] !== 'undefined') {
      for (var posX in Memory.arquitect.worker_locations[room]) {
        for (var posY in Memory.arquitect.worker_locations[room][posX]) {
          if (maxValue === null || maxValue < Memory.arquitect.worker_locations[room][posX][posY]) {
            posXInt = parseInt(posX);
            posYInt = parseInt(posY);
            constructionSiteFound = Game.rooms[room].lookForAt(LOOK_CONSTRUCTION_SITES, posXInt, posYInt);
            if (constructionSiteFound.length === 0) {
              structureFound = Game.rooms[room].lookForAt(LOOK_STRUCTURES, posXInt, posYInt);
              if (structureFound.length === 0) {
                maxValue = Memory.arquitect.worker_locations[room][posX][posY];
                roadRoom = room;
                roadPosX = posXInt;
                roadPosY = posYInt;
              }
            }
          }
        }
      }
    }
    if (maxValue !== null && maxValue > 5) {
      if (Game.rooms[roadRoom].createConstructionSite(roadPosX, roadPosY, STRUCTURE_ROAD) == OK) {
        console.log('Construction site created [road]: ' + roadPosX + ', ' + roadPosY);
      }
    }
  },

  /**
  * Save current workers location
  */
  saveCurrentWorkerLocations: function() {
    var workers = manager.getAllWorkers();
    var workersLength = workers.length;
    for (var i = 0; i < workersLength; i++) {
      //if (workers[i].fatigue === 0) {
        var room = workers[i].room.name;
        var posX = workers[i].pos.x;
        var posY = workers[i].pos.y;
        if (typeof Memory.arquitect.worker_locations[room] == 'undefined') {
          Memory.arquitect.worker_locations[room] = {};
        }
        if (typeof Memory.arquitect.worker_locations[room][posX] == 'undefined') {
          Memory.arquitect.worker_locations[room][posX] = {};
        }
        if (typeof Memory.arquitect.worker_locations[room][posX][posY] == 'undefined') {
          Memory.arquitect.worker_locations[room][posX][posY] = 0;
        }
        Memory.arquitect.worker_locations[room][posX][posY]++;
      }
    //}
  },

  /**
   * Age all worker locations by one.
   */
  ageWorkerLocations: function() {
    for (var room in Memory.arquitect.worker_locations) {
      for (var posX in Memory.arquitect.worker_locations[room]) {
        for (var posY in Memory.arquitect.worker_locations[room][posX]) {
          if (Memory.arquitect.worker_locations[room][posX][posY] > 0) {
            Memory.arquitect.worker_locations[room][posX][posY]--;
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
