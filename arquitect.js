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
    // for every room
    for (let roomName in Game.rooms) {
      // study
      if (this.getMode() == 'study') {
        this.saveCurrentWorkerLocations(roomName);
        this.ageWorkerLocations(roomName);
      }
      // plan
      if (this.getMode() == 'plan') {
        this.planRoad(roomName);
      }
    }
  },

  /**
   * Will plan one road in the most transited location
   * @param {string} roomName
   */
  planRoad: function (roomName) {
    var room = Game.rooms[roomName];
    var maxConstructionSites = 2;
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxConstructionSites) return;
    var roadRoom = null;
    var roadPosX = null;
    var roadPosY = null;
    var posXInt = null;
    var posYInt = null;
    var maxValue = null;
    var constructionSiteFound = null;
    var structureFound = null;
    if (typeof Memory.arquitect.worker_locations[roomName] !== 'undefined') {
      for (var posX in Memory.arquitect.worker_locations[roomName]) {
        for (var posY in Memory.arquitect.worker_locations[roomName][posX]) {
          if (maxValue === null || maxValue < Memory.arquitect.worker_locations[roomName][posX][posY]) {
            posXInt = parseInt(posX);
            posYInt = parseInt(posY);
            constructionSiteFound = Game.rooms[roomName].lookForAt(LOOK_CONSTRUCTION_SITES, posXInt, posYInt);
            if (constructionSiteFound.length === 0) {
              structureFound = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, posXInt, posYInt);
              if (structureFound.length === 0) {
                maxValue = Memory.arquitect.worker_locations[roomName][posX][posY];
                roadRoom = roomName;
                roadPosX = posXInt;
                roadPosY = posYInt;
              }
            }
          }
        }
      }
    }
    if (maxValue !== null && maxValue > 100) {
      if (Game.rooms[roadRoom].createConstructionSite(roadPosX, roadPosY, STRUCTURE_ROAD) == OK) {
        console.log('Construction site created [road]: ' + roadPosX + ', ' + roadPosY);
      }
    }
  },

  /**
  * Save current workers location
  * @param {string} roomName
  */
  saveCurrentWorkerLocations: function(roomName) {
    var workers = manager.getAllWorkers(roomName);
    var workersLength = workers.length;
    if (typeof Memory.arquitect.worker_locations[roomName] == 'undefined') {
      Memory.arquitect.worker_locations[roomName] = {};
    }
    for (var i = 0; i < workersLength; i++) {
      var posX = workers[i].pos.x;
      var posY = workers[i].pos.y;
      if (typeof Memory.arquitect.worker_locations[roomName][posX] == 'undefined') {
        Memory.arquitect.worker_locations[roomName][posX] = {};
      }
      if (typeof Memory.arquitect.worker_locations[roomName][posX][posY] == 'undefined') {
        Memory.arquitect.worker_locations[roomName][posX][posY] = 0;
      }
      Memory.arquitect.worker_locations[roomName][posX][posY]++;
    }
  },

  /**
   * Age all worker locations by one.
   * @param {string} roomName
   */
  ageWorkerLocations: function(roomName) {
    if (Game.time%100 === 0) {
      for (var room in Memory.arquitect.worker_locations) {
        for (var posX in Memory.arquitect.worker_locations[roomName]) {
          for (var posY in Memory.arquitect.worker_locations[roomName][posX]) {
            if (Memory.arquitect.worker_locations[roomName][posX][posY] > 0) {
              Memory.arquitect.worker_locations[roomName][posX][posY]--;
            }
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
