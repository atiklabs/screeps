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
    // Useful variables
    var maxWorkersPower = 16;
    var totalWorkersPower = 0;
    var workers = this.getAllWorkers();
    var workersLength = workers.length;

    // Tell every worker to continue their task
    for (var i = 0; i < workersLength; i++) {
      this.run(workers[i]);
      totalWorkersPower += workers[i].memory.level;
    }

    // Spawn automatically new workers
    if (totalWorkersPower < maxWorkersPower) {
      var name = null;
      var level = null;
      if (Game.spawns.Base.room.energyCapacityAvailable >= 500) {
        name = Game.spawns.Base.createCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]); // costs 500
        level = 2;
      } else if (Game.spawns.Base.room.energyCapacityAvailable >= 250) {
        name = Game.spawns.Base.createCreep([WORK, CARRY, MOVE, MOVE]); // costs 250
        level = 1;
      }
      if (name !== null && isNaN(name)) {
        Game.creeps[name].memory.role = 'worker';
        Game.creeps[name].memory.state = 'init';
        Game.creeps[name].memory.source_index = null;
        Game.creeps[name].memory.level = level;
        console.log('Spawned worker [level ' + Game.creeps[name].memory.level + ']: ' + name + ' ('+ (totalWorkersPower + level) + '/' + maxWorkersPower +')');
      }
    }
  },

  /**
   * Worker, it's time to do your task!
   * @param {Creep} worker
   */
  run: function(worker) {
    var target = null;
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
    // harvest
    if (this.getState(worker) == 'harvest') {
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
    }
    if (this.getState(worker) == 'ready' || this.getState(worker) == 'transfer') {
      target = worker.pos.findClosestByRange(FIND_STRUCTURES, {
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
    }
    if (this.getState(worker) == 'ready' || this.getState(worker) == 'build' || this.getState(worker) == 'upgrade' || this.getState(worker) == 'repair') {
      // ready for building
      if (this.getMode() == 'build') {
        this.setState(worker, 'build');
        target = worker.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target !== null) {
          if (worker.build(target) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target);
          } else if (worker.carry.energy === 0) {
            this.setState(worker, 'free');
          }
        } else {
          this.setMode('repair');
          this.setState(worker, 'free');
        }
      }
      // ready for reparing
      if (this.getMode() == 'repair') {
        this.setState(worker, 'repair');
        targets = worker.pos.find(FIND_STRUCTURES, {
          filter: object => object.hits < object.hitsMax
        });
        targets.sort((a,b) => a.hits - b.hits);
        if (targets.length > 0) {
          if (worker.repair(targets[0]) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target[0]);
          } else if (worker.carry.energy === 0) {
            this.setState(worker, 'free');
          }
        } else {
          this.setMode('upgrade');
          this.setState(worker, 'free');
        }
      }
      // ready for upgrading controller
      if (this.getMode() == 'upgrade') {
        this.setState(worker, 'upgrade');
        if (worker.upgradeController(worker.room.controller) == ERR_NOT_IN_RANGE) {
          worker.moveTo(worker.room.controller);
        } else if (worker.carry.energy === 0) {
          this.setState(worker, 'free');
        }
      }
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
    if  (Memory.manager.mode != mode) {
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
