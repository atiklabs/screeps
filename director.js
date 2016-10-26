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
    var ticksHour = Math.floor((Game.time)%10000);
    if (ticksHour%1000 >= 0 && ticksHour%1000 < 500) {
      arquitect.setMode('study');
      manager.setMode('default');
    } else {
      arquitect.setMode('plan');
      manager.setMode('default');
    }
    general.setMode('rest');
    // Ask arquitect, general and manager to work
    arquitect.plan(); // study, plan, rest
    general.command(); // rest, defend, claim, conquer
    manager.manage(); // default, upgrade, build, repair
  }
};

module.exports = director;
