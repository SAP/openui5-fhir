sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap-fhir-test-app/utils/Utils",
	"sap/base/Log"
], function (Controller, Utils, Log) {
	"use strict";

	return Controller.extend("sap-fhir-test-app.controller.Home", {
		onInit: function () {
			this.initializeRouter();
		},

		initializeRouter: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("home").attachPatternMatched(this.attachModelEventHandlers, this);
			this.oRouter.getRoute("home").attachPatternMatched(this._refreshBinding, this);
		},

		/**
		 * This method shows an use case to register to the events which are provided by the FHIRModel
		 *
		 */
		attachModelEventHandlers: function () {
			if (!this.bInitial) {
				this.bInitial = true;
				var oModel = this.getView().getModel();
				oModel.attachRequestSent(function (oEvent) {
					Log.info("http request send to " + oEvent.getParameter("requestHandle").getUrl() + " with paylod " + oEvent.getParameter("requestHandle").getData());
				});
				oModel.attachRequestFailed(function (oEvent) {
					Log.info("http request failed to " + oEvent.getParameter("requestHandle").getUrl() + " with paylod " + oEvent.getParameter("requestHandle").getData());
				});
			}
		},

		_refreshBinding: function () {
			var oPatientsTile = this.byId("patientTile");
			if (oPatientsTile) {
				var oElementBinding = oPatientsTile.getElementBinding();
				if (oElementBinding) {
					oElementBinding.refresh();
				}
			}
		},

		onNavigateToPatientScreen: function () {
			this.oRouter.navTo("patientTable");
		},

		onNavigateToStructureDefinitionScreen: function () {
			this.oRouter.navTo("structureDefinitionsOverview");
		},

		onNavigateToHabibiCancersHistory: function () {
			this.oRouter.navTo("habibisHistory");
		}

	});
});
