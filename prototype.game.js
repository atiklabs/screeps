/**
 * Extend Game
 */
module.exports = function () {
    /**
     * Get all scouts
     * @return Array{Creep}
     */
    Game.prototype.getAllScouts = function () {
        return _.filter(this.creeps, (creep) => creep.memory.role == 'soldier' && creep.memory.role == 'scout');
    };
};
