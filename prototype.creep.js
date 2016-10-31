/**
 * Extend creep
 */
module.exports = function () {
    /**
     * Get something in memory
     */
    Creep.prototype.getValue = function(key) {
        if (typeof this.memory[key] != 'undefined') {
            return this.memory[key];
        }
        return null;
    };

    /**
     * Set something in memory
     */
    Creep.prototype.setValue = function(key, value) {
        if (this.memory[key] !== value) {
            this.memory[key] = value;
        }
    };

    /**
     * Get the state of a worker.
     */
    Creep.prototype.getState = function () {
        return this.memory.state;
    };

    /**
     * Set an state and say it.
     * @param {string} state
     */
    Creep.prototype.setState = function (state) {
        if (this.memory.state != state) {
            this.memory.state = state;
        }
        this.say(state);
    };
};
