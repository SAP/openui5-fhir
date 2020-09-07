sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../utils/Utils",
	"sap/m/MessageBox",
	"../../utils/Formatter",
	"sap/base/Log"
], function(Controller, Utils, MessageBox, Formatter, Log) {
	"use strict";

	return Controller.extend("sap-fhir-test-app.controller.structureDefinition.StructureDefinition", {

		formatter : Formatter,

		onInit : function() {
			this.initializeRouter();
		},

		initializeRouter : function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("structureDefinition").attachPatternMatched(this._onStructureDefinitionScreenMatched, this);
		},

		onNavBack : function() {
			this.oRouter.navTo("structureDefinitionsListAndTables", {
				tab : this.sTabKey
			});
		},

		onPressEdit : function() {
			this.toggleEditMode();
		},

		toggleEditMode : function() {
			var clientModel = this.getView().getModel("client");
			var bIsEditMode = clientModel.getProperty("/isEditMode");
			clientModel.setProperty("/isEditMode", !bIsEditMode);
		},

		getStructureDefinitionBusyDialog : function() {
			return this.getView().byId("structureDefinitionBusyDialog");
		},

		onStructureDefinitionBusyDialogClosed : function(oEvent) {
			if (oEvent.getParameter("cancelPressed") === true) {
				this._mRequests.structureDefinition.abort();
			}
		},

		openStructureDefinitionBusyDialog : function() {
			var oBusyDialog = this.getStructureDefinitionBusyDialog();
			oBusyDialog.open();
		},

		closeStructureDefinitionBusyDialog : function() {
			var oBusyDialog = this.getStructureDefinitionBusyDialog();
			oBusyDialog.close();
		},

		_onStructureDefinitionScreenMatched : function(oEvent) {
			this.sTabKey = oEvent.getParameter("arguments").tab;
			this.sStructDefinitionId = oEvent.getParameter("arguments").structId;
			this.byId("structureDefinitionPage").bindElement({
				path : "/StructureDefinition/" + this.sStructDefinitionId,
				parameters : {
					groupId : "structureDefinition"
				}
			});

		},

		onPressRefresh : function() {
			this.getView().getModel().refresh();
		},

		onPressSave : function() {
			this.openStructureDefinitionBusyDialog();

			this._mRequests = this.getView().getModel().submitChanges("structureDefinition", this.onSuccessfulSave.bind(this), this.onFailureSave.bind(this));

			if (!this._mRequests) {
				sap.m.MessageToast.show(Utils.getI18nText(this.getView(), "structureDefinitionMsgSaveNoChanges"));
				this.toggleEditMode();
				this.closeStructureDefinitionBusyDialog();
			}
		},

		onPressCancel : function() {
			this.getView().getModel().resetChanges();
			this.toggleEditMode();
		},

		onSuccessfulSave : function(oResponse) {
			this.toggleEditMode();
			this.closeStructureDefinitionBusyDialog();
			sap.m.MessageToast.show(Utils.getI18nText(this.getView(), "structureDefinitionMsgSaveSuccess"));
			Log.info("Successful save operation with response: " + JSON.stringify(oResponse));
		},

		onFailureSave : function(oError, aResource, aOperationOutcome) {
			this.closeStructureDefinitionBusyDialog();
			if (oError.statusText !== "abort") {
				MessageBox.error(Utils.getI18nText(this.getView(), "structureDefinitionMsgSaveFailed", [ oError.message ]), {
					styleClass : this.getOwnerComponent().getContentDensityClass()
				});
			}
		},

		createStructDef : function() {

			// state of the art way of fhir model
			var sResId = this.getView().getModel().create("StructureDefinition", {});
			this.byId("structDefCreateScrollContainer").bindElement({
				path : "/StructureDefinition/" + sResId,
				parameters : {
					groupId : "stdChange"
				}
			});

			// not implemented yet - state of the art odata model like
			// this.getView().getModel().create("StructureDefinition", {
			// resource : {
			// name : this.byId("newName").getValue(),
			// description : this.byId("newDescription").getValue()
			// },
			// groupId : "stdChange"
			// });
			// this.getView().getModel().submitChanges("stdChange");

		}

	});
});
