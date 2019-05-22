sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter"
], function(Controller, FilterOperator, Filter) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.structureDefinition.IncludeExample", {

		onInit : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onTest : function(oEvent) {
		},

		onNavBack : function() {
			this.oRouter.navTo("structureDefinitionsOverview");
		}
	});
});