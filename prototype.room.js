/**
 * Extend Room
 */
module.exports = function () {
    /**
     * Get all workers
     * @return Array{Creep}
     */
    Room.prototype.getAllWorkers = function () {
        return _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.room.name == this.name);
    };

    /**
     * Get all army units
     * @return Array{Creep}
     */
    Room.prototype.getAllSoldiers = function () {
        return _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' && creep.room.name == this.name);
    };

    /**
     * @return {StructureLink|null}
     */
    Room.prototype.getControllerLink = function () {
        var links = this.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_LINK
            }
        });
        var linksLength = links.length;
        for (let i = 0; i < linksLength; i++) {
            if (links[i].isControllerLink()) return links[i];
        }
        return null;
    };
};
