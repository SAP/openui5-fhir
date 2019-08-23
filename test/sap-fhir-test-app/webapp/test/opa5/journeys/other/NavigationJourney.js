sap.ui.require(["sap/ui/test/opaQunit"], function(opaTest) {
    "use strict";
    
    var sHash = "";
    var sPatientTableHash = "patients";
    var sView = "sap-fhir-test-app.view.Home";
    var sPatientTableViewName = "sap-fhir-test-app.view.patient.PatientTable";

	QUnit.module("Navigation Example");

	opaTest("Check total binding on start screen", function(Given, When, Then) {
		Given.iStartMyApp(sHash);
		Then.theGenericTileBindingShouldDeliver(sView, "allPatients", {value : "4"});
    });
    
    opaTest("Check total binding after navigation", function(Given, When, Then) {
        Given.iStartMyApp(sPatientTableHash);
        When.iPressNavBackButton(sPatientTableViewName, "patientPage");
		Then.theGenericTileBindingShouldDeliver(sView, "allPatients", {value : "4"});
    });
});