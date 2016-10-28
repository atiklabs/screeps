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
     * Try to pickup
     */
    Creep.prototype.tryToPickupHere = function () {
        if (this.carry.energy < this.carryCapacity) {
            var droppedEnergy = this.pos.findInRange(FIND_DROPPED_ENERGY, 1);
            if (droppedEnergy.length > 0 && this.pickup(droppedEnergy[0]) == OK) {
                this.say('pickup!');
                return true;
            }
        }
        return false;
    };

    /**
     * Pickup.
     */
    Creep.prototype.setToPickup = function () {
        if (this.carry.energy < this.carryCapacity) {
            var target = this.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            if (target !== null) {
                var result = this.pickup(target);
                if (result == OK) {
                    this.setState('ready');
                } else if (result == ERR_NOT_IN_RANGE) {
                    this.setState('pickup');
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
                let result = this.harvest(sources[this.getSourceIndex()]);
                if (result == OK) {
                    this.setState('harvest');
                } else if (result == ERR_NOT_IN_RANGE) {
                    this.moveTo(sources[this.getSourceIndex()]);
                } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
                    // if resources empty then withdraw and work
                    this.revokeSource();
                    this.setToWithdraw();
                }
            } else {
                // creep is full: deposit in container and continue harvesting if possible else is ready to work
                var containers = this.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER
                    }
                });
                if (containers.length > 0) {
                    let result = this.transfer(containers[0], RESOURCE_ENERGY);
                    if (result == OK) {
                        this.setState('harvest');
                    } else {
                        this.revokeSource();
                        this.setState('ready');
                    }
                } else {
                    this.revokeSource();
                    this.setState('ready');
                }
            }
        } else {
            // if we are not assigned to a source then withdraw
            this.setToWithdraw();
        }
    };

    /**
     * Withdraw
     * When useStorage is true then please do not use setToStorage or this will get stuck
     * @param {boolean} useStorage
     */
    Creep.prototype.setToWithdraw = function (useStorage = false) {
        if (this.carry.energy < this.carryCapacity) {
            if (useStorage == true) {
                // withdraw from the nearest storage or container (probably is an emergency)
                var structure = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER)
                            && structure.store[RESOURCE_ENERGY] > 0
                    }
                });
                if (structure !== null) {
                    let result = this.withdraw(structure, RESOURCE_ENERGY);
                    if (result == OK) {
                        this.setState('ready');
                    } else if (result == ERR_NOT_IN_RANGE) {
                        this.setState('withdraw');
                        this.moveTo(structure);
                    } else {
                        this.setState('free');
                    }
                } else {
                    // if no storage or container found is found then free (probably will just sit and wait)
                    this.setState('free');
                }
            } else {
                // withdraw only from storage, if there is a full container withdraw from a full one
                var fullContainers = this.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) == structure.storeCapacity
                    }
                });
                if (fullContainers.length > 0) {
                    let result = this.withdraw(fullContainers[0], RESOURCE_ENERGY);
                    if (result == OK) {
                        this.setState('ready');
                    } else if (result == ERR_NOT_IN_RANGE) {
                        this.setState('withdraw');
                        this.moveTo(fullContainers[0]);
                    } else {
                        this.setState('free');
                    }
                } else {
                    // if no full container in the room then go to the closest container if possible
                    var container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0
                        }
                    });
                    if (container !== null) {
                        let result = this.withdraw(container, RESOURCE_ENERGY);
                        if (result == OK) {
                            this.setState('ready');
                        } else if (result == ERR_NOT_IN_RANGE) {
                            this.setState('withdraw');
                            this.moveTo(container);
                        } else {
                            this.setState('free');
                        }
                    } else {
                        // if no container is found then try from storage
                        var storage = this.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0
                            }
                        });
                        if (storage !== null) {
                            let result = this.withdraw(storage, RESOURCE_ENERGY);
                            if (result == OK) {
                                this.setState('ready');
                            } else if (result == ERR_NOT_IN_RANGE) {
                                this.setState('withdraw');
                                this.moveTo(storage);
                            } else {
                                this.setState('free');
                            }
                        } else {
                            // if no storage or container found is found then free (probably will just sit and wait)
                            this.setState('free');
                        }
                    }
                }
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Withdraw from the nearest resource
     * Please do not use setToStorage or this will get stuck
     * @param {boolean} useStorage
     */
    Creep.prototype.setToWithdrawNearest = function () {
        if (this.carry.energy < this.carryCapacity) {
            // withdraw from the nearest storage or container (probably is an emergency)
            var structure = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER)
                        && structure.store[RESOURCE_ENERGY] > 0
                }
            });
            if (structure !== null) {
                let result = this.withdraw(structure, RESOURCE_ENERGY);
                if (result == OK) {
                    this.setState('ready');
                } else if (result == ERR_NOT_IN_RANGE) {
                    this.setState('withdraw');
                    this.moveTo(structure);
                } else {
                    this.setState('free');
                }
            } else {
                // if no storage or container found is found then free (probably will just sit and wait)
                this.setState('free');
            }
        } else {
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
            var result = this.transfer(target, RESOURCE_ENERGY);
            if (result == OK) {
                this.setState('transfer');
            } else if (result == ERR_NOT_IN_RANGE) {
                this.setState('transfer');
                this.moveTo(target);
            } else {
                this.setState('free');
            }
        } else {
            this.setState('ready');
        }
    };

    /**
     * Storage
     */
    Creep.prototype.setToStorage = function () {
        var storage = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE
            }
        });
        if (storage !== null) {
            var result = this.transfer(storage, RESOURCE_ENERGY);
            if (result == OK) {
                this.setState('free');
            } else if (result == ERR_NOT_IN_RANGE) {
                this.setState('storage');
                this.moveTo(storage);
            } else {
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
            var result = this.build(target);
            if (result == OK) {
                this.setState('build');
            } else if (result == ERR_NOT_IN_RANGE) {
                this.setState('build');
                this.moveTo(target);
            } else {
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
        // repair first any of *MY* structures until totally repaired
        let target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax && structure.hits < 50000
            }
        });
        if (target !== null) {
            let result = this.repair(target);
            if (result == OK) {
                this.setState('repair');
            } else if (result == ERR_NOT_IN_RANGE) {
                this.setState('repair');
                this.moveTo(target);
            } else {
                this.setState('free');
            }
        } else {
            // repair any container
            let target = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && structure.hits < structure.hitsMax
                }
            });
            if (target !== null) {
                let result = this.repair(target);
                if (result == OK) {
                    this.setState('repair');
                } else if (result == ERR_NOT_IN_RANGE) {
                    this.setState('repair');
                    this.moveTo(target);
                } else {
                    this.setState('free');
                }
            } else {
                // repair any wall or road, if it's a road and worker_locations of the road is 0 do not repair.
                let targets = this.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax && (
                            structure.structureType == STRUCTURE_WALL || (
                                structure.structureType == STRUCTURE_ROAD && (
                                    typeof Memory.architect.worker_locations[structure.pos.roomName] != 'undefined' &&
                                    typeof Memory.architect.worker_locations[structure.pos.roomName][structure.pos.x] != 'undefined' &&
                                    typeof Memory.architect.worker_locations[structure.pos.roomName][structure.pos.x][structure.pos.y] != 'undefined' &&
                                    Memory.architect.worker_locations[structure.pos.roomName][structure.pos.x][structure.pos.y] > 0
                                )
                            )
                        );
                    }
                });
                targets.sort((a, b) => a.hits - b.hits);
                if (targets.length > 0) {
                    var result = this.repair(targets[0]);
                    if (result == OK) {
                        this.setState('repair');
                    } else if (result == ERR_NOT_IN_RANGE) {
                        this.setState('repair');
                        this.moveTo(targets[0]);
                    } else {
                        this.setState('free');
                    }
                } else {
                    // everything is repaired
                    this.setState('ready');
                }
            }
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
            var result = this.transfer(target, RESOURCE_ENERGY);
            if (result == OK) {
                this.setState('free');
            } else if (result == ERR_NOT_IN_RANGE) {
                this.setState('tower');
                this.moveTo(target);
            } else {
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
        var result = this.upgradeController(this.room.controller);
        if (result == OK) {
            this.setState('upgrade');
        } else if (result == ERR_NOT_IN_RANGE) {
            this.setState('upgrade');
            this.moveTo(this.room.controller);
        } else  {
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
        if (!ramparts[this.getRampartIndex()].pos.isEqualTo(this.pos)) {
            this.moveTo(ramparts[this.getRampartIndex()]);
        } else {
            var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target !== null) {
                console.log('target found');
                switch (this.memory.archetype) {
                    case 'attacker':
                        this.attack(target);
                        console.log('attack');
                        break;
                    case 'defender':
                        this.rangedAttack(target);
                        console.log('attack');
                        break;
                }
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
