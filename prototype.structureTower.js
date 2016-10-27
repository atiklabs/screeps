/**
 * Extend Structure Tower
 */
module.exports = function () {
    /**
     * Defend room
     */
    StructureTower.prototype.defendRoom = function () {
        var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            this.attack(hostiles[0]);
        }
    };
};
