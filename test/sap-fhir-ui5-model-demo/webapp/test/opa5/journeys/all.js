sap.ui.require([
	"sap/ui/test/Opa5",
	"sap-fhir-ui5-model-demo/test/opa5/Arrangements",
	"sap-fhir-ui5-model-demo/test/opa5/Actions",
	"sap-fhir-ui5-model-demo/test/opa5/Assertions",
	"sap-fhir-ui5-model-demo/test/opa5/journeys/structureDefinitionTree/StructureDefinition",
	"sap-fhir-ui5-model-demo/test/opa5/journeys/structureDefinition/StructureDefinition",
	"sap-fhir-ui5-model-demo/test/opa5/journeys/patient/PatientTable",
	"sap-fhir-ui5-model-demo/test/opa5/journeys/patient/PatientDetails",
	"sap-fhir-ui5-model-demo/test/opa5/journeys/other/SlicingIncludesChainingReference",
	"sap-fhir-ui5-model-demo/test/opa5/journeys/history/History"
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