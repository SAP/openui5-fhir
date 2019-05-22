sap.ui.define([ "sap/ui/core/mvc/Controller" ], function(Controller) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.structureDefinition.StructureDefinitionsListAndTables", {

		onInit : function() {
			this.initializeRouter();
			var oScrollContainer = this.byId("structDefEditableScrollContainer");
			if (oScrollContainer) {
				var oContext = oScrollContainer.getBindingContext();
				if (!oContext || oContext.sPath !== "/StructureDefinition/Account") {
					oScrollContainer.bindElement({
						path : "/StructureDefinition/Account",
						parameters : {
							groupId : "stdChange"
						}
					});
				}
			}
		},

		initializeRouter : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("structureDefinitionsListAndTables").attachPatternMatched(this._onStructureDefinitionsScreenMatched, this);
			this.oRouter.getRoute("structureDefinitionsListAndTablesDefault").attachPatternMatched(this._onStructureDefinitionsDefaultScreenMatched, this);
		},

		onNavBack : function() {
			this.oRouter.navTo("structureDefinitionsOverview");
		},

		_onStructureDefinitionsScreenMatched : function(oEvent) {
			var sTabKey = oEvent.getParameter("arguments").tab;
			this.scrollToTab(sTabKey);
		},

		_onStructureDefinitionsDefaultScreenMatched : function() {
			this.scrollToTab(this.byId("iconTabBar").getItems()[0].getKey());
		},

		scrollToTab : function(sTabKey) {
			this.byId("iconTabBar").setSelectedKey(sTabKey);
		},

		onIconTabBarSelect : function(oEvent) {
			var sTabKey = oEvent.getSource().getSelectedKey();
			this.oRouter.navTo("structureDefinitionsListAndTables", {
				tab : sTabKey
			});
		},

		onPressRefresh : function() {
			this.getView().getModel().refresh();
		},

		onStructAddItem : function() {
			this.getView().getModel().create("StructureDefinition", {});
			this.byId("structureDefintionListSmartTable").updateTableHeaderState();
		},

		onStructDefinitionIsPressed: function(oEvent){
			var oItem = oEvent.getParameters().listItem;
			var sBindingContextPath = oItem.getBindingContextPath();
			var oStructureDefinition = this.getView().getModel().getProperty(sBindingContextPath);
			this.oRouter.navTo("structureDefinition", {
				tab : this.byId("iconTabBar").getSelectedKey(),
				structId: oStructureDefinition.id
			});
		}
	});
});
