sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap-fhir-ui5-model-demo/utils/Utils",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterType",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Utils, FHIRFilterOperator, FHIRFilter, FHIRFilterType, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("sap-fhir-ui5-model-demo.controller.patient.PatientTable", {

		utils : Utils,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is displayed, to bind event handlers and do other
		 * one-time initialization.
		 *
		 * @memberOf sap-fhir-ui5-model-demo.view.PatientTable
		 */
		onAfterRendering : function() {
			var oView = this.getView();
			this.oModel = oView.getModel();
			this.oTable = this.byId("patientTable");
			this.oSmartTable.setModel(this.oModel);
			var fnKeyPressed = function(e) {
				if (e.which === 13) {
					this.onPatientSearchPress();
				}
			}.bind(this);
			this.byId("inPatientName").attachBrowserEvent("keypress", fnKeyPressed);
			this.byId("inPatientGivenName").attachBrowserEvent("keypress", fnKeyPressed);
			this.byId("dpBirthDate").attachBrowserEvent("keypress", fnKeyPressed);
			Utils.onAfterRenderingControllRedirectFocus(Utils.getControllByIdEndstring("btnShowHide"), this.byId("inPatientName"));
		},


		onInit : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("patientTable").attachPatternMatched(this._onPatientTable, this);
			this.oSmartTable = this.byId("idSmartTable");
		},

		onNavBack : function() {
			this.oRouter.navTo("home");
		},

		_onPatientTable : function() {
			this.oSmartTable.updateTableHeaderState();
			this.onReset();
		},

		onListItemPress : function(oEvent) {
			var oSelectedItem = oEvent.getSource();
			var sResourceId = oSelectedItem.getBindingContext().getPath().split("/")[2];
			this.navToPatientDetails(sResourceId);
		},

		checkDate : function(oEvent) {
			Utils.dateCheck(oEvent);
		},

		onCreatePatientPress : function() {
			var sGivenName = this.byId("inPatientGivenName").getValue();
			var sName = this.byId("inPatientName").getValue();
			var oBirthDate = this.byId("dpBirthDate");
			var oPatient = {
				name : [
					{
						given : []
					}
				]
			};

			if (sGivenName) {
				oPatient.name[0].given.push(sGivenName);
			}

			if (sName) {
				oPatient.name[0].family = sName;
			}

			if (Utils.isValueStorable(oBirthDate)) {
				oPatient.birthDate = oBirthDate.getValue();
			}

			if (Utils.areErrorMessagesCleared()) {
				var sPatientId = this.oModel.create("Patient", oPatient, "patientDetails");
				this.navToPatientDetails(sPatientId, true);
			}
		},

		navToPatientDetails : function(sResourceId, bCreate) {
			var oRouterInfo = {
				tab : "basedata",
				patientId : sResourceId
			};
			if (bCreate){
				this.oRouter.navTo("patientCreate", oRouterInfo);
			} else {
				this.oRouter.navTo("patientDetails", oRouterInfo);
			}
		},

		formatPatientFirstName : function(aGivenName) {
			var sName = "";

			if (aGivenName) {
				aGivenName.forEach(function(sGivenName) {
					sName += " " + sGivenName;
				});
			} else {
				sName = "";
			}

			return sName;
		},

		onBeforeRebindTable : function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			var sLastName = this.byId("inPatientName").getValue();
			var sFirstName = this.byId("inPatientGivenName").getValue();
			var sBirthDay = this.byId("dpBirthDate").getValue();

			if (sFirstName) {
				mBindingParams.filters.push(new sap.ui.model.Filter("given", FHIRFilterOperator.Contains, sFirstName));
			}

			if (sLastName) {
				mBindingParams.filters.push(new sap.ui.model.Filter("family", FHIRFilterOperator.Contains, sLastName));
			}

			if (sBirthDay) {
				mBindingParams.filters.push(new FHIRFilter({
					path: "birthdate",
					operator : FHIRFilterOperator.EQ,
					valueType : FHIRFilterType.date,
					value1 : sBirthDay
				}));
			}
		},

		onPatientSearchPress : function() {
			if (Utils.areErrorMessagesCleared()) {
				this.oSmartTable.rebindTable(true);
				this.oSmartTable.setVisible(true);
			}
		},

		onReset : function() {
			this.byId("inPatientName").setValue("");
			this.byId("inPatientGivenName").setValue("");
			this.byId("dpBirthDate").setValue("");
		},

		onDeleteClicked : function() {
			var oItems = this.oTable.getSelectedItems();
			this.openDeleteTrialDialog(oItems);
		},

		openDeleteTrialDialog : function(oItems) {
			MessageBox.warning("Are you sure to delete the selected Items?", {
				actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose : this.deleteTrialDialogCallback(oItems).bind(this)
			});
		},

		deleteTrialDialogCallback : function(oItems) {
			return function(sAction) {
				if (sAction === sap.m.MessageBox.Action.OK) {
					this.deleteSelectedItems(oItems);
				}
			};
		},

		deleteSelectedItems : function(oItems) {
			this.oModel.remove(oItems, function(oItem){
				return oItem.getBindingContextPath();
			});
			this.oModel.submitChanges(undefined,
				function(oResponse) {
					this.oSmartTable.updateTableHeaderState();
					MessageToast.show("Deletion successful");
				}.bind(this),
				function(oError) {
					MessageBox.error(oError.getDescription());
				}
			);
		}
	});

});
