sap.ui.define([ "sap/ui/core/mvc/Controller" ], function(Controller) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.App", {
		onInit : function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});