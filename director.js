/**
 * The director configures the architect, general and manager and runs them.
 */
var director = {
    /**
     * Orchestrate the system.
     */
    orchestrate: function (manager, general, architect) {
        var ticksHour = Math.floor((Game.time) % 10000);
        if (ticksHour % 1000 >= 0 && ticksHour % 1000 < 500) {
            architect.setMode('study');
            manager.setMode('default');
        } else {
            architect.setMode('plan');
            manager.setMode('default');
        }
        general.setMode('attack');
        // Ask architect, general and manager to work
        architect.plan(); // study, plan, rest
        general.command(); // defend, claim, attack
        manager.manage(); // default, upgrade, build, repair
    }
};

module.exports = director;
