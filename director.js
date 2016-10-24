var manager = require('manager');
var general = require('general');
var arquitect = require('arquitect');

/**
 * The director configures the manager, general and arquitect and runs them.
 */
var director = {
  /**
   * Orquestrate the system.
   */
  orquestrate: function() {
    var ticksHour = Math.floor(Game.time/2000);
    if (ticksHour%3 === 0) {
      manager.setMode('build');
    } else if (ticksHour%3 == 1) {
      manager.setMode('upgrade');
    } else {
      manager.setMode('repair');
    }
    // Manage probes
    manager.manage();
    // Attack!
    general.command();
    // Arquitect to design the construction sites
    arquitect.plan();
  }
};

module.exports = director;
