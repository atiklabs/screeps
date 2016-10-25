// jshint esversion: 6
/**
 * The general will command the troops based on an strategy to win any opponent.
 */
var general = {
  /**
   * Commant the troops to the victory.
   */
  command: function() {
    if (this.getMode() == 'attack') {
      var soldiers = this.getAllSoldiers();
      var soldiersLength = soldiers.length;

      // Tell every soldier to continue their task
      for (let i = 0; i < soldiersLength; i++) {
        this.run(soldiers[i]);
      }

      // Recruit
      for (let roomName in Game.rooms) {
        this.recruit(roomName);
      }
    }

    // Use tower if necessary
    function isStructureTower(structure) {
      return structure.structureType == STRUCTURE_TOWER;
    }
    for (let roomName in Game.rooms) {
      var towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
        filter: isStructureTower
      });
      for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (typeof target != 'undefined') {
          console.log('attack');
          tower.attack(target);
        }
      }
    }
  },

  /**
   * Comm'on folks! Time to join the army!
   */
  recruit: function(roomName) {
    // Useful variables
    var room = Game.rooms[roomName];
    var soldiers = this.getAllSoldiers();
    var soldiersLength = soldiers.length;
    var maxSoldiers = 3;

    // Count total soldiers power
    var tanks, healers, damagers;
    tanks = healers = damagers = 0;
    for (var i = 0; i < soldiersLength; i++) {
      totalSoldiersPower += soldiers[i].memory.level;
      if (soldiers[i].memory.archetype == 'tank') {
        tanks++;
      }
      if (soldiers[i].memory.archetype == 'healer') {
        healers++;
      }
      if (soldiers[i].memory.archetype == 'damagers') {
        damagers++;
      }
    }
    var minArchetype = Math.min(tanks, healers, damagers);

    // Spawn automatically new soldiers
    if (soldiersLength < maxSoldiers) {
      var name, level, archetype;
      name = level = archetype = null;
      var spawns = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType == STRUCTURE_SPAWN
      });
      if (spawns.length > 0) {
        if (minArchetype <= tanks) {
          archetype = 'tank';
          if (room.energyCapacityAvailable >= 500 && maxSoldiersPower >= 6) {
            name = spawns[0].createCreep([ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE]); // costs 500
            level = 2;
          } else if (room.energyCapacityAvailable >= 250) {
            name = spawns[0].createCreep([ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE]); // costs 250
            level = 1;
          }
        } else if (minArchetype <= healers) {
          archetype = 'healer';
          if (room.energyCapacityAvailable >= 500 && maxSoldiersPower >= 6) {
            name = spawns[0].createCreep([HEAL, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE]); // costs 500
            level = 2;
          } else if (room.energyCapacityAvailable >= 250) {
            name = spawns[0].createCreep([HEAL, MOVE]); // costs 250
            level = 1;
          }
        } else if (minArchetype <= damagers) {
          archetype = 'damager';
          if (room.energyCapacityAvailable >= 500 && maxSoldiersPower >= 6) {
            name = spawns[0].createCreep([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE]); // costs 500
            level = 2;
          } else if (room.energyCapacityAvailable >= 250) {
            name = spawns[0].createCreep([RANGED_ATTACK, MOVE, MOVE]); // costs 250
            level = 1;
          }
        }
        if (name !== null && isNaN(name)) {
          Game.creeps[name].memory.role = 'soldier';
          Game.creeps[name].memory.state = 'init';
          Game.creeps[name].memory.archetype = archetype;
          Game.creeps[name].memory.level = level;
          console.log('Spawned soldier [level: ' + Game.creeps[name].memory.level + ', archetype: ' + archetype + ']: ' + name + ' ('+ (soldiersLength + 1) + '/' + maxSoldiers +')');
        }
      }
    }
  },

  /**
   *
   */
  run: function(soldier) {
    var path = null;
    var target = null;
    var targets = null;
    var soldiers = this.getAllSoldiers();
    var soldiersLength = soldiers.length;
    // init
    if (this.getState(soldier) == 'init') {
      this.setState(soldier, 'patrol');
      soldier.memory.patrol = 'controller';
    }
    // patrol
    if (this.getState(soldier) == 'patrol') {
      if (soldier.memory.patrol == 'controller') {
        path = soldier.room.findPath(soldier.pos, soldier.room.controller.pos);
        if (path.length > 5) {
          soldier.moveTo(soldier.room.controller);
        } else {
          soldier.memory.patrol = 'spawn';
        }
      } else if (soldier.memory.patrol == 'spawn') {
        var spawns = soldier.room.find(FIND_MY_STRUCTURES, {
          filter: (structure) => structure.structureType == STRUCTURE_SPAWN
        });
        path = soldier.room.findPath(soldier.pos, spawns[0].pos);
        if (path.length > 5) {
          if (spawns.length > 0) {
            soldier.moveTo(spawns[0]);
          }
        } else {
          soldier.memory.patrol = 'controller';
        }
      }
      targets = soldier.room.find(FIND_HOSTILE_CREEPS);
      if (targets.length > 0 && soldiersLength >= 3) {
        this.setState(soldier, 'attack');
      }
    }
    // attack
    if (this.getState(soldier) == 'attack') {
      if (soldier.memory.archetype == 'tank') {
        target = soldier.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
          if (soldier.attack(target) == ERR_NOT_IN_RANGE) {
            soldier.moveTo(target);
          }
        } else {
          this.setState(soldier, 'patrol');
        }
      } else if (soldier.memory.archetype == 'healer') {
        targets = soldier.room.find(FIND_MY_CREEPS, {
          filter: (creep) => {
            return (creep.memory.role == 'soldier' && creep.memory.archetype == 'tank');
          }
        });
        if (targets.length > 0) {
          targets.sort(function(a, b) { return a.hits - b.hits; });
          if (soldier.heal(targets[0]) == ERR_NOT_IN_RANGE) {
            soldier.moveTo(targets[0]);
          }
        } else {
          this.setState(soldier, 'patrol');
        }
      } else if (soldier.memory.archetype == 'damager') {
        target = soldier.pos.findClosestByPath(FIND_MY_CREEPS, {
          filter: (creep) => {
            return (creep.memory.role == 'soldier' && creep.memory.archetype == 'tank');
          }
        });
        if (target !== null) {
          soldier.moveTo(target);
          targets = soldier.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
          if (targets.length > 0) {
            creep.rangedAttack(targets[0]);
          }
        } else {
          this.setState(soldier, 'patrol');
        }
      }
    }
  },

  /**
   * Get the state of a soldier
   * @return {string} getState
   */
  getState: function(soldier) {
    return soldier.memory.state;
  },

  /**
   * Set an state and say it
   * @param {Creep} soldier
   * @param {string} state
   */
  setState: function(soldier, state) {
    if (soldier.memory.state != state) {
      soldier.memory.state = state;
      soldier.say(state);
    }
  },

  /**
   * Set current general mode
   * @return {string} getMode
   */
  getMode: function() {
    return Memory.general.mode;
  },

  /**
   * Set current general mode
   * @param {string} mode
   */
  setMode: function(mode) {
    if (Memory.general.mode != mode) {
      Memory.general.mode = mode;
      console.log('General: ' + mode);
    }
  },

  /**
  * Get all army units
  * @return {array} army
  */
  getAllSoldiers: function() {
    return _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier');
  }
};

module.exports = general;
