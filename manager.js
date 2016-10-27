/**
 * Workers are designed in mind to Work, Carry and Move.
 * Basically, worker is the role which manages energy and uses it to store, build, and repair.
 */
var manager = {
    /**
     * We will run manage in every iteration in every tick to assign tasks and ask them
     * to work. Spawn new workers if necessary.
     */
    manage: function () {
        // for every room
        for (let roomName in Game.rooms) {
            // tell every worker to continue their task
            var workers = this.getAllWorkers(roomName);
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
        var workers = this.getAllWorkers(roomName);
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
                worker.setState('harvest');
            } else {
                worker.setState('ready');
            }
        }

        // maintain the same task

        // if ready set task
        if (worker.getState() == 'ready') {
            worker.setState('transfer');
        }
        if (worker.getState() == 'ready') {
            switch (this.getMode()) {
                case 'build':
                    this.setWorkerToBuild(worker);
                    break;
                case 'repair':
                    this.setWorkerToRepair(worker);
                    break;
                case 'upgrade':
                    this.setWorkerToUpgrade(worker);
                    break;
                default:
                    var buildWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'build').length;
                    var repairWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'repair').length;
                    var towerWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'tower').length;
                    var upgradeWorkers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.state == 'upgrade').length;
                    console.log(upgradeWorkers + ' Upgraders, ' + buildWorkers + ' Builders, ' + repairWorkers + ' Repairs, ' + towerWorkers + ' Towers');
                    var total = buildWorkers + repairWorkers + towerWorkers + upgradeWorkers;
                    if (this.getState(worker) == 'ready' && buildWorkers < total / 4) {
                        this.setWorkerToBuild(worker);
                    }
                    if (this.getState(worker) == 'ready' && repairWorkers < total / 4) {
                        this.setWorkerToRepair(worker);
                    }
                    if (this.getState(worker) == 'ready' && towerWorkers < total / 4) {
                        this.setWorkerToTower(worker);
                    }
                    if (this.getState(worker) == 'ready' && upgradeWorkers < total / 4) {
                        this.setWorkerToUpgrade(worker);
                    }
                    if (this.getState(worker) == 'ready') {
                        this.setWorkerToUpgrade(worker);
                    }
            }
        }
    },

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
     * Get all workers
     * @param {string} roomName
     * @return {array} workers
     */
    getAllWorkers: function (roomName) {
        return _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.initial_room == roomName);
    }
};

module.exports = manager;
