sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap-fhir-test-app/utils/Utils"
], function(Controller, Filter, FilterOperator, Utils) {
	"use strict";

	return Controller.extend("sap-fhir-test-app.controller.structureDefinition.StructureDefinitionsTree", {

		onInit : function() {
			this.initializeRouter();
		},

		initializeRouter : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oModel = this.getOwnerComponent().getModel();
			var fnRequestSent = function(oEvent) {
				var oTriggerRequestBinding = oEvent.getParameter("requestHandle").getBinding();
				var oTreeBinding = this.byId("tree").getBinding("items");
				if (oTriggerRequestBinding === oTreeBinding){
					oModel.detachRequestSent(fnRequestSent);
					var fnTreeLoadingStarted = function() {
						Utils.openBusyDialog();
					};
					var fnTreeLoadingCompleted = function() {
						Utils.closeBusyDialog();
					};
					oTreeBinding.attachTreeLoadingStarted(fnTreeLoadingStarted);
					oTreeBinding.attachTreeLoadingCompleted(fnTreeLoadingCompleted);
				}
			}.bind(this);
			oModel.attachRequestSent(fnRequestSent);
		},

		onNavBack : function() {
			this.oRouter.navTo("structureDefinitionsOverview");
		},

		onItemPress : function(oEvent) {
			var oBinding = oEvent.getParameter("listItem").getBinding("title");
			sap.m.MessageToast.show(oBinding.getContext().getPath() + "/" + oBinding.getPath());
		},

		triggerSearchStructDef : function(oEvent) {
			var aFilters;
			var sSearchString = oEvent.getSource().getValue().trim();
			if (sSearchString && sSearchString.length > 0) {
				aFilters = [];
				//aFilters.push(new Filter("type", FilterOperator.EQ, "Appointment"));
				aFilters.push(new Filter("name", FilterOperator.Contains, sSearchString));
			}
			var oResourceList = this.getView().byId("tree");
			var oTreeBinding = oResourceList.getBinding("items");
			oTreeBinding.filter(aFilters);
		}

	});
});