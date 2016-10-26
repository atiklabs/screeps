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
    var maxConstructionSites = 2;
    var room = Game.rooms[roomName];
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxConstructionSites) return;
    var roadRoom, roadPosX, roadPosY, posXInt, posYInt, maxValue, constructionSiteFound, structureFound;
    roadRoom = roadPosX = roadPosY = posXInt = posYInt = maxValue = 0;
    constructionSiteFound = structureFound = null;
    if (typeof Memory.arquitect.worker_locations[roomName] !== 'undefined') {
      for (var posX in Memory.arquitect.worker_locations[roomName]) {
        for (var posY in Memory.arquitect.worker_locations[roomName][posX]) {
          if (maxValue === null || maxValue < Memory.arquitect.worker_locations[roomName][posX][posY]) {
            posXInt = parseInt(posX);
            posYInt = parseInt(posY);
            constructionSiteFound = Game.rooms[roomName].lookForAt(LOOK_CONSTRUCTION_SITES, posXInt, posYInt);
            structureFound = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, posXInt, posYInt);
            if (constructionSiteFound.length === 0 && structureFound.length === 0) {
              maxValue = Memory.arquitect.worker_locations[roomName][posX][posY];
              roadRoom = roomName;
              roadPosX = posXInt;
              roadPosY = posYInt;
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
   * Reset worker locations for further study
   */
  resetWorkerLocations: function() {
    Memory.arquitect.worker_locations = {};
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
      this.resetWorkerLocations();
      console.log('Arquitect: ' + mode);
    }
  },
};

module.exports = arquitect;
