module.exports = function (config) {
	"use strict";
	config.set({
		captureTimeout: 210000,
		browserDisconnectTolerance: 3,
		browserDisconnectTimeout: 210000,
		browserNoActivityTimeout: 210000,

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ["ui5"],


		ui5: {
			url: "https://openui5.hana.ondemand.com/1.68.1/",
			testpage: "test/testsuite.qunit.html"
		},

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"src/**/!(library).js": ["coverage"]
		},

		coverageReporter: {
			includeAllSources: true,
			reporters: [
				{
					type: "html",
					dir: "test-results",
					subdir: "coverage/all/html"
				},
				{
					type: "cobertura",
					dir: "test-results",
					subdir: "coverage/all/xml",
					file: "cobertura-coverage.xml"
				},
				{
					type: "text"
				},
				{
					type: "lcovonly",
					dir: "test-results",
					subdir: "coverage/all/lcov",
					file: "lcov-all.info"
				}
			],
			check: {
				global: {
					lines: 97.96
				}
			}
		},

		proxies: {
			"/test-resources/localService": "/base/test/localService"
		},

		junitReporter: {
			outputDir: "test-results/junit",
			outputFile: "junit-results-all.xml",
			useBrowserName: false
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: [
			"progress",
			"coverage",
			"junit"
		],

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// level of browser logging
		browserConsoleLogOptions: {
			level: "warn"
		},

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ["ChromeHeadlessNoSandbox"],
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: "ChromeHeadless",
				flags: ["--no-sandbox"]
			}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	});
};