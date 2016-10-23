var tools = require('tools');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    tools.cleanMemory();

    // Useful variables
    var numberOfHarvesters = 5;
    var numberOfUpgraders = 5;
    var numberOfBuilders = 2;

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    console.log(
        'Harvesters: ' + harvesters.length + '/' + numberOfHarvesters + ', ' +
        'Upgraders: ' + upgraders.length + '/' + numberOfUpgraders + ', ' +
        'Builders: ' + builders.length + '/' + numberOfBuilders
    );

    // Tell every creep what to do
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }

    // Spawn automatically harvesters
    if (harvesters.length < numberOfHarvesters) {
        var name = Game.spawns['Base'].createCreep([WORK, CARRY, MOVE]);
        if (isNaN(name)) {
            Game.creeps[name].memory.role = 'harvester';
            console.log("Spawned new creep.harvester: " + name);
        }
    }

    // Spawn automatically one upgrader
    if (upgraders.length < numberOfUpgraders) {
        var name = Game.spawns['Base'].createCreep([WORK, CARRY, MOVE]);
        if (isNaN(name)) {
            Game.creeps[name].memory.role = 'upgrader';
            console.log("Spawned new creep.upgrader: " + name);
        }
    }

    // Spawn automatically one builder
    if (builders.length < numberOfBuilders) {
        var name = Game.spawns['Base'].createCreep([WORK, CARRY, MOVE]);
        if (isNaN(name)) {
            Game.creeps[name].memory.role = 'builder';
            console.log("Spawned new creep.builder: " + name);
        }
    }
}
