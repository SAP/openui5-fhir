sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function(Opa5, opaTest) {
	"use strict";

	var sHash = "structuredefinitions/tree";
	var sHashTable = "structuredefinitions/treeTable";
	var sViewName = "sap-fhir-test-app.view.structureDefinition.StructureDefinitionsTree";
	var sViewTable = "sap-fhir-test-app.view.structureDefinition.StructureDefinitionsTreeTable";
	var sSearchInput = "search";
	var sTreeTable = "treeTable";
	var sExpandToLvlBtn = "btn_expandTreeToLvl";
	var sLvlOfExpansion = "lvlOfExpansion";
	var expandSelected = "expandSelected";
	var collapseSelected = "collapseSelected";

	var iTotal = 135;

	QUnit.module("Tree-Filtering with StructureDefinitions");

	opaTest("Search tree for end, collapse all / expand again and check length in between", function(Given, When, Then) {
		Given.iStartMyApp(sHash);
		When.iEnterDataInInput("end", sViewName, sSearchInput);
		Then.theItemShouldAppear("MyEndpointExtended", sViewName);
		Then.theTreeSizeShouldBe(12);
		When.iPressOnTheTreeItemExpander("TestAppointment", sViewName);
		Then.theTreeSizeShouldBe(11);
		When.iPressOnTheTreeItemExpander("MyEndpoint", sViewName);
		Then.theTreeSizeShouldBe(10);
		When.iPressOnTheTreeItemExpander("MyAccount", sViewName);
		Then.theTreeSizeShouldBe(9);
		When.iPressOnTheTreeItemExpander("Appointment", sViewName);
		Then.theTreeSizeShouldBe(8);
		When.iPressOnTheTreeItemExpander("Endpoint", sViewName);
		Then.theTreeSizeShouldBe(6);
		When.iPressOnTheTreeItemExpander("Account", sViewName);
		Then.theTreeSizeShouldBe(5);
		When.iPressOnTheTreeItemExpander("Endpoint", sViewName);
		Then.theTreeSizeShouldBe(7);
		When.iPressOnTheTreeItemExpander("MyEndpoint", sViewName);
		Then.theTreeSizeShouldBe(8);
		When.iPressOnTheTreeItemExpander("Endpoint", sViewName);
		Then.theTreeSizeShouldBe(5);
		When.iEnterDataInInput("appoint", sViewName, sSearchInput);
		Then.theItemShouldAppear("TestAppointmentExtended", sViewName);
		Then.theTreeSizeShouldBe(5);
	});

	opaTest("expand collapse unfiltered tree", function(Given, When, Then) {
		Given.iStartMyApp(sHash);
		Then.theItemShouldAppear("Account", sViewName);
		Then.theTreeSizeShouldBe(iTotal);
		When.iPressOnTheTreeItemExpander("Account", sViewName);
		Then.theItemShouldAppear("MyAccount", sViewName);
		Then.theTreeSizeShouldBe(iTotal + 1);
		When.iPressOnTheTreeItemExpander("MyAccount", sViewName);
		Then.theItemShouldAppear("MyAccountExtended", sViewName);
		Then.theTreeSizeShouldBe(iTotal + 2);
		When.iPressOnTheTreeItemExpander("Account", sViewName);
		Then.theTreeSizeShouldBe(iTotal);
		When.iPressOnTheTreeItemExpander("AuditEvent", sViewName);
		Then.theItemShouldAppear("EHRS FM Record Lifecycle Event - Audit Event", sViewName);
		Then.theTreeSizeShouldBe(iTotal + 1);
		When.iPressOnTheTreeItemExpander("Account", sViewName);
		Then.theItemShouldAppear("MyAccount", sViewName);
		Then.theTreeSizeShouldBe(iTotal + 2);
	});


	QUnit.module("Treetable");
	opaTest("check expanding by click", function(Given, When, Then) {
		Given.iStartMyApp(sHashTable);
		Then.theTextShouldAppear("Account", sViewTable);
		When.iScrollInTableToBottom(sViewTable, sTreeTable);
		Then.theTextShouldAppear("Sequence", sViewTable);
		When.iScrollInTableToBottom(sViewTable, sTreeTable);
		Then.theTextShouldAppear("ValueSet", sViewTable);
		When.iScrollInTableToTop(sViewTable, sTreeTable);
		Then.theTreeTableSizeShouldBe(162, sViewTable);
		When.iPressOnTheRowItemExpander("Account", sViewTable);
		Then.theTextShouldAppear("MyAccount", sViewTable);
		When.iPressOnTheRowItemExpander("MyAccount", sViewTable);
		Then.theTextShouldAppear("MyAccountExtended", sViewTable);
		Then.theTreeTableSizeShouldBe(163,sViewTable);
		When.iPressOnTheRowItemExpander("Account", sViewTable);
		When.iScrollInTableToBottom(sViewTable, sTreeTable);
		Then.theTextShouldAppear("ValueSet", sViewTable);
		When.iPressOnTheRowItemExpander("ValueSet", sViewTable);
		Then.theTextShouldAppear("Shareable ValueSet", sViewTable);
		Then.theTextShouldAppear("ValueSet", sViewTable);
	});

	/* eslint-disable*/
	QUnit.module("Treetable expand by value 2 and multiple select actions");
	opaSkip("full test", function(Given, When, Then) {
		Given.iStartMyApp(sHashTable);
		When.iEnterDataInInput("2", sViewTable,sLvlOfExpansion);
		When.iPressButton(sViewTable, sExpandToLvlBtn);
		Then.theTextShouldAppear("TestAppointmentExtended", sViewTable);
		When.iScrollInTableToBottom(sViewTable, sTreeTable);
		Then.theTextShouldAppear("ProcessResponse", sViewTable);
		When.iScrollInTableToBottom(sViewTable, sTreeTable);
		Then.theTextShouldAppear("ValueSet", sViewTable);
		Then.theTreeTableSizeShouldBe(176,sViewTable);
		Then.iCheckIfIndexIsSelectable(sViewTable, sTreeTable, 0, true);
		When.iSelectTheRowInTreeTable(sViewTable,sTreeTable, 0);
		When.iSelectTheRowInTreeTable(sViewTable, sTreeTable, 6);
		When.iPressButton(sViewTable, collapseSelected);
		Then.theTreeTableSizeShouldBe(171,sViewTable);
		When.iPressButton(sViewTable, expandSelected);
		Then.theTreeTableSizeShouldBe(174,sViewTable);
		When.iSelectAllInTreeTable(sViewTable, sTreeTable);
		When.iPressButton(sViewTable, collapseSelected);
		Then.theTreeTableSizeShouldBe(135,sViewTable);
		When.iPressButton(sViewTable, expandSelected);
		Then.theTreeTableSizeShouldBe(162,sViewTable);
		When.iDeselectRangeInTreeTable(sViewTable, sTreeTable,0, 140);
		When.iPressButton(sViewTable, collapseSelected);
		When.iSelectAllInTreeTable(sViewTable, sTreeTable);
		When.iClearSelectionInTreeTable(sViewTable, sTreeTable);
		Then.iCompareSelectionInfo(sViewTable, sTreeTable, []);
		When.iSelectRangeInTreeTable(sViewTable, sTreeTable, 0, 3);
		Then.iCompareSelectionInfo(sViewTable, sTreeTable, [
			0,
			1,
			2,
			3
		]);
		When.iDeselectRangeInTreeTable(sViewTable, sTreeTable,0, 3);
		Then.iCompareSelectionInfo(sViewTable, sTreeTable, []);
		When.iSelectSingleIndexInTreeTable(sViewTable, sTreeTable,0);
		Then.iCompareSelectionInfo(sViewTable, sTreeTable, [0]);
		Then.theTreeTableSizeShouldBe(161,sViewTable);
	});

	QUnit.module("Treetable reset table expand");
	opaTest("check whole expand by value 0", function(Given, When, Then) {
		When.iEnterDataInInput("0", sViewTable,sLvlOfExpansion);
		When.iPressButton(sViewTable, sExpandToLvlBtn);
		Then.theTreeTableSizeShouldBe(135,sViewTable);
	});

});