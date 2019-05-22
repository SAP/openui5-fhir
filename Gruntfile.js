/* eslint-disable global-require, no-undef */
module.exports = function (grunt) {
	/* eslint-enable global-require, no-undef */
	"use strict";
	grunt.initConfig({
		karma: {
			reporterFilePattern: grunt.option("karma.reporterFilePattern") || "all",
			globalCodeCoverageThreshold: grunt.option("karma.globalCodeCoverageThreshold") || 97.96,
			options: {
				captureTimeout: 210000,
				browserDisconnectTolerance: 3,
				browserDisconnectTimeout: 210000,
				browserNoActivityTimeout: 210000,
				customLaunchers: {
					ChromeHeadless: {
						base: "Chrome",
						flags: [
							"--no-sandbox",
							"--headless",
							"--disable-gpu",
							"--remote-debugging-port=9222"
						]
					}
				},
				frameworks: ["qunit", "openui5"],
				openui5: {
					path: "https://sapui5.hana.ondemand.com/1.65.1/resources/sap-ui-core.js"
				},
				client: {
					openui5: {
						config: {
							theme: "sap_belize",
							language: "EN",
							bindingSyntax: "complex",
							compatVersion: "edge",
							preload: "async",
							resourceroots: {
								"sap.fhir": "./base/src/sap/fhir",
								"sap-fhir-ui5-model.test": "./base/test",
								"sap-fhir-ui5-model-demo": "./base/test/sap-fhir-ui5-model-demo/webapp"
							}
						}
					}
				},
				files: [{ pattern: "**", included: false, served: true, watched: true }],
				proxies: {
					"/resources": "https://sapui5.hana.ondemand.com/1.65.1/test-resources",
					"/test-resources": "https://sapui5.hana.ondemand.com/1.65.1/resources",
					"/localService": "/base/test/localService",
					"/sap-fhir-ui5-model/test/localService": "/base/test/localService"
				},
				singleRun: true,
				browsers: ["ChromeHeadless"],
				preprocessors: {
					"src/**/!(library).js": ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					reporters: [
						{
							type: "html",
							subdir: "../target/coverage/<%= karma.reporterFilePattern %>/html/"
						},
						{
							type: "text"
						},
						{
							type: "cobertura",
							subdir: "../target/coverage/<%= karma.reporterFilePattern %>/xml/",
							file: "cobertura-coverage-<%= karma.reporterFilePattern %>.xml"
						}
					],
					check: {
						global: {
							lines: "<%= karma.globalCodeCoverageThreshold %>"
						}
					}
				},
				junitReporter: {
					outputDir: "target/junit",
					outputFile: "junit-results-<%= karma.reporterFilePattern %>.xml",
					useBrowserName: false
				},
				reporters: [
					"progress",
					"coverage",
					"junit"
				]
			},
			allTests: {
				client: {
					openui5: {
						tests: [
							"sap-fhir-ui5-model/test/createMockServer",
							"sap-fhir-ui5-model/test/qunit/unit",
							"sap-fhir-ui5-model-demo/test/opa5/journeys/all"
						]
					}
				}
			},
			unitTests: {
				client: {
					openui5: {
						tests: ["sap-fhir-ui5-model/test/createMockServer", "sap-fhir-ui5-model/test/qunit/unit"]
					}
				}
			},
			opaTests: {
				client: {
					openui5: {
						tests: ["sap-fhir-ui5-model/test/createMockServer", "sap-fhir-ui5-model-demo/test/opa5/journeys/all"]
					}
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-karma");
	grunt.registerTask("test", "Run unit and opa5 tests with coverage", function () {
		grunt.task.run(["karma:allTests"]);
	});
	grunt.registerTask("test-unit", "Run unit tests with coverage", function () {
		grunt.config.set("karma.reporterFilePattern", "unit");
		grunt.config.set("karma.globalCodeCoverageThreshold", 70);
		grunt.task.run(["karma:unitTests"]);
	});
	grunt.registerTask("test-opa5", "Run opa5 tests with coverage", function () {
		grunt.config.set("karma.reporterFilePattern", "opa5");
		grunt.config.set("karma.globalCodeCoverageThreshold", 80);
		grunt.task.run(["karma:opaTests"]);
	});
};