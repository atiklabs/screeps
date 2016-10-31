/**
 * Extend creep
 */
module.exports = function () {
    /**
     * Get rampart index
     * @return {string|null}
     */
    Creep.prototype.getRampartIndex = function () {
        if (typeof this.memory.rampart_index == 'undefined') return null;
        return this.memory.rampart_index;
    };

    /**
     * Set rampart index
     * @param {string|null} rampart_index
     */
    Creep.prototype.setRampartIndex = function (rampart_index) {
        if (this.memory.rampart_index != rampart_index) {
            this.memory.rampart_index = rampart_index;
        }
    };

    /**
     * Assigns a rampart to the worker
     * @returns {string|null}
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
        // get current soldiers ramparts
        var currentSoldiersRamparts = [];
        for (let i = 0; i < soldiersLength; i++) {
            if (soldiers[i].getSourceIndex() !== null) {
                currentSoldiersRamparts.push(soldiers[i].getSourceIndex());
            }
        }
        // get an empty rampart
        for (let i = 0; i < rampartsLength; i++) {
            if (currentSoldiersRamparts.indexOf(ramparts[i].id) === -1) {
                this.setSourceIndex(ramparts[i].id);
                return ramparts[i].id;
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
        if (this.getRampartIndex() === null) {
            if (this.assignRampart() === null) {
                this.setToAttackNearestHostileCreep();
            }
        }
        var rampart = Game.getObjectById(this.getRampartIndex());
        if (rampart !== null) {
            if (!rampart.pos.isEqualTo(this.pos)) {
                this.moveTo(rampart);
            } else {
                var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target !== null) {
                    switch (this.memory.archetype) {
                        case 'attacker':
                            this.attack(target);
                            break;
                        case 'defender':
                            this.rangedAttack(target);
                            break;
                    }
                }
            }
        } else {
            // rampart does not longer exist
            this.revokeRampart();
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

    /**
     * Scouting Mission
     */
    Creep.prototype.setToScout = function () {
        /**
         * Choose room to go.
         * Move to room.
         * Avoid other creeps.
         * Maybe can get stuck so check if it's possible to go to the room.
         * If we like the room claim it.
         */
        if (this.room.name != 'E67N51') {
            var exitDir = this.room.findExitTo('E67N51');
            var exit = this.pos.findClosestByRange(exitDir);
            this.moveTo(exit);
        } else {
            var result = this.claimController(this.room.controller);
            if (result == OK) {
            } else if (result == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            } else  {
            }
        }
    };
};
