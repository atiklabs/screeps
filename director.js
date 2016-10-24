var manager = require('manager');
var general = require('general');
var arquitect = require('arquitect');

/**
 * The director configures the arquitect, general and manager and runs them.
 */
var director = {
  /**
   * Orquestrate the system.
   */
  orquestrate: function() {
    var ticksHour = Math.floor(Game.time/600);
    if (ticksHour%3 === 0) {
      arquitect.setMode('plan');
      manager.setMode('build');
    } else if (ticksHour%3 == 1) {
      arquitect.setMode('study');
      manager.setMode('upgrade');
    } else {
      arquitect.setMode('rest');
      manager.setMode('repair');
    }
    // Ask arquitect, general and manager to work
    arquitect.plan();
    general.command();
    manager.manage();
  }
};

module.exports = director;
