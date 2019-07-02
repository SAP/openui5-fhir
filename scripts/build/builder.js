const replaceVersion = require("./replaceVersion");
const replaceCopyright = require("./replaceCopyright");

console.log("OpenUI5-FHIR builder started...");

replaceVersion()
    .then(replaceCopyright)
    .then(() => console.log("OpenUI5-FHIR builder finished successfully."));