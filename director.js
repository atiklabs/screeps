var manager = require('manager');
var general = require('general');
var architect = require('architect');

/**
 * The director configures the architect, general and manager and runs them.
 */
var director = {
    /**
     * Orquestrate the system.
     */
    orchestrate: function () {
        var ticksHour = Math.floor((Game.time) % 10000);
        if (ticksHour % 1000 >= 0 && ticksHour % 1000 < 500) {
            architect.setMode('study');
            manager.setMode('default');
        } else {
            architect.setMode('plan');
            manager.setMode('default');
        }
        general.setMode('rest');
        // Ask architect, general and manager to work
        architect.plan(); // study, plan, rest
        general.command(); // rest, defend, claim, conquer
        manager.manage(); // default, upgrade, build, repair
    }
};

module.exports = director;
