/**
 * The director configures the architect, general and manager and runs them.
 */
var director = {
    /**
     * Orchestrate the system.
     */
    orchestrate: function (manager, general, architect) {
        var ticksHour = Math.floor((Game.time) % 10000);

        // architect
        if (ticksHour % 1000 >= 0 && ticksHour % 1000 < 500) {
            architect.setMode('study');
        } else {
            architect.setMode('plan');
        }
        architect.plan(); // study, plan, rest

        // general
        var targets = Game.spawns.Base.room.find(FIND_HOSTILE_CREEPS); // hardcoded for now
        if (targets.length >= 2) {
            general.setMode('defend');
        } else {
            general.setMode('defend');
        }
        general.command(); // defend, claim, attack

        // manager
        manager.setMode('default');
        manager.manage(); // default, upgrade, build, repair
    }
};

module.exports = director;
