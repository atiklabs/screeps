/**
 * The director configures the architect, general and manager and runs them.
 */
var director = {
    /**
     * Orchestrate the system.
     */
    orchestrate: function (manager, general, architect) {
        var ticksHour = Math.floor((Game.time) % 10000);
        var targets = Game.spawns.Base.room.find(FIND_HOSTILE_CREEPS); // hardcoded for now

        // architect
        if (ticksHour % 1000 >= 0 && ticksHour % 1000 < 500) {
            architect.setMode('study');
        } else {
            architect.setMode('plan');
        }
        architect.plan(); // study, plan, rest

        // general
        if (targets.length >= 1) {
            general.setMode('defend'); // todo in case of defenses bridged then mode attack
        } else {
            general.setMode('rest');
        }
        general.command(); // defend, attack, rest

        // manager
        if (targets.length >= 1) {
            general.setMode('repair');
        } else {
            general.setMode('default');
        }
        manager.manage(); // default, upgrade, build, repair
    }
};

module.exports = director;
