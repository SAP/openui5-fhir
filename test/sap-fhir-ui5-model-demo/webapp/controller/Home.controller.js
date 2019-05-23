sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap-fhir-ui5-model-demo/utils/Utils",
	"sap/base/Log"
], function(Controller, Utils, Log) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.Home", {
		onInit : function() {
			this.initializeRouter();
		},

		initializeRouter : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("home").attachPatternMatched(this.attachModelEventHandlers, this);
		},

		/**
		 * This method shows an use case to register to the events which are provided by the FHIRModel
		 *
		 */
		attachModelEventHandlers : function() {
			if (!this.bInitial) {
				this.bInitial = true;
				var oModel = this.getView().getModel();
				oModel.attachRequestSent(function(oEvent) {
					Log.info("http request send to " + oEvent.getParameter("requestHandle").getUrl() + " with paylod " + oEvent.getParameter("requestHandle").getData());
				});
				oModel.attachRequestFailed(function(oEvent) {
					Log.info("http request failed to " + oEvent.getParameter("requestHandle").getUrl()  + " with paylod " + oEvent.getParameter("requestHandle").getData());
				});
			}
		},

		onNavigateToPatientScreen : function() {
			this.oRouter.navTo("patientTable");
		},

		onNavigateToStructureDefinitionScreen : function() {
			this.oRouter.navTo("structureDefinitionsOverview");
		},

		onNavigateToHabibiCancersHistory : function() {
			this.oRouter.navTo("habibisHistory");
		}

	});
});
