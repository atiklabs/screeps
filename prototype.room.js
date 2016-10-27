/**
 * Extend Room
 */
module.exports = function () {
    /**
     * Get all workers
     * @return {array} workers
     */
    Room.prototype.getAllWorkers = function () {
        return _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.initial_room == this.roomName);
    }
};
