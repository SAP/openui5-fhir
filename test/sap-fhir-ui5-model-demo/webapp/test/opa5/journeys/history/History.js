sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function(Opa5, opaTest) {
	"use strict";

	var sHash = "history/habibi";
	var sViewName = "sap-fhir-ui5-model-demo.view.history.HabibisHistory";

	QUnit.module("History Example");

	opaTest("all Test", function(Given, When, Then) {
		Given.iStartMyApp(sHash);

		// check habibis history
		Then.theTextShouldAppear("Version: 1 -- Given: Habibi -- Family: Cancer -- Maiden: Plauzi", sViewName);

		// check rüdigers history
		Then.theTextShouldAppear("Version: 1 -- Given: Gesichts -- Family: Rüdiger -- Maiden: Figur", sViewName);
		Then.theTextShouldAppear("Version: 2 -- Given: Gesichts -- Family: Rüdiger -- Maiden: Klamotten", sViewName);
	});
});