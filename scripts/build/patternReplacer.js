const replace = require("replace-in-file");

module.exports = function (taskName, options) {
    try {
        console.log("OpenUI5-FHIR builder task " + taskName + " completed successfully.");
        replace.sync(options);
    }
    catch (error) {
        console.error("OpenUI5-FHIR builder task " + taskName + " failed with following error: " + error);
    }
};