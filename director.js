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
        } else {
            architect.setMode('plan');
        }

        for (let roomName in Game.rooms) {
            var targets = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
            architect.plan(roomName); // study, plan, rest

            // general
            if (targets.length >= 1) {
                general.setMode('attack');
            } else {
                general.setMode('rest');
            }

            if (false) {
                try {
                    if (roomName == 'E68N51') {
                        //problem! this gets wrong with also attack mode
                        general.attackRoom(roomName, 'E66N51');
                    }
                } catch (error) {
                    console.log('Error: ' + error);
                    Game.notify('Error: ' + error);
                }
            } else {
                general.command(roomName); // defend, attack, rest
            }

            // manager
            if (targets.length >= 1) {
                manager.setMode('repair');
            } else {
                manager.setMode('default');
            }
            manager.manage(roomName); // default, upgrade, build, repair
        }
    }
};

module.exports = director;
