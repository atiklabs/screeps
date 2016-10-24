/**
 * Probes are designed in mind to Work, Carry and Move.
 * Basically, is the role which manages energy and uses it to store, build, and repair.
 * Probes name inspired in Starcraft probes.
 */
var manager = {
  /**
   * We will run manage in every iteration in every tick to assign tasks and ask them
   * to work. Spawn new probes if necessary.
   */
  manage: function() {
    // Useful variables
    var maxProbes = 16;
    var probes = this.getAllProbes();
    var probesLength = probes.length;

    // Tell every probe to continue their task
    for (var i = 0; i < probesLength; i++) {
      this.run(probes[i]);
    }

    // Spawn automatically new probes
    if (probes.length < maxProbes) {
      var new_name = Game.spawns.Base.createCreep([WORK, CARRY, MOVE]);
      if (isNaN(new_name)) {
        Game.creeps[new_name].memory.role = 'probe';
        Game.creeps[new_name].memory.state = 'init';
        Game.creeps[new_name].memory.source_index = null;
        console.log("Spawned new probe " + new_name);
      }
    }

    // print some useful data
    console.log('Probes: ' + probes.length + '/' + maxProbes);
  },

  /**
   * Probe, it's time to do your task!
   * @param {Creep} probe
   */
  run: function(probe) {
    var targets = null;
    // init
    if (probe.memory.state == 'init') {
      this.setState(probe, 'free');
    }
    // free
    if (this.getState(probe) == 'free') {
      if (probe.carry.energy === 0) {
        this.setState(probe, 'harvest');
      } else {
        this.setState(probe, 'ready');
      }
    }
    // harvest
    if (this.getState(probe) == 'harvest') {
      if (probe.carry.energy < probe.carryCapacity) {
        var sources = probe.room.find(FIND_SOURCES);
        if (probe.memory.source_index === null) {
          this.assignSource(probe);
        }
        if (probe.harvest(sources[probe.memory.source_index]) == ERR_NOT_IN_RANGE) {
          probe.moveTo(sources[probe.memory.source_index]);
        }
      } else {
        this.unassignSource(probe);
        this.setState(probe, 'ready');
      }
    }
    // ready reparing
    if (this.getState(probe) == 'ready' || this.getState(probe) == 'transfer') {
      target = probe.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.energy < structure.energyCapacity;
        }
      });
      if (target !== null) {
        this.setState(probe, 'transfer');
        if (probe.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          probe.moveTo(target);
        } else if (probe.carry.energy === 0) {
          this.setState(probe, 'free');
        }
      } else {
        this.setState(probe, 'ready');
      }
    }
    // ready, construction
    if (this.getState(probe) == 'ready' || this.getState(probe) == 'build') {
      target = probe.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
      if (target !== null) {
        this.setState(probe, 'build');
        if (probe.build(target) == ERR_NOT_IN_RANGE) {
          probe.moveTo(target);
        } else if (probe.carry.energy === 0) {
          this.setState(probe, 'free');
        }
      } else {
        this.setState(probe, 'ready');
      }
    }
    // ready, controller
    if (this.getState(probe) == 'ready' || this.getState(probe) == 'controller') {
      if (probe.upgradeController(probe.room.controller) == ERR_NOT_IN_RANGE) {
        probe.moveTo(probe.room.controller);
        this.setState(probe, 'controller');
      } else if (probe.carry.energy === 0) {
        this.setState(probe, 'free');
      }
    }
	},

  /**
   * Assigns a source to the probe
   * @param {Creep} probe
   */
  assignSource: function(probe) {
    // initialize variables
    var sources = probe.room.find(FIND_SOURCES);
    var sourcesLength = sources.length;
    var probes = this.getAllProbes();
    var probesLength = probes.length;
    var probesAssignedToSource = new Array(sourcesLength);
    var i = null;
    for (i = 0; i < sourcesLength; i++) {
      probesAssignedToSource[i] = 0;
    }
    // get number of assigned probes in every source
    for (i = 0; i < probesLength; i++) {
     if (probes[i].memory.source_index !== null) {
       probesAssignedToSource[probes[i].memory.source_index]++;
     }
    }
    // get the source with the minimum probes assigned
    var minSourceIndex = 0;
    var minSourceProbes = probesAssignedToSource[minSourceIndex];
    for (i = 1; i < sourcesLength; i++) {
      if (probesAssignedToSource[i] < minSourceProbes) {
        minSourceIndex = i;
      }
    }
    probe.memory.source_index = minSourceIndex;
  },

  /**
   * Unassigns a probe source.
   * @param {Creep} probe
   */
  unassignSource: function(probe) {
    probe.memory.source_index = null;
  },

  /**
   * Get the state of a probe.
   * @return {string} getState
   */
  getState: function(probe) {
    return probe.memory.state;
  },

  /**
   * Set an state and say it.
   * @param {Creep} probe
   * @param {string} state
   */
  setState: function(probe, state) {
    if (probe.memory.state != state) {
      probe.memory.state = state;
      probe.say(state);
    }
  },

  /**
  * Get all probes
  * @return {array} probes
  */
  getAllProbes: function() {
    return _.filter(Game.creeps, (creep) => creep.memory.role == 'probe');
  }
};

module.exports = manager;
