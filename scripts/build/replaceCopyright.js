const patternReplacer = require("./patternReplacer");
const yaml = require('js-yaml');
const fs = require('fs');
const yamlPath = "ui5.yaml";

function getDefaultCopyRight() {
    const content = fs.readFileSync(yamlPath, 'utf8');
    const yamlContent = yaml.safeLoad(content);
    return yamlContent.metadata.copyright;
}

module.exports = function (copyright = getDefaultCopyRight()) {
    console.log("OpenUI5-FHIR builder task replaceCopyright started...");

    const options = {
        files: ["src/sap/fhir/**/*.js", "src/sap/fhir/.library"],
        from: /\$\{copyright\}/g,
        to: copyright,
    };

    return patternReplacer("replaceCopyright", options);
};