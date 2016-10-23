var code = require('code');
var tools = require('tools');
var arquitect = require('arquitect');
var manager = require('manager');

module.exports.loop = function () {
  // This will clean the unused memory
  tools.cleanMemory();
  // This code will update previous versions of the software
  code.update();
  // Arquitect to design the construction sites
  arquitect.plan();
  // Manage probes
  manager.manage();
};
