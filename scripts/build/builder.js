const replaceVersion = require("./replaceVersion");
const replaceCopyright = require("./replaceCopyright");

console.log(`OpenUI5-FHIR builder started...`);

replaceVersion();
replaceCopyright();