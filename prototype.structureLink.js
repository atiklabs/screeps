/**
 * Extend Structure Link
 */
module.exports = function () {
    /**
     * Transfer energy
     */
    StructureLink.prototype.transferEnergyToControllerLink = function () {
        if (!this.isControllerLink() && this.energy > 0) {
            console.log('is not controller link');
            var controllerLink = this.room.getControllerLink();
            if (controllerLink != null) {
                console.log('transfer');
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
