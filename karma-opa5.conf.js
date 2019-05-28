module.exports = function (config) {
	"use strict";
	require("./karma.conf")(config);
	config.set({
		ui5: {
			testpage: "test/sap-fhir-test-app/webapp/test/opa5/all.opa5.html"
		},
		coverageReporter: {
			reporters: [
				{
					type: "html",
					dir: "test-results",
					subdir: "coverage/opa5/html"
				},
				{
					type: "cobertura",
					dir: "test-results",
					subdir: "coverage/opa5/xml",
					file: "cobertura-coverage.xml"
				},
				{
					type: "text"
				}
			],
			check: {
				global: {
					lines: 89
				}
			}
		},
		junitReporter: {
			outputDir: "test-results/junit",
			outputFile: "junit-results-opa5.xml",
			useBrowserName: false
		}
	});
};