/**
 * Extend creep
 */
module.exports = function () {
    /**
     * Get the state of a worker.
     */
    StructureSpawn.prototype.getState = function () {
        return this.memory.state;
    };

    /**
     * Set an state and say it.
     * @param {string} state
     */
    StructureSpawn.prototype.setState = function (state) {
        if (this.memory.state != state) {
            this.memory.state = state;
            this.say(state);
        }
    };

    /**
     * Harvest
     */
    StructureSpawn.prototype.harvestAction =  function () {
        if (this.carry.energy < this.carryCapacity) {
            var sources = this.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return source.energy > 0 || source.ticksToRegeneration < 10
                }
            });
            if (this.memory.source_index === null) {
                this.assignSource(this);
            }
            var error = this.harvest(sources[this.memory.source_index]);
            if (error == ERR_NOT_IN_RANGE) {
                this.moveTo(sources[this.memory.source_index]);
            } else if (error == ERR_NOT_ENOUGH_RESOURCES) {
                this.revokeSource(this);
                this.setState('ready');
            }
        } else {
            this.revokeSource(this);
            this.setState('ready');
        }
    };

    /**
     * Transfer
     * @param {Creep} worker
     */
    StructureSpawn.prototype.transferAction = function () {
        var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (target !== null) {
            this.setState(this, 'transfer');
            if (this.transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            } else if (this.carry.energy === 0) {
                this.setState('free');
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Build
     * @param {Creep} worker
     */
    StructureSpawn.prototype.buildAction = function () {
        var target = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target !== null) {
            this.setState(this, 'build');
            if (this.build(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            } else if (this.carry.energy === 0) {
                this.setState(this, 'free');
            }
        } else {
            this.setState(this, 'ready');
        }
    };

    /**
     * Repair
     * @param {Creep} worker
     */
    StructureSpawn.prototype.repairAction = function () {
        var targets = this.room.find(FIND_STRUCTURES, {
            // repair damaged structures, if it's a road and worker_locations of the road is 0 do not repair.
            filter: structure => {
                return structure.hits < structure.hitsMax && (
                        structure.structureType != STRUCTURE_ROAD || (
                            typeof Memory.architect.worker_locations[structure.pos.roomName] != 'undefined' &&
                            typeof Memory.architect.worker_locations[structure.pos.roomName][structure.pos.x] != 'undefined' &&
                            typeof Memory.architect.worker_locations[structure.pos.roomName][structure.pos.x][structure.pos.y] != 'undefined' &&
                            Memory.architect.worker_locations[structure.pos.roomName][structure.pos.x][structure.pos.y] > 0
                        )
                    );
            }
        });
        targets.sort((a, b) => a.hits - b.hits);
        if (targets.length > 0) {
            this.setState(this, 'repair');
            if (this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(targets[0]);
            } else if (this.carry.energy === 0) {
                this.setState(this, 'free');
            }
        } else {
            this.setState(this, 'ready');
        }
    };

    /**
     * Tower
     * @param {Creep} worker
     */
    StructureSpawn.prototype.towerAction = function () {
        var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity;
            }
        });
        if (target !== null) {
            this.setState(this, 'tower');
            if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            } else if (this.carry.energy === 0) {
                this.setState(this, 'free');
            }
        } else {
            this.setState(this, 'ready');
        }
    };

    /**
     * Upgrade
     * @param {Creep} worker
     */
    StructureSpawn.prototype.upgradeAction = function () {
        this.setState(this, 'upgrade');
        if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller);
        } else if (this.carry.energy === 0) {
            this.setState(this, 'free');
        }
    };

    /**
     * Assigns a source to the worker
     * @param {Creep} worker
     */
    StructureSpawn.prototype.assignSource = function () {
        // initialize variables
        var sources = this.room.find(FIND_SOURCES);
        var sourcesLength = sources.length;
        var workers = this.getAllWorkers(this.memory.initial_room);
        var workersLength = workers.length;
        var workersAssignedToSource = new Array(sourcesLength);
        for (let i = 0; i < sourcesLength; i++) {
            workersAssignedToSource[i] = 0;
        }
        // get number of assigned workers in every source
        for (let i = 0; i < workersLength; i++) {
            if (workers[i].memory.source_index !== null) {
                workersAssignedToSource[workers[i].memory.source_index]++;
            }
        }
        // get the source with the minimum workers assigned
        var minSourceIndex = 0;
        var minSourceWorkers = workersAssignedToSource[minSourceIndex];
        for (let i = 1; i < sourcesLength; i++) {
            if (workersAssignedToSource[i] < minSourceWorkers) {
                minSourceIndex = i;
            }
        }
        this.memory.source_index = minSourceIndex;
    };

    /**
     * Revoke a worker source.
     * @param {Creep} worker
     */
    StructureSpawn.prototype.revokeSource = function () {
        this.memory.source_index = null;
    };
};
