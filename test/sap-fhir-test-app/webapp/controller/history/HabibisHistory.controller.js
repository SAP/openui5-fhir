sap.ui.define([ "sap/ui/core/mvc/Controller" ], function(Controller) {
	"use strict";

	return Controller.extend("sap-fhir-test-app.controller.history.HabibisHistory", {

		onInit : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack : function() {
			this.oRouter.navTo("home");
		}
	});
});