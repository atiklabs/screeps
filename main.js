// load prototypes
require('prototype.creep')();
require('prototype.room')();
require('prototype.structureSpawn')();
require('prototype.structureTower')();
// load variables
var code = require('code');
var tools = require('tools');
var director = require('director');
var manager = require('manager');
var general = require('general');
var architect = require('architect');

/**
 * Main loop function
 */
module.exports.loop = function () {
    // This will clean the unused memory
    tools.cleanMemory();
    // This code will update previous versions of the software
    code.update();
    // Call director
    director.orchestrate(manager, general, architect);
};
