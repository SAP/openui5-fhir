sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function(Opa5, opaTest) {
	"use strict";

	var sHashCancerPatient = "patientDetails/a2522/basedata";
	var sHashNotsowell = "patientDetails/a2521/basedata";
	var sViewName = "sap-fhir-ui5-model-demo.view.patient.PatientDetails";
	var sGenderSelect = "genderSelect";
	var sContacts = "tblContacts";
	var sAddContact = "addContact";
	var sSave = "btnPatientDetailsSave";
	//var sTabAdmission = "tabAufnahme";

	QUnit.module("ValueSet Binding in gender");

	opaTest("Check if correct ValueSet for gender is displayed for Cancer Patient", function(Given, When, Then) {
		var fnSuccess = function(oSelect) {
			Opa5.assert.equal("Both", oSelect.getItems()[2].getText(), "The item: " + oSelect.getItems()[2].getText() + " was found");
		};
		Given.iStartMyApp(sHashCancerPatient);
		Then.iWaitUntilAggregationFilled(sViewName,sGenderSelect, fnSuccess);
	});

	var aContact1 = [
		"Notsowell",
		"Rüdiger",
		"Kasperleweg 5",
		"Knutstadt",
		"+490213321",
		"+491247274427",
		"test@sap.com"
	];

	function updatePatient(Given, When, Then, aContact){
		var fnSuccess = function(oSelect) {
			Opa5.assert.equal("Other", oSelect.getItems()[2].getText(), "The item: " + oSelect.getItems()[2].getText() + " was found");
		};
		var fnEnterDataInTableRow = function(oTable) {
			var aInputs = oTable.getItems()[0].getCells();
			for (var i = 0; i < aContact.length; i++){
				aInputs[i].setValue(aContact[i]);
			}
			Opa5.assert.ok(true, "The table row could be filled");
		};
		Given.iStartMyApp(sHashNotsowell);
		Then.iWaitUntilAggregationFilled(sViewName,sGenderSelect, fnSuccess);
		When.iPressButton(sViewName, sAddContact);
		When.iDoActionWithControlById(sViewName,sContacts,fnEnterDataInTableRow);
		When.iPressButton(sViewName, sSave);
		Then.iShouldSeeMessageToast(sViewName,"Patient successfully saved");
		When.iPressButton(sViewName, sAddContact);
		When.iDoActionWithControlById(sViewName,sContacts,fnEnterDataInTableRow);
		When.iPressButton(sViewName, sSave);
		Then.iShouldSeeMessageToast(sViewName,"Patient successfully saved");
	}

	opaTest("Check if correct ValueSet for gender is displayed for Notsowell Patient and if contacts can be updated", function(Given, When, Then) {
		updatePatient(Given, When, Then, aContact1);
	});

	//  missing filter function in the fhir mockserver on own created valuesets --> response returns "missing system in valueset" although the valueset was created with system
	//	QUnit.module("Create / Update Encounter");
	//
	//	opaTest("Switch Tab", function(Given, When, Then) {
	//		Given.iStartMyApp(sHashNotsowell);
	//		When.iPressButton(sViewName, sTabAdmission);
	//		var fnSelect = function(oSelect){
	//			oSelect.setSelectedItem(oSelect.getItems()[0]);
	//		};
	//		var fnSelectFromSelectDialog = function(aSelectDialog){
	//			var oItem = aSelectDialog[0].getItems()[this];
	//			oItem.setSelected(true);
	//			aSelectDialog[0].fireConfirm({"selectedItem" : oItem});
	//		};
	//		var fnGetValue = function(oInput){
	//			Opa5.assert.equal(this , oInput.getValue());
	//		};
	//		var fnCloseDialog = function(aDialog){
	//			aDialog[0].close();
	//		};
	//		Then.iGetControlById(sViewName, "CaseType", fnSelect);
	//		Then.iGetControlById(sViewName, "AdmissionType", fnSelect);
	//		When.iPressButton(sViewName, "input_treatmentCategory");
	//		Then.iGetSelectDialog(sViewName, fnSelectFromSelectDialog.bind(0));
	//		Then.iGetDialog(sViewName,fnCloseDialog);
	//		Then.iGetControlById(sViewName, "input_treatmentCategory", fnGetValue.bind("A"));
	//		When.iPressButton(sViewName, "input_treatmentCategory");
	//		Then.iGetSelectDialog(sViewName, fnSelectFromSelectDialog.bind(3));
	//		Then.iGetDialog(sViewName,fnCloseDialog);
	//		Then.iGetControlById(sViewName, "input_treatmentCategory", fnGetValue.bind("B2"));
	//	});

});