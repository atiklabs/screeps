/**
 * Extend Structure Link
 */
module.exports = function () {
    /**
     * Transfer energy
     */
    StructureLink.prototype.transferEnergyToControllerLink = function () {
        if (!this.isControllerLink()) {
            var controllerLink = this.room.getControllerLink();
            if (controllerLink != null) {
                this.transferEnergy(controllerLink);
            }
        }
    };

    /**
     * Create worker
     * @returns {boolean}
     */
    StructureLink.prototype.isControllerLink = function () {
        return this.pos.getRangeTo(this.room.controller) < 5;
    };
};
