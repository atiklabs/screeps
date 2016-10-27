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
     * @param {int|null} rampart_index
     */
    Creep.prototype.setRampartIndex = function (rampart_index) {
        if (this.memory.rampart_index != rampart_index) {
            this.memory.rampart_index = rampart_index;
        }
    };

    /**
     * Get source index
     */
    Creep.prototype.getSourceIndex = function () {
        if (typeof this.memory.source_index == 'undefined') return null;
        return this.memory.source_index;
    };

    /**
     * Set source index
     * @param {int|null} source_index
     */
    Creep.prototype.setSourceIndex = function (source_index) {
        if (this.memory.source_index != source_index) {
            this.memory.source_index = source_index;
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
        var soldiers = this.room.getAllSoldiers();
        var soldiersLength = soldiers.length;
        // check occupied ramparts
        var rampartOccupied = new Array(rampartsLength).fill(false);
        for (let i = 0; i < soldiersLength; i++) {
            if (soldiers[i].getRampartIndex() !== null) {
                rampartOccupied[soldiers[i].getRampartIndex()] = true;
            }
        }
        // get a free rampart
        for (let i = 0; i < rampartsLength; i++) {
            if (rampartOccupied[i] === false) {
                this.setRampartIndex(i);
                return i;
            }
        }
        return null;
    };

    /**
     * Revoke a worker rampart.
     */
    Creep.prototype.revokeRampart = function () {
        this.setRampartIndex(null);
    };

    /**
     * Assigns a source to the worker
     * @return {int|null}
     */
    Creep.prototype.assignSource = function () {
        // initialize variables
        var sources = this.room.find(FIND_SOURCES);
        var sourcesLength = sources.length;
        var workers = this.room.getAllWorkers();
        var workersLength = workers.length;
        var occupiedSources = new Array(sourcesLength).fill(false);
        // get occupied sources
        for (let i = 0; i < workersLength; i++) {
            if (workers[i].getSourceIndex() !== null) {
                occupiedSources[workers[i].getSourceIndex()] = true;
            }
        }
        // get an empty source
        for (let i = 0; i < sourcesLength; i++) {
            if (occupiedSources[i] === false) {
                this.setSourceIndex(i);
                return i;
            }
        }
        return null;
    };

    /**
     * Revoke a worker source.
     */
    Creep.prototype.revokeSource = function () {
        this.setSourceIndex(null);
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
        if (this.getSourceIndex() !== null || this.assignSource() !== null) {
            // if we are assigned to a source then harvest
            this.setState('harvest');
            if (this.carry.energy < this.carryCapacity) {
                // creep is not full: harvest if possible else withdraw
                var sources = this.room.find(FIND_SOURCES);
                var result = this.harvest(sources[this.getSourceIndex()]);
                if (result == ERR_NOT_IN_RANGE) {
                    this.moveTo(sources[this.getSourceIndex()]);
                } else if (result == ERR_NOT_ENOUGH_RESOURCES) { // if resources empty then withdraw
                    this.setState('withdraw');
                }
            } else {
                // creep is full: deposit in container and continue harvesting if possible else is ready
                var container = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER
                    }
                });
                //                     && (_.sum(container.store) + this.carry.energy) < container.storeCapacity
                console.log(_.sum(container.store) + ' ' + this.carry.energy + ' ' + container.storeCapacity);
                if (container !== null) {
                    if (container !== this.pos) {
                        this.moveTo(container);
                    } else {
                        this.drop(RESOURCE_ENERGY);
                    }
                } else {
                    this.revokeSource();
                    this.setState('ready');
                }
            }
        } else {
            // if we are not assigned to a source then withdraw
            this.setState('withdraw');
        }
    };

    /**
     * Withdraw
     */
    Creep.prototype.setToWithdraw = function () {
        var containers = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
            }
        });
        if (containers.length > 0) {
            this.setState('withdraw');
            containers.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
            if (this.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(containers[0]);
            } else {
                this.setState('ready');
            }
        } else {
            this.setState('free');
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
     * Attack nearest hostile creep
     */
    Creep.prototype.setToAttackNearestHostileCreep = function () {
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target !== null) {
            switch (this.memory.archetype) {
                case 'attacker':
                    if (this.attack(target) == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                    }
                    break;
                case 'defender':
                    if (this.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                    }
                    break;
            }
        }
    };

    /**
     * Defend room
     */
    Creep.prototype.setToDefendRoom = function () {
        var ramparts = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART
            }
        });
        if (this.getRampartIndex() === null) {
            if (this.assignRampart() === null) {
                this.setToAttackNearestHostileCreep();
            }
        }
        if (ramparts[this.getRampartIndex()] !== this.pos) {
            this.moveTo(ramparts[this.getRampartIndex()]);
        } else {
            var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            switch (this.memory.archetype) {
                case 'attacker':
                    this.attack(target);
                    break;
                case 'defender':
                    this.rangedAttack(target);
                    break;
            }
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
