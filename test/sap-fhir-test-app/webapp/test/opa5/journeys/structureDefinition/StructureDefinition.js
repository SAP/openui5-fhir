sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function(Opa5, opaTest) {
	"use strict";

	var sHash = "structuredefinitions/list/cb";
	var sHashFourtyGrowing = "structuredefinitions/list/lb2";
	var sViewName = "sap-fhir-test-app.view.structureDefinition.StructureDefinitionsListAndTables";
	var sTable = "structureDefintionListTable";
	var sFourtyList = "structureDefintionsList2";
	var sScrollContainerForFourtyList = "scrollContainerList2";
	var sRefresh = "btnRefresh";

	var iTotal = 243;

	QUnit.module("List with Paging");

	opaTest("Checks Table sizes / entries and press more button multiple times", function(Given, When, Then) {
		Given.iStartMyApp(sHash);
		Then.theTextShouldAppear("Resource", sViewName);
		Then.iCheckContextSizeByItemAggregation(sViewName, sTable, 5);
		Then.iCheckSizeOfItemAggregation(sViewName, sTable, iTotal);
		When.iPressButton(sViewName, sTable);
		Then.theTextShouldAppear("Binary", sViewName);
		Then.iCheckSizeOfItemAggregation(sViewName, sTable, iTotal);
		Then.iCheckContextSizeByItemAggregation(sViewName, sTable, 10);
		When.iPressButton(sViewName, sRefresh);
		Then.theTextShouldAppear("Resource", sViewName);
		Then.iCheckSizeOfItemAggregation(sViewName, sTable, iTotal);
		Then.iCheckContextSizeByItemAggregation(sViewName, sTable, 5);
	});

	QUnit.module("List with groupId and paging");

	opaTest("Checks Table sizes / entries and scroll", function(Given, When, Then) {
		Given.iStartMyApp(sHashFourtyGrowing);
		Then.theStandardListItemShouldAppear("Resource", sViewName);
		Then.iCheckSizeOfItemAggregation(sViewName, sFourtyList, iTotal);
		Then.iCheckTitlePropertyInItemsAggregation(sViewName, sFourtyList, "DomainResource");
		When.iScrollInScrollContainer(sViewName, sScrollContainerForFourtyList, 100);
		Then.iCheckTitlePropertyInItemsAggregation(sViewName, sFourtyList, "MedicinalProduct");
		When.iScrollInScrollContainer(sViewName, sScrollContainerForFourtyList, 100);
		Then.iCheckTitlePropertyInItemsAggregation(sViewName, sFourtyList, "Sequence");
		When.iScrollInScrollContainer(sViewName, sScrollContainerForFourtyList, 100);
		Then.iCheckTitlePropertyInItemsAggregation(sViewName, sFourtyList, "Vital Signs Profile");
		When.iScrollInScrollContainer(sViewName, sScrollContainerForFourtyList, 100);
		Then.iCheckTitlePropertyInItemsAggregation(sViewName, sFourtyList, "Annotation");
		When.iScrollInScrollContainer(sViewName, sScrollContainerForFourtyList, 100);
		Then.iCheckTitlePropertyInItemsAggregation(sViewName, sFourtyList, "MyAppointment");
		When.iScrollInScrollContainer(sViewName, sScrollContainerForFourtyList, 100);
		Then.theStandardListItemShouldAppear("SAPPatient", sViewName);
	});
});