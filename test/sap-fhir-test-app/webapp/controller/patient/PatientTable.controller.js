sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap-fhir-test-app/utils/Utils",
	"sap-fhir-test-app/utils/Formatter",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterType",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Utils, Formatter, FHIRFilterOperator, FHIRFilter, FHIRFilterType, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("sap-fhir-test-app.controller.patient.PatientTable", {

		utils : Utils,

		formatter: Formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created. Can be used to modify the View before it is displayed, to bind event handlers and do other
		 * one-time initialization.
		 *
		 * @memberOf sap-fhir-test-app.view.PatientTable
		 */
		onAfterRendering : function() {
			var oView = this.getView();
			this.oModel = oView.getModel();
			this.oTable = this.byId("patientTable");
			var fnKeyPressed = function(e) {
				if (e.which === 13) {
					this.onPatientSearchPress();
				}
			}.bind(this);
			this.byId("inPatientName").attachBrowserEvent("keypress", fnKeyPressed);
			this.byId("inPatientGivenName").attachBrowserEvent("keypress", fnKeyPressed);
			this.byId("dpBirthDate").attachBrowserEvent("keypress", fnKeyPressed);
			Utils.onAfterRenderingControllRedirectFocus(Utils.getControllByIdEndstring("btnShowHide"), this.byId("inPatientName"));
			this.byId("patientTable").getBinding("items").attachChange(function(oEvent){
				this._updateTableHeader(oEvent.getSource().getLength());
			}.bind(this));
		},


		onInit : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("patientTable").attachPatternMatched(this._onPatientTable, this);
		},

		onNavBack : function() {
			this.oRouter.navTo("home");
		},

		_onPatientTable : function() {
			this.onReset();
		},

		_updateTableHeader: function(iNumberOfPatients){
			var oHBox = this.byId("patientTableHeaderTitleContainer");
			oHBox.getItems()[0].getItems()[0].setText(Utils.getI18nText(this.getView(), "tableHeader", iNumberOfPatients));
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

		onPatientSearchPress : function() {
			var sPatientFamilyName = this.byId("inPatientName").getValue();
			var sPatientGivenName = this.byId("inPatientGivenName").getValue();
			var sBirthDate = this.byId("dpBirthDate").getValue();

			var aFilter = [];

			if (sPatientFamilyName && sPatientFamilyName !== "") {
				aFilter.push(new sap.ui.model.Filter("family", FHIRFilterOperator.Contains, sPatientFamilyName));
			}

			if (sPatientGivenName && sPatientGivenName !== "") {
				aFilter.push(new sap.ui.model.Filter("given", FHIRFilterOperator.Contains, sPatientGivenName));
			}

			if (sBirthDate && sBirthDate !== "") {
				aFilter.push(new FHIRFilter({
					path: "birthdate",
					operator : FHIRFilterOperator.EQ,
					valueType : FHIRFilterType.date,
					value1 : sBirthDate
				}));
			}
			this.byId("patientTable").getBinding("items").filter(aFilter);
		},

		onReset : function() {
			this.byId("inPatientName").setValue("");
			this.byId("inPatientGivenName").setValue("");
			this.byId("dpBirthDate").setValue("");
		},

		onDeleteClicked : function() {
			var oItems = this.oTable.getSelectedItems();
			this.openDeletePatientDialog(oItems);
		},

		openDeletePatientDialog : function(oItems) {
			MessageBox.warning("Are you sure to delete the selected Items?", {
				actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose : this.deletePatientDialogCallback(oItems).bind(this)
			});
		},

		deletePatientDialogCallback : function(oItems) {
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
					MessageToast.show("Deletion successful");
				},
				function(oError) {
					MessageBox.error(oError.getDescription());
				}
			);
		},

		onSettingsPress: function(){
			var oPersonalizationDialog = sap.ui.xmlfragment(this.getView().getId(), "sap-fhir-test-app.view.patient.fragments.PersonalizationDialog", this);
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
			oPersonalizationDialog.open();
		}
	});

});
