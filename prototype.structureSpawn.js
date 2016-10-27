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
        while (capacitySpent + 200 <= this.room.energyCapacityAvailable) {
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
};
