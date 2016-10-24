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
    if (Math.floor(Game.time/3600)%2 === 0) {
      manager.setMode('build');
    } else {
      manager.setMode('upgrade');
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
