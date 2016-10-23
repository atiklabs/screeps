var code = require('code');
var tools = require('tools');
var probe = require('role.probe');

module.exports.loop = function () {
    // This will clean the unused memory
    tools.cleanMemory();

    // This code will update previous versions of the software
    code.update();

    // Manage probes
    probe.manage();
};
