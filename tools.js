// jshint esversion: 6
/**
 * Some tools and utilities.
 */
var tools = {
  /**
   * Clean the memory from dead creeps.
   */
  cleanMemory: function() {
    // Check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
      // and checking if the creep is still alive
      if (Game.creeps[name] === undefined) {
        // if not, delete the memory entry
        delete Memory.creeps[name];
      }
    }
	}
};

module.exports = tools;
