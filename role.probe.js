/**
 * Probes are designed in mind to Work, Carry and Move.
 * Basically, is the role which manages energy and uses it to store, build, and repair.
 * Name inspired in Starcraft probes.
 */
var roleProbe = {
  /**
   * We will run manage in every iteration in every tick to assign tasks and ask them
   * to work. Spawn new probes if necessary.
   */
  manage: function() {
    // Useful variables
    var maxProbes = 8;
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
    console.log(
      'Probes: ' + probes.length + '/' + maxProbes + '.'
    );
  },

  /**
   * Probe, it's time to do your task!
   * @param {Creep} probe
   */
  run: function(probe) {
    var targets = null;
    // init
    if (probe.memory.state == 'init') {
      this.assignSource(probe);
      this.setState(probe, 'free');
    }
    // free (need to get energy)
    if (this.getState(probe) == 'free') {
      if (probe.carry.energy < probe.carryCapacity) {
        var sources = probe.room.find(FIND_SOURCES);
        if (probe.harvest(sources[probe.memory.source_index]) == ERR_NOT_IN_RANGE) {
            probe.moveTo(sources[probe.memory.source_index]);
        }
      } else {
        this.setState(probe, 'ready');
      }
    }
    // ready reparing
    if (this.getState(probe) == 'ready' || this.getState(probe) == 'reparing') {
      targets = probe.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.energy < structure.energyCapacity;
        }
      });
      if (targets.length > 0) {
        if (probe.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          probe.moveTo(targets[0]);
          this.setState(probe, 'reparing');
        } else if (probe.carry.energy === 0) {
          this.setState(probe, 'free');
        }
      }
    }
    // ready, construction
    if (this.getState(probe) == 'ready' || this.getState(probe) == 'build') {
      targets = probe.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (probe.build(targets[0]) == ERR_NOT_IN_RANGE) {
          probe.moveTo(targets[0]);
          this.setState(probe, 'build');
        } else if (probe.carry.energy === 0) {
          this.setState(probe, 'free');
        }
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
    // get number of probes per source
    for (i = 0; i < probesLength; i++) {
     if (probes[i].memory.source_index !== null) {
       probesAssignedToSource[probes[i].memory.source_index]++;
     }
    }
    // get the source with the minimum probes assigned
    var minSourceIndex = 0;
    var minSourceProbes = probesAssignedToSource[minSourceIndex];
    for (i = 0; i < sourcesLength; i++) {
      if (probesAssignedToSource[i] < minSourceProbes) {
        minSourceIndex = i;
      }
    }
    probe.memory.source_index = minSourceIndex;
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

module.exports = roleProbe;
