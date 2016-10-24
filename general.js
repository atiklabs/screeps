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
    var maxSoldiersPower = 2;

    var totalSoldiersPower = 0;
    var tanks = 0;
    var healers = 0;
    var rangeds = 0;

    // Count total soldiers power
    for (var i = 0; i < soldiersLength; i++) {
      totalSoldiersPower += soldiers[i].memory.level;
      if (soldiers[i].specialization == 'tank') {
        tanks++;
      }
      if (soldiers[i].specialization == 'healer') {
        healers++;
      }
      if (soldiers[i].specialization == 'damagers') {
        damagers++;
      }
    }

    // Spawn automatically new soldiers
    if (totalSoldiersPower < maxSoldiersPower) {
      var name = null;
      var level = null;
      var especialization = null;
      if (true || tanks <= healers && tanks <= damagers) {
        especialization = 'tank';
        if (Game.spawns.Base.room.energyCapacityAvailable >= 500) {
          name = Game.spawns.Base.createCreep([ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE]); // costs 500
          level = 2;
        } else if (Game.spawns.Base.room.energyCapacityAvailable >= 250) {
          name = Game.spawns.Base.createCreep([ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE]); // costs 250
          level = 1;
        }
      } else if (healers <= tanks && healers <= damagers) {
        especialization = 'healer';
        if (Game.spawns.Base.room.energyCapacityAvailable >= 500) {
          name = Game.spawns.Base.createCreep([HEAL, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE]); // costs 500
          level = 2;
        } else if (Game.spawns.Base.room.energyCapacityAvailable >= 250) {
          name = Game.spawns.Base.createCreep([HEAL, MOVE]); // costs 250
          level = 1;
        }
      } else if (damagers <= tanks && damagers <= healers) {
        especialization = 'damager';
        if (Game.spawns.Base.room.energyCapacityAvailable >= 500) {
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
        Game.creeps[name].memory.specialization = especialization;
        Game.creeps[name].memory.level = level;
        console.log('Spawned soldier [level ' + Game.creeps[name].memory.level + ']: ' + name + ' ('+ (totalSoldiersPower + level) + '/' + maxSoldiersPower +')');
      }
    }
  },

  /**
   *
   */
  run: function(soldier) {
    var path = null;
    var targets = null;
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
      targets = soldier.room.find(Game.HOSTILE_CREEPS);
      if (targets.length > 0) {
        this.setState(soldier, 'attack');
      }
    }
    // attack
    if (this.getState(soldier) == 'attack') {
      var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (target) {
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      } else {
        this.setState(soldier, 'patrol');
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
