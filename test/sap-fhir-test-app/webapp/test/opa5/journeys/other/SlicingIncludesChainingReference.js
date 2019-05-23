sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function(Opa5, opaTest) {
	"use strict";

	var sHashReference = "structuredefinitions/list/slicing";
	var sHashInclude = "structuredefinitions/includeExample";
	var sHash = "";
	var sView = "sap-fhir-test-app.view.Home";
	var sViewName = "sap-fhir-test-app.view.structureDefinition.StructureDefinitionsListAndTables";
	var sViewInclude = "sap-fhir-test-app.view.structureDefinition.IncludeExample";
	var sPractitionerRoleList = "practitionerRoleList";

	QUnit.module("Reference Example");

	opaTest("PractitionerRole list with Practitioner", function(Given, When, Then) {
		Given.iStartMyApp(sHashReference);
		Then.theTextShouldAppear("a2533", sViewName);
		Then.theTableSizeShouldBe(1, sViewName, sPractitionerRoleList);
	});

	QUnit.module("Rev-/Include HasChaining Example");

	opaTest("all test", function(Given, When, Then) {
		Given.iStartMyApp(sHashInclude);
		Then.theTextShouldAppear("Panne", sViewInclude);
		Then.theTextShouldAppear("Pudding", sViewInclude);
		Then.theTextShouldAppear("a2532", sViewInclude);
	});

	QUnit.module("Total binding in generic tile");

	opaTest("all test", function(Given, When, Then) {
		Given.iStartMyApp(sHash);
		Then.theGenericTileBindingShouldDeliver(sView, "allPatients", {value : "4"});
	});
});