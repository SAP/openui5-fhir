module.exports = function (config) {
	"use strict";
	require("./karma.conf")(config);
	config.set({
		ui5: {
			url: "https://openui5.hana.ondemand.com",
			testpage: "test/qunit/unit.qunit.html"
		},
		coverageReporter: {
			reporters: [
				{
					type: "html",
					dir: "test-results",
					subdir: "coverage/unit/html"
				},
				{
					type: "cobertura",
					dir: "test-results",
					subdir: "coverage/unit/xml",
					file: "cobertura-coverage.xml"
				},
				{
					type: "text"
				}
			],
			check: {
				global: {
					lines: 76.68
				}
			}
		},
		junitReporter: {
			outputDir: "test-results/junit",
			outputFile: "junit-results-unit.xml",
			useBrowserName: false
		}
	});
};