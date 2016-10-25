// jshint esversion: 6
/**
 * Workers are designed in mind to Work, Carry and Move.
 * Basically, worker is the role which manages energy and uses it to store, build, and repair.
 */
var manager = {
  /**
   * We will run manage in every iteration in every tick to assign tasks and ask them
   * to work. Spawn new workers if necessary.
   */
  manage: function() {
    // Tell every worker to continue their task
    var workers = this.getAllWorkers();
    var workersLength = workers.length;
    for (let i = 0; i < workersLength; i++) {
      this.run(workers[i]);
    }

    for (let roomName in Game.rooms) {
      this.recruit(roomName);
    }
  },

  recruit: function(roomName) {
    var room = Game.rooms[roomName];
    if (typeof room.controller == 'undefined') return;
    // Useful variables
    var workers = this.getAllWorkers();
    var maxWorkers = 10;
    // Spawn automatically new workers
    if (workers.length < maxWorkers) {
      var name = null;
      var level = 0;
      var capacitySpended = 0;
      var parts = [];
      while (capacitySpended + 200 <= room.energyCapacityAvailable) {
        parts.push(WORK); // 100
        parts.push(CARRY); // 50
        parts.push(MOVE); // 50
        level++;
        capacitySpended += 200;
      }
      var spawns = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_SPAWN
      });
      if (spawns.length > 0) {
        name = spawns[0].createCreep(parts);
        if (name !== null && isNaN(name)) {
          Game.creeps[name].memory.role = 'worker';
          Game.creeps[name].memory.state = 'init';
          Game.creeps[name].memory.source_index = null;
          Game.creeps[name].memory.level = level;
          console.log('Spawned worker [level ' + Game.creeps[name].memory.level + ']: ' + name + ' ('+ (workers.length + 1) + '/' + maxWorkers +')');
        }
      }
    }
  },

  /**
   * Worker, it's time to set your task!
   * @param {Creep} worker
   */
  run: function(worker) {
    // init
    if (this.getState(worker) == 'init') {
      this.setState(worker, 'free');
    }

    // free
    if (this.getState(worker) == 'free') {
      if (worker.carry.energy === 0) {
        this.setState(worker, 'harvest');
      } else {
        this.setState(worker, 'ready');
      }
    }

    // maintain the same task
    if (this.getState(worker) == 'harvest') {
      this.setWorkerToHarvest(worker);
    }
    if (this.getState(worker) == 'transfer') {
      this.setWorkerToTransfer(worker);
    }
    if (this.getState(worker) == 'tower') {
      this.setWorkerToTower(worker);
    }
    if (this.getState(worker) == 'build') {
      this.setWorkerToBuild(worker);
    }
    if (this.getState(worker) == 'repair') {
      this.setWorkerToRepair(worker);
    }
    if (this.getState(worker) == 'upgrade') {
      this.setWorkerToUpgrade(worker);
    }

    // if ready set task
    if (this.getState(worker) == 'ready') {
      this.setWorkerToTransfer(worker);
    }
    if (this.getState(worker) == 'ready') {
      switch(this.getMode()) {
        case 'build':
          this.setWorkerToBuild(worker);
          break;
        case 'repair':
          this.setWorkerToRepair(worker);
          break;
        case 'upgrade':
          this.setWorkerToUpgrade(worker);
          break;
        case 'default':
          var upgradeWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'upgrade').length;
          var buildWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'build').length;
          var repairWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'repair').length;
          var towerWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'tower').length;
          var minState = Math.min(upgradeWorkers, buildWorkers, repairWorkers, towerWorkers);
          if (minState == buildWorkers) {
            this.setWorkerToBuild(worker);
          } else if (minState == repairWorkers) {
            this.setWorkerToRepair(worker);
          } else if (minState == towerWorkers) {
            this.setWorkerToTower(worker);
          } else {
            this.setWorkerToUpgrade(worker);
          }
          break;
      }
    }
	},

  /**
   * Harvest
   * @param {Creep} worker
   */
  setWorkerToHarvest: function(worker) {
    if (worker.carry.energy < worker.carryCapacity) {
      var sources = worker.room.find(FIND_SOURCES);
      if (worker.memory.source_index === null) {
        this.assignSource(worker);
      }
      if (worker.harvest(sources[worker.memory.source_index]) == ERR_NOT_IN_RANGE) {
        worker.moveTo(sources[worker.memory.source_index]);
      }
    } else {
      this.unassignSource(worker);
      this.setState(worker, 'ready');
    }
  },

  /**
   * Transfer
   * @param {Creep} worker
   */
  setWorkerToTransfer: function(worker) {
    var target = worker.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity;
      }
    });
    if (target !== null) {
      this.setState(worker, 'transfer');
      if (worker.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        worker.moveTo(target);
      } else if (worker.carry.energy === 0) {
        this.setState(worker, 'free');
      }
    } else {
      this.setState(worker, 'ready');
    }
  },

  /**
   * Build
   * @param {Creep} worker
   */
  setWorkerToBuild: function(worker) {
    var target = worker.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if (target !== null) {
      this.setState(worker, 'build');
      if (worker.build(target) == ERR_NOT_IN_RANGE) {
        worker.moveTo(target);
      } else if (worker.carry.energy === 0) {
        this.setState(worker, 'free');
      }
    } else {
      this.setState(worker, 'repair');
    }
  },

  /**
   * Repair
   * @param {Creep} worker
   */
  setWorkerToRepair: function(worker) {
    var targets = worker.room.find(FIND_MY_STRUCTURES, {
      // repair thos structures damaged, if it's a road and worker_locations of the road is 0 do not repair.
      filter: structure => {
        return structure.hits < structure.hitsMax &&
          (structure.structureType != STRUCTURE_ROAD || Memory.arquitect.worker_locations[structure.pos.roomName][structure.pos.x][structure.pos.y] > 0);
      }
    });
    targets.sort((a,b) => a.hits - b.hits);
    if (targets.length > 0) {
      this.setState(worker, 'repair');
      if (worker.repair(targets[0]) == ERR_NOT_IN_RANGE) {
        worker.moveTo(targets[0]);
      } else if (worker.carry.energy === 0) {
        this.setState(worker, 'free');
      }
    } else {
      this.setState(worker, 'tower');
    }
  },

  /**
   * Tower
   * @param {Creep} worker
   */
  setWorkerToTower: function(worker) {
    var target = worker.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity;
      }
    });
    if (target !== null) {
      this.setState(worker, 'tower');
      if (worker.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        worker.moveTo(target);
      } else if (worker.carry.energy === 0) {
        this.setState(worker, 'free');
      }
    } else {
      this.setState(worker, 'upgrade');
    }
  },

  /**
   * Upgrade
   * @param {Creep} worker
   */
  setWorkerToUpgrade: function(worker) {
    this.setState(worker, 'upgrade');
    if (worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
      worker.moveTo(worker.room.controller);
    } else if (worker.carry.energy === 0) {
      this.setState(worker, 'free');
    }
  },

  /**
   * Assigns a source to the worker
   * @param {Creep} worker
   */
  assignSource: function(worker) {
    // initialize variables
    var sources = worker.room.find(FIND_SOURCES);
    var sourcesLength = sources.length;
    var workers = this.getAllWorkers();
    var workersLength = workers.length;
    var workersAssignedToSource = new Array(sourcesLength);
    var i = null;
    for (i = 0; i < sourcesLength; i++) {
      workersAssignedToSource[i] = 0;
    }
    // get number of assigned workers in every source
    for (i = 0; i < workersLength; i++) {
     if (workers[i].memory.source_index !== null) {
       workersAssignedToSource[workers[i].memory.source_index]++;
     }
    }
    // get the source with the minimum workers assigned
    var minSourceIndex = 0;
    var minSourceWorkers = workersAssignedToSource[minSourceIndex];
    for (i = 1; i < sourcesLength; i++) {
      if (workersAssignedToSource[i] < minSourceWorkers) {
        minSourceIndex = i;
      }
    }
    worker.memory.source_index = minSourceIndex;
  },

  /**
   * Unassigns a worker source.
   * @param {Creep} worker
   */
  unassignSource: function(worker) {
    worker.memory.source_index = null;
  },

  /**
   * Get the state of a worker.
   * @return {string} getState
   */
  getState: function(worker) {
    return worker.memory.state;
  },

  /**
   * Set an state and say it.
   * @param {Creep} worker
   * @param {string} state
   */
  setState: function(worker, state) {
    if (worker.memory.state != state) {
      worker.memory.state = state;
      worker.say(state);
    }
  },

  /**
   * Set current manager mode
   * @return {string} getMode
   */
  getMode: function() {
    return Memory.manager.mode;
  },

  /**
   * Set current manager mode
   * @param {string} mode
   */
  setMode: function(mode) {
    if (Memory.manager.mode != mode) {
      Memory.manager.mode = mode;
      console.log('Manager: ' + mode);
    }
  },

  /**
  * Get all workers
  * @return {array} workers
  */
  getAllWorkers: function() {
    return _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');
  }
};

module.exports = manager;
