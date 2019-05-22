sap.ui.define(["sap/ui/core/mvc/Controller","sap-fhir-ui5-model-demo/utils/Utils"], function(Controller, Utils) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.structureDefinition.StructureDefinitionsTreeTable", {

		onInit : function() {
			this.initializeRouter();
			this.oTreeTable = this.byId("treeTable");
		},

		initializeRouter : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oModel = this.getOwnerComponent().getModel();
			var fnRequestSent = function(oEvent) {
				var oTriggerRequestBinding = oEvent.getParameter("requestHandle").getBinding();
				var oTreeBinding = this.byId("treeTable").getBinding("items");
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

		onClickExpandToLvl : function(){
			this.oTreeTable.getBinding("rows").refresh("change");
			this.oTreeTable.getBinding("rows").setNumberOfExpandedLevels(this.byId("lvlOfExpansion").getValue());
		},

		onClickExpandSelectedRows : function(){
			this.oTreeTable.expand(this.oTreeTable.getSelectedIndices());
		},

		onClickCollapseSelectedRows : function(){
			this.oTreeTable.collapse(this.oTreeTable.getSelectedIndices());
		}
	});
});