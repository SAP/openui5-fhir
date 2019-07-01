const replace = require("replace-in-file");

const version = process.env.npm_package_version;

function replaceVersion() {
    console.log(`OpenUI5-FHIR builder started with version: ${version}`);

    const options = {
        files: ["src/sap/fhir/**/*.js", "src/sap/fhir/.library"],
        from: /\$\{version\}/g,
        to: version,
    };

    replace(options)
        .then(results => {
            console.log("Replacement results:", results);
        })
        .catch(error => {
            console.error("Error occurred:", error);
        });
}

module.exports = replaceVersion;