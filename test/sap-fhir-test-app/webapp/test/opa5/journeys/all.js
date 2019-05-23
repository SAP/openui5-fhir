sap.ui.require([
	"sap/ui/test/Opa5",
	"sap-fhir-test-app/test/opa5/Arrangements",
	"sap-fhir-test-app/test/opa5/Actions",
	"sap-fhir-test-app/test/opa5/Assertions",
	"sap-fhir-test-app/test/opa5/journeys/structureDefinitionTree/StructureDefinition",
	"sap-fhir-test-app/test/opa5/journeys/structureDefinition/StructureDefinition",
	"sap-fhir-test-app/test/opa5/journeys/patient/PatientTable",
	"sap-fhir-test-app/test/opa5/journeys/patient/PatientDetails",
	"sap-fhir-test-app/test/opa5/journeys/other/SlicingIncludesChainingReference",
	"sap-fhir-test-app/test/opa5/journeys/history/History"
], function(Opa5, Arrangements, Actions, Assertions) {
	"use strict";

	Opa5.extendConfig({
		arrangements : Arrangements,
		actions : Actions,
		assertions : Assertions,
		autoWait : true,
		timeout : 30
	});

});