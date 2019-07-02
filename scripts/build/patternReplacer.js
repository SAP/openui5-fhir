const replace = require("replace-in-file");

module.exports = function (taskName, options) {
    return replace(options)
        .then(results => {
            console.log("OpenUI5-FHIR builder task " + taskName + " completed successfully.");
        })
        .catch(error => {
            console.error("OpenUI5-FHIR builder task " + taskName + " failed with following error: " + error);
        });
};