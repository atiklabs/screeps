/**
 * This manages the code updates and version.
 */
var code = {
  /**
   * Returns current code version.
   * @return {float} getVersion
   */
  getVersion: function() {
    return Memory.code.version;
  },

  /**
   * Sets current code version
   * @param {float} version
   */
  setVersion: function(version) {
    Memory.code.version = version;
  },

  /**
   * Update model acording to the current version
   */
  update: function() {
    if (Memory.code == undefined) {
      Memory.code = {};
    }
    if (this.getVersion() == undefined) {
      this.setVersion(1.0);
    }
    if (this.getVersion() == 1.0) {
      for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester' || creep.memory.role == 'upgrader' || creep.memory.role == 'builder') {
          creep.memory.role = 'probe';
          creep.memory.state = 'init';
          creep.memory.source_init = null;
        }
      }
      this.setVersion(1.1);
    }
	}
};

module.exports = code;
