sap.ui.define([ "sap/ui/core/UIComponent" ], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap-fhir-ui5-model-demo.Component", {

		metadata : {
			manifest : "json"
		},

		init : function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "messageModel");
		},

		getContentDensityClass : function() {
			return sap.ui.Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
		}
	});
});
