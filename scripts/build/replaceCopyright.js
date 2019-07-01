const patternReplacer = require("./patternReplacer");

function getDefaultCopyRight() {
    return "Arschloch";
}

module.exports = function (copyright = getDefaultCopyRight()) {
    console.log("OpenUI5-FHIR builder task replaceCopyright...");

    const options = {
        files: ["src/sap/fhir/**/*.js", "src/sap/fhir/.library"],
        from: /\$\{copyright\}/g,
        to: copyright,
    };

    return patternReplacer("replaceCopyright", options);
};