/**
 * Extend Room
 */
module.exports = function () {
    /**
     * Get all workers
     * @return {array} workers
     */
    Room.prototype.getAllWorkers = function () {
        return _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.room.name == this.name);
    };

    /**
     * Get all army units
     * @return {array} army
     */
    Room.prototype.getAllSoldiers = function () {
        return _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' && creep.room.name == this.name);
    }
};
