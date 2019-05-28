sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap-fhir-test-app/utils/Utils"
], function (Opa5, opaTest, Utils) {
	"use strict";

	var sHash = "patients";
	var sViewName = "sap-fhir-test-app.view.patient.PatientTable";
	var sViewNameDetails = "sap-fhir-test-app.view.patient.PatientDetails";
	var sSearchInputBd = "dpBirthDate";
	var sSearchInputName = "inPatientName";
	var sSearchInputGiven = "inPatientGivenName";
	var sSearchButton = "btn_search";
	var sCreateButton = "btn_create";
	var sDeleteButton = "btn_delete";
	var sMessagePopover = "btn_messagePopover";
	var sSave = "btnPatientDetailsSave";
	var sGenderSelect = "genderSelect";
	var sContacts = "tblContacts";
	var sAddContact = "addContact";
	var sTable = "patientTable";

	QUnit.module("ListBinding with PatientAdmission");

	opaTest("Search list for date, go to edit screen of patient", function (Given, When, Then) {
		Given.iStartMyApp(sHash);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Cancer", sViewName);
		Then.theTableHeaderShouldBe(4, sViewName, sTable);
		When.iEnterDataInInput("Notso", sViewName, sSearchInputName);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Notsowell", sViewName);
		Then.theTableHeaderShouldBe(1, sViewName, sTable);
		When.iEnterDataInInput("", sViewName, sSearchInputName);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Cancer", sViewName);
		Then.theTableHeaderShouldBe(4, sViewName, sTable);
		When.iEnterDataInInput("Jan 23, 2000", sViewName, sSearchInputBd);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Cancer", sViewName);
		Then.theTableHeaderShouldBe(2, sViewName, sTable);
		When.iEnterDataInInput("", sViewName, sSearchInputBd);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Cancer", sViewName);
		Then.theTableHeaderShouldBe(4, sViewName, sTable);
	});

	var fnDoCallback = function (fnCallback, aControls) {
		var aItems = aControls[0].getItems();
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getCells()[0].getMetadata().getElementName() === "sap.m.Input" && aItems[i].getCells()[0].getValue() === this) {
				fnCallback(aItems[i]);
				break;
			} else if (aItems[i].getCells()[0].getMetadata().getElementName() === "sap.m.Label" && aItems[i].getCells()[0].getText() === this) {
				fnCallback(aItems[i]);
				break;
			}
		}
	};

	var fnSelect = function (oItem) {
		oItem.setSelected(true);
	};

	var fnClick = function (oItem) {
		oItem.firePress();
	};


	function createPatient(Given, When, Then, sMode, mPatient, iExpectedSize, sPrefer) {
		Then.iSeePage(sViewName, function (aItems) {
			aItems[0].getModel().mGroupProperties.patientDetails.submit = sMode;
			aItems[0].getModel().mGroupProperties.patientList.submit = sMode;
			if (sPrefer) {
				aItems[0].getModel().oRequestor.sPrefer = sPrefer;
			}
		});
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Wurst", sViewName);
		When.iEnterDataInInput(mPatient.given, sViewName, sSearchInputGiven);
		When.iEnterDataInInput(mPatient.name, sViewName, sSearchInputName);
		When.iPressButton(sViewName, sCreateButton);
		When.iPressButton(sViewNameDetails, sSave);
		Then.iShouldSeeMessageToast(sViewNameDetails, "Patient successfully saved");
		When.iPressNavBackButton(sViewNameDetails, "patientDetailsPage");
		Then.theLabelShouldAppear(mPatient.name, sViewName);
		Then.theTableHeaderShouldBe(iExpectedSize, sViewName, sTable);
	}

	var mPatient1 = { name: "Chen", given: "Ti" };
	var mPatient2 = { name: "Puma", given: "Pupsi" };
	var aContact1 = [
		"Notsowell",
		"Rüdiger",
		"Kasperleweg 5",
		"Knutstadt",
		"+490213321",
		"+491247274427",
		"test@sap.com"
	];
	var aContact2 = [
		"Dietmann",
		"Hans",
		"Kasperleweg 5",
		"Knutstadt",
		"+490213321",
		"+491247274427",
		"test@sap.com"
	];
	var aContact3 = [
		"Schlamm",
		"Horst",
		"Kasperleweg 5",
		"Knutstadt",
		"+490213321",
		"+491247274427",
		"test@sap.com"
	];
	var aContact4 = [
		"Mecker",
		"Heini",
		"Kasperleweg 5",
		"Knutstadt",
		"+490213321",
		"+491247274427",
		"test@sap.com"
	];
	var aContact5 = [
		"Richtig",
		"Panne",
		"Kasperleweg 5",
		"Knutstadt",
		"+490213321",
		"+491247274427",
		"test@sap.com"
	];

	function enterContacts(Given, When, Then, aContacts, iTablesizeContacts, oGrowingInfo) {
		var fnEnterDataInTableRow = function (oTable) {
			var aInputs = oTable.getItems()[0].getCells();
			for (var i = 0; i < this.length; i++) {
				aInputs[i].setValue(this[i]);
			}
			Opa5.assert.ok(true, "The table row could be filled");
		};
		for (var i = 0; i < aContacts.length; i++) {
			When.iPressButton(sViewNameDetails, sAddContact);
			When.iDoActionWithControlById(sViewNameDetails, sContacts, fnEnterDataInTableRow.bind(aContacts[i]));
		}
		Then.theTableSizeShouldBe(iTablesizeContacts, sViewNameDetails, sContacts);
		if (oGrowingInfo) {
			Then.theGrowingInfoShouldBe(sViewNameDetails, sContacts, oGrowingInfo);
		}
	}

	function selectNamesInTable(When, sView, aPatients) {
		for (var i = 0; i < aPatients.length; i++) {
			When.iSelectItemInControl(sView, fnDoCallback.bind(aPatients[i], fnSelect));
		}
	}

	function deletePatient(Given, When, Then, aPatients) {
		selectNamesInTable(When, sViewName, aPatients);
		When.iPressButton(sViewName, sDeleteButton);
		When.iPressOnDialogButtonContainingTheText("OK");
		Then.iShouldSeeMessageToast(sViewName, "Deletion successful");
		Then.theTableHeaderShouldBe(4, sViewName, sTable);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Cancer", sViewName);
		Then.theTableHeaderShouldBe(4, sViewName, sTable);
	}

	function createAndDeletePatient(Given, When, Then, sMode, sPrefer) {
		Given.iStartMyApp(sHash);
		createPatient(Given, When, Then, sMode, mPatient1, 5, sPrefer);
		createPatient(Given, When, Then, sMode, mPatient2, 6, sPrefer);
		deletePatient(Given, When, Then, [mPatient1.name, mPatient2.name]);
	}

	function submitDeletionOfContacts(Given, When, Then, iTableSize) {
		When.iPressButton(sViewNameDetails, sSave);
		Then.iShouldSeeMessageToast(sViewNameDetails, "Patient successfully saved");
		Then.theTableSizeShouldBe(iTableSize, sViewNameDetails, sContacts);
		Then.theInputShouldAppear("Mecker", sViewNameDetails);
		Then.theInputShouldAppear("Heini", sViewNameDetails);
		When.iPressNavBackButton(sViewNameDetails, "patientDetailsPage");
	}

	function deleteContactFromPatient(Given, When, Then, sFamilyname, sContactFamily, iTableSize, oGrowingInfo, bSubmitChanges) {
		selectNamesInTable(When, sViewNameDetails, [sContactFamily]);
		When.iPressButton(sViewNameDetails, sDeleteButton);
		When.iPressOnDialogButtonContainingTheText("OK");
		Then.theTableSizeShouldBe(iTableSize, sViewNameDetails, sContacts);
		Then.theInputShouldAppear("Mecker", sViewNameDetails);
		Then.theInputShouldAppear("Heini", sViewNameDetails);
		if (oGrowingInfo) {
			Then.theGrowingInfoShouldBe(sViewNameDetails, sContacts, oGrowingInfo);
		}
		if (bSubmitChanges) {
			submitDeletionOfContacts(Given, When, Then, iTableSize);
		}
	}

	QUnit.module("Create, update, delete");
	opaTest("Patient", function (Given, When, Then) {
		Given.iStartMyApp(sHash);
		createPatient(Given, When, Then, "Batch", mPatient1, 5);
		When.iSelectItemInControl(sViewName, fnDoCallback.bind(mPatient1.name, fnClick));
		enterContacts(Given, When, Then, [aContact1], 1);
		enterContacts(Given, When, Then, [aContact2], 2);
		enterContacts(Given, When, Then, [aContact3], 3, { total: 3, actual: 2 });
		enterContacts(Given, When, Then, [aContact4], 4, { total: 4, actual: 2 });
		enterContacts(Given, When, Then, [aContact5], 5, { total: 5, actual: 2 });
		When.iPressButton(sViewNameDetails, sSave);
		Then.iShouldSeeMessageToast(sViewNameDetails, "Patient successfully saved");
		deleteContactFromPatient(Given, When, Then, mPatient1.name, "Richtig", 4, { total: 4, actual: 2 });
		deleteContactFromPatient(Given, When, Then, mPatient1.name, "Schlamm", 3, { total: 3, actual: 2 });
		deleteContactFromPatient(Given, When, Then, mPatient1.name, "Dietmann", 2);
		enterContacts(Given, When, Then, [aContact5], 3, { total: 3, actual: 2 });
		deleteContactFromPatient(Given, When, Then, mPatient1.name, "Richtig", 2);
		deleteContactFromPatient(Given, When, Then, mPatient1.name, "Notsowell", 1, { total: 1, actual: 1 }, true);
		createPatient(Given, When, Then, "Batch", mPatient2, 6);
		When.iSelectItemInControl(sViewName, fnDoCallback.bind(mPatient2.name, fnClick));
		enterContacts(Given, When, Then, [
			aContact1,
			aContact2,
			aContact3
		], 3, { total: 3, actual: 2 });
		When.iPressButton(sViewNameDetails, sSave);
		Then.iShouldSeeMessageToast(sViewNameDetails, "Patient successfully saved");
		When.iPressNavBackButton(sViewNameDetails, "patientDetailsPage");
		deletePatient(Given, When, Then, [mPatient1.name, mPatient2.name]);
	});

	QUnit.module("Create, delete patient direct");
	opaTest("return=representive", function (Given, When, Then) {
		createAndDeletePatient(Given, When, Then, "Direct");
	});

	opaTest("return=minimal", function (Given, When, Then) {
		createAndDeletePatient(Given, When, Then, "Direct", "return=minimal");
	});

	QUnit.module("Create, delete patient batch");
	opaTest("return=representive", function (Given, When, Then) {
		createAndDeletePatient(Given, When, Then, "Batch");
	});

	opaTest("return=minimal", function (Given, When, Then) {
		createAndDeletePatient(Given, When, Then, "Batch", "return=minimal");
	});

	QUnit.module("Missing Profile and already loaded profile");
	opaTest("Navigate to patients", function (Given, When, Then) {
		Given.iStartMyApp(sHash);
		When.iPressButton(sViewName, sSearchButton);
		Then.theLabelShouldAppear("Cancer", sViewName);
		// The next two patients have same profile
		When.iSelectItemInControl(sViewName, fnDoCallback.bind("Cancer", fnClick));
		When.iPressNavBackButton(sViewNameDetails, "patientDetailsPage");
		When.iSelectItemInControl(sViewName, fnDoCallback.bind("Wurst", fnClick));
		When.iPressNavBackButton(sViewNameDetails, "patientDetailsPage");
		// The next patient has profile which is not on the server
		When.iSelectItemInControl(sViewName, fnDoCallback.bind("Rüdiger", fnClick));
		When.iPressButton(sViewNameDetails, sMessagePopover);
		Then.theMessageShouldAppear("The structuredefinition http://example.org/fhir/StructureDefinition/SAPPatientExtended could not be loaded from the server for binding with path gender");
		// The next patient has no profile and standard is taken
		When.iPressNavBackButton(sViewNameDetails, "patientDetailsPage");
		When.iSelectItemInControl(sViewName, fnDoCallback.bind("Notsowell", fnClick));
		var fnSuccess = function (oSelect) {
			Opa5.assert.equal("Male", oSelect.getItems()[0].getText(), "The item: " + oSelect.getItems()[0].getText() + " was found");
		};
		Then.iGetControlById(sViewNameDetails, sGenderSelect, fnSuccess);
	});

});