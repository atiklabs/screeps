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
    var ticksHour = Math.floor((Game.time)/1000);
    if (ticksHour%100 >= 0 || ticksHour%100 < 40) {
      arquitect.setMode('study');
      manager.setMode('upgrade');
    } else if (ticksHour%100 >= 40 || ticksHour%100 < 80) {
      arquitect.setMode('plan');
      manager.setMode('build');
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
