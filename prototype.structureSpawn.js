/**
 * Extend Structure Spawn
 */
module.exports = function () {
    /**
     * Create worker
     * @param {boolean} useMaxEnergy
     * @returns {string|int}
     */
    StructureSpawn.prototype.createWorker = function (useMaxEnergy = true) {
        var level = 0;
        var capacitySpent = 0;
        var parts = [];
        var energyTotal = this.room.energyAvailable;
        if (useMaxEnergy) energyTotal = this.room.energyCapacityAvailable;
        while (capacitySpent + 200 <= energyTotal) {
            parts.push(WORK); // 100
            parts.push(CARRY); // 50
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 200;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'worker';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.home = this.room.name;
            Game.creeps[name].memory.level = level;
            Game.creeps[name].memory.source_index = null;
            return name;
        }
        return name;
    };

    /**
     * Create Attacker
     * @param {boolean} useMaxEnergy
     * @returns {string|null}
     */
    StructureSpawn.prototype.createAttacker = function(useMaxEnergy = true) {
        var parts = [];
        var level = 0;
        var capacitySpent = 0;
        var energyTotal = this.room.energyAvailable;
        if (useMaxEnergy) energyTotal = this.room.energyCapacityAvailable;
        while (capacitySpent + 130 <= energyTotal) {
            parts.push(ATTACK); // 80
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 130;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.home = this.room.name;
            Game.creeps[name].memory.level = level;
            Game.creeps[name].memory.archetype = 'attacker';
            return name;
        }
        return name;
    };

    /**
     * Create Defender
     * @param {boolean} useMaxEnergy
     * @returns {string|null}
     */
    StructureSpawn.prototype.createDefender = function(useMaxEnergy = true) {
        var parts = [];
        var level = 0;
        var capacitySpent = 0;
        var energyTotal = this.room.energyAvailable;
        if (useMaxEnergy) energyTotal = this.room.energyCapacityAvailable;
        while (capacitySpent + 200 <= energyTotal) {
            parts.push(RANGED_ATTACK); // 150
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 200;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.home = this.room.name;
            Game.creeps[name].memory.level = level;
            Game.creeps[name].memory.archetype = 'defender';
            return name;
        }
        return name;
    };

    /**
     * Create Healer
     * @param {boolean} useMaxEnergy
     * @returns {string|null}
     */
    StructureSpawn.prototype.createHealer = function(useMaxEnergy = true) {
        var parts = [];
        var level = 0;
        var capacitySpent = 0;
        var energyTotal = this.room.energyAvailable;
        if (useMaxEnergy) energyTotal = this.room.energyCapacityAvailable;
        while (capacitySpent + 300 <= energyTotal) {
            parts.push(HEAL); // 250
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 300;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.home = this.room.name;
            Game.creeps[name].memory.level = level;
            Game.creeps[name].memory.archetype = 'healer';
            return name;
        }
        return name;
    };

    /**
     * Create Scout
     * @returns {string|null}
     */
    StructureSpawn.prototype.createScout = function() {
        var parts = [];
        parts.push(CLAIM); // 600
        parts.push(MOVE); // 50
        parts.push(MOVE); // 50
        parts.push(MOVE); // 50
        parts.push(MOVE); // 50
        parts.push(MOVE); // 50 // 850
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.archetype = 'scout';
            Game.creeps[name].memory.level = 1;
            return name;
        }
        return name;
    };
};
