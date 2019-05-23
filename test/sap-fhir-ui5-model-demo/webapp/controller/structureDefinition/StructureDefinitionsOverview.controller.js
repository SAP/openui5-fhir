sap.ui.define([ "sap/ui/core/mvc/Controller" ], function(Controller) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.structureDefinition.StructureDefinitionsOverview", {

		onInit : function() {
			this.initializeRouter();
		},

		initializeRouter : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack : function() {
			this.oRouter.navTo("home");
		},

		onNavigateToListAndTables: function(){
			this.oRouter.navTo("structureDefinitionsListAndTables",{tab: "cb"});
		},

		onNavigateToTree: function(){
			this.oRouter.navTo("structureDefinitionsTree");
		},

		onNavigateToTreeTable: function(){
			this.oRouter.navTo("structureDefinitionsTreeTable");
		},

		onNavigateToIncludeExample: function(){
			this.oRouter.navTo("includeExample");
		}
	});
});
