const patternReplacer = require("./patternReplacer");

module.exports = function (version = process.env.npm_package_version) {
    console.log("OpenUI5-FHIR builder task replaceVersion started with: " + version + "...");

    const options = {
        files: ["src/sap/fhir/**/*.js", "src/sap/fhir/.library"],
        from: /\$\{version\}/g,
        to: version,
    };

    return patternReplacer("replaceVersion", options);
};