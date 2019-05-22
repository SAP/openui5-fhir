sap.ui.define([ "sap/ui/test/Opa5" ], function(Opa5) {
	"use strict";
	var arrangements = new Opa5({
		iStartMyApp : function(sHash) {
			if (this.hasUIComponentStarted()) {
				this.iTeardownMyUIComponent();
			}
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap-fhir-ui5-model-demo",
					id : "demoComponent",
					height : "100%"
				},
				hash: sHash});
		}
	});
	return arrangements;
});
