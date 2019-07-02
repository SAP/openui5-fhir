window.suite = function() {
	"use strict";

	// eslint-disable-next-line
	var oSuite = new parent.jsUnitTestSuite(),
		sContextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

	oSuite.addTestPage(sContextPath + "qunit/unit.qunit.html");
	oSuite.addTestPage(sContextPath + "sap-fhir-test-app/webapp/test/opa5/all.opa5.html");

	return oSuite;
};