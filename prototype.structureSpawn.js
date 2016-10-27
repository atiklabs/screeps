/**
 * Extend Structure Spawn
 */
module.exports = function () {
    /**
     * Create worker
     * @returns {string|int}
     */
    StructureSpawn.prototype.createWorker = function () {
        var level = 0;
        var capacitySpent = 0;
        var parts = [];
        while (capacitySpent + 200 <= this.room.energyAvailable) {
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
            Game.creeps[name].memory.initial_room = this.room.roomName;
            Game.creeps[name].memory.source_index = null;
            Game.creeps[name].memory.level = level;
            return name;
        }
        return name;
    };

    StructureSpawn.prototype.createAttacker = function() {
        var parts = [];
        var level = 0;
        var capacitySpent = 0;
        while (capacitySpent + 130 <= this.room.energyAvailable) {
            parts.push(ATTACK); // 80
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 130;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.archetype = 'attacker';
            Game.creeps[name].memory.level = level;
            return name;
        }
        return name;
    };

    StructureSpawn.prototype.createDefender = function() {
        var parts = [];
        var level = 0;
        var capacitySpent = 0;
        while (capacitySpent + 200 <= this.room.energyAvailable) {
            parts.push(RANGED_ATTACK); // 150
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 200;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.archetype = 'defender';
            Game.creeps[name].memory.level = level;
            return name;
        }
        return name;
    };

    StructureSpawn.prototype.createHealer = function() {
        var parts = [];
        var level = 0;
        var capacitySpent = 0;
        while (capacitySpent + 300 <= this.room.energyAvailable) {
            parts.push(HEAL); // 250
            parts.push(MOVE); // 50
            level++;
            capacitySpent += 300;
        }
        var name = this.createCreep(parts);
        if (name !== null && isNaN(name)) {
            Game.creeps[name].memory.role = 'soldier';
            Game.creeps[name].memory.state = 'init';
            Game.creeps[name].memory.archetype = 'healer';
            Game.creeps[name].memory.level = level;
            return name;
        }
        return name;
    };
};
