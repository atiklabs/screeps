/**
 * The general will command the troops based on an strategy to win any opponent.
 */
var general = {
  /**
   * Commant the troops to the victory.
   */
  command: function() {

  },

  /**
   * Comm'on folks! Time to join the army!
   */
  recruit: function() {

  },

  /**
  * Get all army units
  * @return {array} army
  */
  getAllSoldiers: function() {
    return _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier');
  }
};

module.exports = general;
