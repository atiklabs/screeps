require('prototype.structureSpawn')();
var code = require('code');
var tools = require('tools');
var director = require('director');

/**
 * Main loop function
 */
module.exports.loop = function () {
    // This will clean the unused memory
    tools.cleanMemory();
    // This code will update previous versions of the software
    code.update();
    // Call director
    director.orchestrate();
};
