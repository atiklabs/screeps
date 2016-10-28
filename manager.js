/**
 * Workers are designed in mind to Work, Carry and Move.
 * Basically, worker is the role which manages energy and uses it to store, build, and repair.
 */
var manager = {
    /**
     * Set current manager mode
     * @return {string} getMode
     */
    getMode: function () {
        return Memory.manager.mode;
    },

    /**
     * Set current manager mode
     * @param {string} mode
     */
    setMode: function (mode) {
        if (Memory.manager.mode != mode) {
            Memory.manager.mode = mode;
            console.log('Manager: ' + mode);
        }
    },

    /**
     * We will run manage in every iteration in every tick to assign tasks and ask them
     * to work. Spawn new workers if necessary.
     */
    manage: function () {
        // for every room
        for (let roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            // tell every worker to continue their task
            var workers = room.getAllWorkers();
            var workersLength = workers.length;
            for (let i = 0; i < workersLength; i++) {
                if (this.getMode() == 'repair') {
                    this.setModeRepair(workers[i]);
                } else {
                    this.setModeDefault(workers[i]);
                }
            }
            // recruit
            this.recruit(roomName);
        }
    },

    recruit: function (roomName) {
        var room = Game.rooms[roomName];
        if (typeof room.controller == 'undefined') return;
        // Useful variables
        var workers = room.getAllWorkers();
        var workersLength = workers.length;
        var sourcesLength = room.find(FIND_SOURCES).length;
        var controllerLevel = room.controller.level;
        var maxWorkers = 8 - controllerLevel + sourcesLength + 1;
        // Spawn automatically new workers
        if (workersLength < maxWorkers) {
            var spawns = room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_SPAWN
            });
            if (spawns.length > 0) {
                var name = spawns[0].createWorker(workersLength !== 0);
                if (name !== null && isNaN(name)) {
                    workersLength++;
                    console.log('Spawned worker [level ' + Game.creeps[name].memory.level + ']: ' + name + ' (' + (workersLength) + '/' + maxWorkers + ')');
                }
            }
        }
    },

    /**
     * Worker, it's time to set your task!
     * @param {Creep} worker
     */
    setModeDefault: function (worker) {
        // always try to pickup dropped energy on the floor
        if (worker.tryToPickupHere()) return;

        // maintain the same task
        if (worker.getState() == 'pickup') worker.setToPickup(); // not used
        if (worker.getState() == 'harvest') worker.setToHarvest();
        if (worker.getState() == 'withdraw') worker.setToWithdraw();
        if (worker.getState() == 'transfer') worker.setToTransfer();
        if (worker.getState() == 'tower') worker.setToTower();
        if (worker.getState() == 'repair') worker.setToRepair();
        if (worker.getState() == 'build') worker.setToBuild();
        if (worker.getState() == 'upgrade') worker.setToUpgrade();
        if (worker.getState() == 'storage') worker.setToStorage();

        // init and free
        if (worker.getState() == 'init') worker.setState('free');
        if (worker.getState() == 'free') worker.setToHarvest();

        // if ready set task transfer
        if (worker.getState() == 'ready') worker.setToTransfer();

        // if full set a working task
        if (worker.getState() == 'ready') {
            var allWorkersInRoom = worker.room.getAllWorkers();
            var towerWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'tower').length;
            var repairWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'repair').length;
            var buildWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'build').length;
            var upgradeWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'upgrade').length;
            if (worker.getState() == 'ready' && towerWorkers < 1) worker.setToTower();
            if (worker.getState() == 'ready' && repairWorkers < 1) worker.setToRepair();
            if (worker.getState() == 'ready' && buildWorkers < 1) worker.setToBuild();
            if (worker.getState() == 'ready' && upgradeWorkers < 1) worker.setToUpgrade();
            if (worker.getState() == 'ready') worker.setToStorage();
        }
    },

    /**
     * Worker, it's time to repair everything!
     * @param {Creep} worker
     */
    setModeRepair: function (worker) {
        // always try to pickup dropped energy on the floor
        if (worker.tryToPickupHere()) return;

        // maintain the same task
        if (worker.getState() == 'harvest') worker.setToHarvest();
        if (worker.getState() == 'withdraw') worker.setToWithdraw();
        if (worker.getState() == 'tower') worker.setToTower();
        if (worker.getState() == 'transfer') worker.setToTransfer();
        if (worker.getState() == 'repair') worker.setToRepair();

        // release from certain states that won't be used in this mode
        if (worker.getState() == 'pickup') worker.setState('free');
        if (worker.getState() == 'build') worker.setState('free');
        if (worker.getState() == 'upgrade') worker.setState('free');

        // init and free
        if (worker.getState() == 'init') worker.setState('free');
        if (worker.getState() == 'free') worker.setState('harvest');

        // if ready set task
        if (worker.getState() == 'ready') worker.setToTransfer();
        if (worker.getState() == 'tower') worker.setToTower();
        if (worker.getState() == 'ready') worker.setToRepair();
    }
};

module.exports = manager;
