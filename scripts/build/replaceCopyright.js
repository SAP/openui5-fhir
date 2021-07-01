const patternReplacer = require("./patternReplacer");
const yaml = require('js-yaml');
const fs = require('fs');
const yamlPath = "ui5.yaml";

function getDefaultCopyRight() {
    const content = replaceCurrentYear(fs.readFileSync(yamlPath, 'utf8'));
    const yamlContent = yaml.load(content);
    return yamlContent.metadata.copyright;
}

function replaceCurrentYear(content) {
    return content.replace(/\$\{currentYear\}/g, new Date().getFullYear());
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