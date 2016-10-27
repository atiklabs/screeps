/**
 * Extend creep
 */
module.exports = function () {
    /**
     * Get the state of a worker.
     */
    Creep.prototype.getState = function () {
        return this.memory.state;
    };

    /**
     * Set an state and say it.
     * @param {string} state
     */
    Creep.prototype.setState = function (state) {
        if (this.memory.state != state) {
            this.memory.state = state;
            this.say(state);
        }
    };

    /**
     * Get rampart index
     */
    Creep.prototype.getRampartIndex = function () {
        if (typeof this.memory.rampart_index == 'undefined') return null;
        return this.memory.rampart_index;
    };

    /**
     * Set rampart index
     * @param {string} state
     */
    Creep.prototype.setRampartIndex = function (rampart_index) {
        if (this.memory.rampart_index != rampart_index) {
            this.memory.rampart_index = rampart_index;
        }
    };

    /**
     * Assigns a rampart to the worker
     * @returns {int|null}
     */
    Creep.prototype.assignRampart = function () {
        // initialize variables
        var ramparts = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART
            }
        });
        var rampartsLength = ramparts.length;
        var attackers = this.room.getAllSoldiers();
        var attackersLength = attackers.length;
        // check occupied ramparts
        var rampartOccupied = new Array(rampartsLength).fill(false);
        for (let i = 0; i < attackersLength; i++) {
            if (attackers[i].getRampartIndex() !== null) {
                rampartOccupied[attackers[i].getRampartIndex()] = true;
            }
        }
        // get a free rampart
        for (let i = 1; i < rampartsLength; i++) {
            if (rampartOccupied[i] == false) {
                this.memory.setRampartIndex(i);
                return i;
            }
        }
        return null;
    };

    /**
     * Revoke a worker rampart.
     */
    Creep.prototype.revokeRampart = function () {
        delete this.memory.rampart_index;
    };

    /**
     * Assigns a source to the worker
     */
    Creep.prototype.assignSource = function () {
        // initialize variables
        var sources = this.room.find(FIND_SOURCES);
        var sourcesLength = sources.length;
        var workers = this.room.getAllWorkers();
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
     */
    Creep.prototype.revokeSource = function () {
        this.memory.source_index = null;
    };

    /**
     * Pickup.
     */
    Creep.prototype.setToPickup = function() {
        if (this.carry.energy < this.carryCapacity) {
            this.setState('pickup');
            var target = this.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            if (target !== null) {
                if (this.pickup(target) == ERR_NOT_IN_RANGE) {
                    this.moveTo(target);
                }
            } else {
                this.setState('free');
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Harvest
     */
    Creep.prototype.setToHarvest = function () {
        if (this.carry.energy < this.carryCapacity) {
            this.setState('harvest');
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
     */
    Creep.prototype.setToTransfer = function () {
        var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (target !== null) {
            this.setState('transfer');
            if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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
     */
    Creep.prototype.setToBuild = function () {
        var target = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target !== null) {
            this.setState('build');
            if (this.build(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            } else if (this.carry.energy === 0) {
                this.setState('free');
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Repair
     */
    Creep.prototype.setToRepair = function () {
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
            this.setState('repair');
            if (this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(targets[0]);
            } else if (this.carry.energy === 0) {
                this.setState('free');
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Tower
     */
    Creep.prototype.setToTower = function () {
        var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity;
            }
        });
        if (target !== null) {
            this.setState('tower');
            if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            } else if (this.carry.energy === 0) {
                this.setState('free');
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Upgrade
     */
    Creep.prototype.setToUpgrade = function () {
        this.setState('upgrade');
        if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller);
        } else if (this.carry.energy === 0) {
            this.setState('free');
        }
    };

    /**
     * Defend room
     */
    Creep.prototype.setToDefendRoom = function () {
        if (this.getRampartIndex() === null) {
            if (this.assignRampart() === null) {
                return; // do nothing
            }
        }
        var ramparts = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART
            }
        });
        if (ramparts[this.getRampartIndex()] !== this.pos) {
            this.moveTo(ramparts[this.getRampartIndex()]);
            return;
        }
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        this.attack(target);
    };

    /**
     * Attack nearest hostile creep
     */
    Creep.prototype.setToAttackNearestHostileCreep = function () {
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target !== null) {
            if (this.attack(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }
        } else {
            this.setToDefendRoom();
        }
    };

    /**
     * Heal most damaged attacker or follow the nearest attacker
     */
    Creep.prototype.setToHealMostDamagedAttacker = function () {
        var targets = this.room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return (creep.memory.role == 'soldier' && creep.memory.archetype == 'attacker');
            }
        });
        if (targets.length > 0) {
            targets.sort(function (a, b) {
                return a.hits - b.hits;
            });
            if (this.heal(targets[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(targets[0]);
            }
        }
    };
};
