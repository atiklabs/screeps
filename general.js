// jshint esversion: 6
/**
 * The general will command the troops based on an strategy to win any opponent.
 */
var general = {
  /**
   * Commant the troops to the victory.
   */
  command: function() {
    var soldiers = this.getAllSoldiers();
    var soldiersLength = soldiers.length;

    // Tell every soldier to continue their task
    for (var i = 0; i < soldiersLength; i++) {
      this.run(soldiers[i]);
    }

    this.recruit();
  },

  /**
   * Comm'on folks! Time to join the army!
   */
  recruit: function() {
    // Useful variables
    var soldiers = this.getAllSoldiers();
    var soldiersLength = soldiers.length;
    var maxSoldiersPower = 3;
    var totalSoldiersPower = 0;
    var tanks = 0;
    var healers = 0;
    var damagers = 0;

    // Count total soldiers power
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

    // Spawn automatically new soldiers
    if (totalSoldiersPower < maxSoldiersPower) {
      var name = null;
      var level = null;
      var archetype = null;
      if (tanks <= healers && tanks <= damagers) {
        archetype = 'tank';
        if (Game.spawns.Base.room.energyCapacityAvailable >= 500 && maxSoldiersPower >= 6) {
          name = Game.spawns.Base.createCreep([ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE]); // costs 500
          level = 2;
        } else if (Game.spawns.Base.room.energyCapacityAvailable >= 250) {
          name = Game.spawns.Base.createCreep([ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE]); // costs 250
          level = 1;
        }
      } else if (healers <= tanks && healers <= damagers) {
        archetype = 'healer';
        if (Game.spawns.Base.room.energyCapacityAvailable >= 500 && maxSoldiersPower >= 6) {
          name = Game.spawns.Base.createCreep([HEAL, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE]); // costs 500
          level = 2;
        } else if (Game.spawns.Base.room.energyCapacityAvailable >= 250) {
          name = Game.spawns.Base.createCreep([HEAL, MOVE]); // costs 250
          level = 1;
        }
      } else if (damagers <= tanks && damagers <= healers) {
        archetype = 'damager';
        if (Game.spawns.Base.room.energyCapacityAvailable >= 500 && maxSoldiersPower >= 6) {
          name = Game.spawns.Base.createCreep([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE]); // costs 500
          level = 2;
        } else if (Game.spawns.Base.room.energyCapacityAvailable >= 250) {
          name = Game.spawns.Base.createCreep([RANGED_ATTACK, MOVE, MOVE]); // costs 250
          level = 1;
        }
      }
      if (name !== null && isNaN(name)) {
        Game.creeps[name].memory.role = 'soldier';
        Game.creeps[name].memory.state = 'init';
        Game.creeps[name].memory.archetype = archetype;
        Game.creeps[name].memory.level = level;
        console.log('Spawned soldier [level: ' + Game.creeps[name].memory.level + ', archetype: ' + archetype + ']: ' + name + ' ('+ (totalSoldiersPower + level) + '/' + maxSoldiersPower +')');
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
          soldier.moveTo(Game.spawns.Base);
        }
      } else if (soldier.memory.patrol == 'spawn') {
        path = soldier.room.findPath(soldier.pos, Game.spawns.Base.pos);
        if (path.length > 5) {
          soldier.moveTo(Game.spawns.Base);
        } else {
          soldier.memory.patrol = 'controller';
          soldier.moveTo(soldier.room.controller);
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
  * Get all army units
  * @return {array} army
  */
  getAllSoldiers: function() {
    return _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier');
  }
};

module.exports = general;
