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
                this.run(workers[i]);
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
                var name = spawns[0].createWorker();
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
    run: function (worker) {
        // init
        if (worker.getState() == 'init') {
            worker.setState('free');
        }
        // free
        if (worker.getState() == 'free') {
            if (worker.carry.energy === 0) {
                var droppedEnergy = worker.room.find(FIND_DROPPED_ENERGY);
                if (droppedEnergy.length > 0) {
                    worker.setToPickup();
                } else {
                    worker.setToHarvest();
                }
            } else {
                worker.setState('ready');
            }
        }

        // maintain the same task
        if (worker.getState() == 'harvest') {
            worker.setToHarvest();
        }
        if (worker.getState() == 'transfer') {
            worker.setToTransfer();
        }
        if (worker.getState() == 'tower') {
            worker.setToTower();
        }
        if (worker.getState() == 'build') {
            worker.setToBuild();
        }
        if (worker.getState() == 'repair') {
            worker.setToRepair();
        }
        if (worker.getState() == 'upgrade') {
            worker.setToUpgrade();
        }

        // if ready set task
        if (worker.getState() == 'ready') {
            worker.setToTransfer();
        }
        if (worker.getState() == 'ready') {
            switch (this.getMode()) {
                case 'build':
                    worker.setToBuild();
                    break;
                case 'repair':
                    worker.setToRepair();
                    break;
                case 'upgrade':
                    worker.setToUpgrade();
                    break;
                default:
                    var allWorkersInRoom = worker.room.getAllWorkers();
                    var buildWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'build').length;
                    var repairWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'repair').length;
                    var towerWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'tower').length;
                    var upgradeWorkers = _.filter(allWorkersInRoom, (worker) => worker.memory.state == 'upgrade').length;
                    console.log(upgradeWorkers + ' Upgraders, ' + buildWorkers + ' Builders, ' + repairWorkers + ' Repairers, ' + towerWorkers + ' Towers');
                    var total = buildWorkers + repairWorkers + towerWorkers + upgradeWorkers;
                    if (worker.getState() == 'ready' && buildWorkers < total / 4) {
                        worker.setToBuild();
                    }
                    if (worker.getState() == 'ready' && repairWorkers < total / 4) {
                        worker.setToRepair();
                    }
                    if (worker.getState() == 'ready' && towerWorkers < total / 4) {
                        worker.setToTower();
                    }
                    if (worker.getState() == 'ready' && upgradeWorkers < total / 4) {
                        worker.setToUpgrade();
                    }
                    if (worker.getState() == 'ready') {
                        worker.setToUpgrade();
                    }
            }
        }
    }
};

module.exports = manager;
