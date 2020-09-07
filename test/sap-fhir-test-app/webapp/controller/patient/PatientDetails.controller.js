sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap-fhir-test-app/utils/Utils",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/m/MessageBox",
	"sap/base/Log",
	"sap/base/util/deepEqual"
], function(Controller, Filter, History, MessageToast, Utils, FHIRFilterOperator, FHIRUtils, MessageBox, Log, deepEqual) {
	"use strict";

	return Controller.extend("sap-fhir-test-app.controller.patient.PatientDetails", {

		utils : Utils,

		onInit : function() {
			this.oView = this.getView();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("patientDetails").attachPatternMatched(this._onObjectMatched, this);
			oRouter.getRoute("patientCreate").attachPatternMatched(this._onObjectMatched, this);
		},

		scrollToTab : function(sTabKey) {
			this.byId("itbPatientDetails").setSelectedKey(sTabKey);
		},

		onMessagePopoverPress : function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		_getMessagePopover : function () {
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "sap-fhir-test-app.view.patient.fragments.MessagePopover", this);
				jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), this._oMessagePopover);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},

		setupView : function(oEvent) {
			this.sPatientPath = "/Patient/" + this.sPatientId;
			var oContext = this.oView.getBindingContext();
			if (!oContext || oContext.sPath !== this.sPatientPath) {
				this.oView.bindElement({
					path : this.sPatientPath,
					parameters : {
						groupId : "patientDetails"
					}
				});
			}
			this.oModel = this.oView.getModel();
			var sTabKey = oEvent.getParameter("arguments").tab;
			this.scrollToTab(sTabKey);
			this.switchTab(sTabKey);

			var fnSuccessClaim = function(oData) {
				if (oData.entry) {
					var sClaimId = oData.entry[0].resource.id;
					this.byId("tblServices").bindElement({
						path : "/Claim/" + sClaimId
					});
				} else {
					this.byId("tblServices").unbindElement();
				}
			}.bind(this);

			if (sTabKey === "services") {
				this.oModel.sendGetRequest("/Claim", {
					urlParameters : {
						patient : "Patient/" + this.sPatientId
					},
					success : fnSuccessClaim
				});
			}

			return sTabKey;
		},

		_onObjectMatched : function(oEvent) {
			this.sPatientId = oEvent.getParameter("arguments").patientId;
			var sTabKey = this.setupView(oEvent);

			if (sTabKey === "admission" && !this.oModel.hasResourceTypePendingChanges("Encounter")) {
				this.oModel.sendGetRequest("/Encounter", {
					urlParameters : {
						subject : "Patient/" + this.sPatientId
					},
					success : function(oData) {
						this.createEncounter(oData);
					}.bind(this)
				});
			}
		},

		onBeforeRebindTableVers : function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			mBindingParams.parameters.groupId = "patientDetails";
			mBindingParams.parameters.request = { _include : "Coverage:payor" };
			if (this.sPatientId) {
				mBindingParams.filters.push(new sap.ui.model.Filter("subscriber", FHIRFilterOperator.EQ, "Patient/" + this.sPatientId));
			}

		},

		onBeforeRebindTableDiag : function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			mBindingParams.parameters.groupId = "patientDetails";
			if (this.sPatientId) {
				mBindingParams.filters.push(new sap.ui.model.Filter("patient", FHIRFilterOperator.EQ, "Patient/" + this.sPatientId));
			}
		},

		createEncounter : function(oData) {
			var sEncounterId;
			if (!oData || !oData.entry) {
				sEncounterId = this.oModel.create("Encounter", {
					status : "arrived",
					subject : {
						reference : "Patient/" + this.sPatientId
					}
				});
			} else {
				sEncounterId = oData.entry[0].resource.id;
			}
			this._bindEncounterProperties(sEncounterId);
		},

		_bindEncounterProperties : function(sEncounterId) {
			this.byId("CaseType").bindProperty("selectedKey", {
				path : "/Encounter/" + sEncounterId + "/class/code"
			});
			this.byId("AdmissionType").bindProperty("selectedKey", {
				path : "/Encounter/" + sEncounterId + "/type/0/coding/0/code"
			});
			this.byId("input_treatmentCategory").bindProperty("value", {
				path : "/Encounter/" + sEncounterId + "/hospitalization/extension/[url=http://StructureDefinition/CareCategoryExtension]/extension/[url=code]/valueCodeableConcept/coding/0/code"
			});
		},

		onNavBack : function() {
			this.sPatientId = undefined;
			this.oError = undefined;
			this.oView.unbindElement();
			this.byId("input_nationality").setValue("");
			this.byId("input_country").setValue("");
			this.oModel.resetChanges();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("patientTable", true);
		},

		iconTabBarSelectHandler : function(oEvent) {
			var sSelectedTabKey = oEvent.getSource().getSelectedKey();
			if (this.sPatientId) {
				this.switchTab(sSelectedTabKey);
			}
		},

		switchTab : function(sSelectedTabKey) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sUrl = window.location.href;
			if (!sUrl.endsWith(sSelectedTabKey)){
				this.oModel.resetChanges();
				var aSplittedUrl = sUrl.split("/");
				var oRouteInfo = {
					tab : sSelectedTabKey,
					patientId : this.sPatientId
				};
				oRouter.navTo(aSplittedUrl[aSplittedUrl.length - 3], oRouteInfo);
			}
		},

		formatPatientName : function(sGiven, sFamily) {
			if (!sGiven && !sFamily){
				return "New Patient";
			} else {
				return sGiven + " " + sFamily;
			}
		},

		onVersicherungMenuAction : function(oEvent) {
			var oSelectedItem = oEvent.getParameter("item");
			switch (oSelectedItem.getKey()) {
				case "Versicherung":
					this.openInsuranceDialog("dialogAddInsurance", "sap-fhir-test-app.view.patient.fragments.PatientDetailsVersicherungDialog");
					break;
				case "Selbstzahler":
				case "Fremdregulierer":
					break;
				default:
					break;
			}
		},

		saveInsurance : function() {
			this.byId("inpInsurance").fireChange();
			this.byId("inpInsuranceNumber").fireChange();
			this.byId("drsInsurancePeriod").fireChange({
				valid : this.byId("drsInsurancePeriod")._bValid
			});
			if (Utils.areErrorMessagesCleared()) {
				this.closeInsuranceDialog();
			} else {
				return;
			}
		},

		checkInsuranceNumber : function(oEvent) {
			var oInput = oEvent.getSource();
			if (Utils.doesValueMatchPattern(oInput.getValue(), /^\d{6,12}/)) {
				Utils.clearErrorValueState(oInput);
			} else {
				Utils.setErrorValueState(oInput, "insuranceAddDiagInsuranceNumberErr");
			}
		},

		validCheck : function(oEvent) {
			Utils.validCheck(oEvent);
		},

		emptyCheck : function(oEvent) {
			Utils.emptyCheck(oEvent);
		},

		closeInsuranceDialog : function() {
			this.byId("dialogAddInsurance").destroy();
		},

		cancelInsurance : function() {
			this.oModel.remove(["/Coverage/" + this.sCoverageId]);
			this.closeInsuranceDialog();
		},

		openInsuranceDialog : function(dialogName, dialogView) {
			var oView = this.getView();
			this.sCoverageId = oView.getModel().create("Coverage", {
				status : "active",
				beneficiary : {
					reference : "Patient/" + this.sPatientId
				},
				subscriber : {
					reference : "Patient/" + this.sPatientId
				}
			});

			var oDialog = oView.byId(dialogName);
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), dialogView, this);
				oView.addDependent(oDialog);
			}
			oDialog.addStyleClass("sapUiSizeCompact");
			oDialog.attachAfterOpen(function() {
				this.byId("insuranceAddPage").bindElement({
					path : "/Coverage/" + this.sCoverageId
				});
			}, this);
			oDialog.open();
		},

		onPatientDetailsSavePress : function() {
			var that = this;
			this.oModel.submitChanges("patientDetails",function(oData) {
				MessageToast.show("Patient successfully saved");
				if (oData.resourceType === "Patient"){
					that.sPatientId = oData.id;
				} else if (oData.resourceType === "Encounter") {
					that._bindEncounterProperties(oData.id);
				}
				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("patientDetails", {
					tab : that.byId("itbPatientDetails").getSelectedKey(),
					patientId : that.sPatientId
				});
			}, function(oError) {
				MessageToast.show("StatusCode: " + oError.statusCode + "\n" + oError.statusText);
				Log.fatal("Failed to save patient details: " + oError.message);
			});
		},

		onAddContactPressed : function() {
			var sPath = this.sPatientPath + "/contact";
			var aContacts = this.oModel.getProperty(sPath) || [];
			aContacts.unshift({});
			this.oModel.setProperty(sPath, aContacts);
		},

		onDeleteContactClicked : function(){
			var oItems = this.byId("tblContacts").getSelectedItems();
			this.openDeleteContactDialog(oItems);
		},

		openDeleteContactDialog : function(oItems) {
			MessageBox.warning("Are you sure to delete the selected Items?", {
				actions : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose : this.deleteContactDialogCallback(oItems).bind(this)
			});
		},

		deleteContactDialogCallback : function(oItems) {
			return function(sAction) {
				if (sAction === sap.m.MessageBox.Action.OK) {
					this.deleteSelectedItems(oItems);
				}
			};
		},

		deleteSelectedItems : function(aItems) {
			var sPath = this.sPatientPath + "/contact";
			var aContacts = this.oModel.getProperty(sPath);
			for (var i = 0; i < aItems.length; i++){
				var lastIndex = aItems[i].getBindingContext().getPath().lastIndexOf("/");
				var indexToDelete = aItems[i].getBindingContext().getPath().substring(lastIndex + 1);
				aContacts.splice(indexToDelete, 1);
			}
			this.oModel.setProperty(sPath, aContacts);
			this.byId("tblContacts").removeSelections();
		},

		onAddDiagnosticReportPressed : function() {
			var sPath = "DiagnosticReport";
			this.oModel.create(sPath, {
				status : "registered",
				code : {
					coding : {
						code : "1-8",
						system : "http://loinc.org"
					}
				},
				subject : {
					reference : "Patient/" + this.sPatientId
				}
			});
		},

		createStandardListItem : function(sDescription, sTitle) {
			return new sap.m.StandardListItem({
				description : "{" + sDescription + "}",
				title : "{" + sTitle + "}"
			});
		},

		handleValueHelp : function(oEvent, oBinding, sI18nDialogTitle, sFilterParam) {
			this.oInputField = oEvent.getSource();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			oBinding.templateShareable = false;
			this._valueHelpDialog = sap.ui.xmlfragment("sap-fhir-test-app.view.patient.fragments.Dialog", this);
			if (!oBinding.template) {
				oBinding.template = this.createStandardListItem("code", "display");
			}
			this._valueHelpDialog.setTitle(sI18nDialogTitle);
			this._valueHelpDialog.bindAggregation("items", oBinding);
			this.getView().addDependent(this._valueHelpDialog);

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([ new Filter(sFilterParam || "display", FHIRFilterOperator.Contains, this.oInputField.getValue()) ]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(this.oInputField.getValue());
			if (Utils.getControllByIdSubstring("clone")) {
				Utils.onAfterRenderingControllRedirectFocus(Utils.getControllByIdSubstring("clone"), this._valueHelpDialog._searchField);
			} else {
				oBinding.binding.attachDataReceived(function() {
					Utils.onAfterRenderingControllRedirectFocus(Utils.getControllByIdSubstring("clone"), this._valueHelpDialog._searchField);
				}.bind(this));
			}
		},

		_handleValueHelpSearch : function(evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(evt.getParameter("itemsBinding").aFilters[0].sPath, FHIRFilterOperator.Contains, sValue);
			evt.getSource().getBinding("items").filter([ oFilter ]);
		},

		_handleValueHelpClose : function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var sDescription = oSelectedItem.getDescription();
				var sTitle = oSelectedItem.getTitle();
				if (this.oInputField.getId().indexOf("input_ICDText") > -1) {
					this.oInputField.setSelectedKey(sDescription);
					var oICDCodeInput = Utils.getControlByParentAndCssClass(this.oInputField.getParent(), "icdCode");
					oICDCodeInput.setSelectedKey(sDescription);
				} else if (this.oInputField.getId().indexOf("input_ICDCode") > -1) {
					this.oInputField.setSelectedKey(sTitle);
					var oICDTextInput = Utils.getControlByParentAndCssClass(this.oInputField.getParent(), "icdText");
					oICDTextInput.setSelectedKey(sTitle);
				} else if (this.oInputField.getId().indexOf("inpInsurance") > -1) {
					this.setCoverageRef(oSelectedItem.getBindingContextPath());
					this.oInputField.setSelectedKey(sTitle);
				} else {
					this.oInputField.setSelectedKey(sDescription);
				}
			}
			evt.getSource().getBinding("items").filter([]);
		},

		handleSuggestIcdCode : function(oEvent) {
			this.handleSuggestICD(oEvent, "icdText");
		},

		handleSuggestIcdText : function(oEvent) {
			this.handleSuggestICD(oEvent, "icdCode");
		},

		handleSuggestICD : function(oEvent, sClass) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oInput = Utils.getControlByParentAndCssClass(oEvent.getSource().getParent(), sClass);
				oInput.setSelectedKey(oSelectedItem.getKey());
				oEvent.getSource().setSelectedKey(oSelectedItem.getKey());
			}
		},

		handleValueHelpInsurance : function(oEvent) {
			var oBinding = {
				path : "/Organization",
				template : this.createStandardListItem("name", "name")
			};
			this.handleValueHelp(oEvent, oBinding, "Payer", "name");
		},

		handleValueHelpTreatmentCategory : function(oEvent) {
			var oBinding = {
				path : "/ValueSet/CareCategory",
				parameters : {
					request: {url : "scala_poc/ValueSet/CareCategory"}
				}
			};
			this.handleValueHelp(oEvent, oBinding, "Treatment Categories");
		},

		handleValueHelpCountry : function(oEvent) {
			var oBinding = {
				path : "/ValueSet/v3-hl7Realm",
				parameters : {
					request: {url : "http://hl7.org/fhir/ValueSet/v3-hl7Realm"}
				}
			};
			this.handleValueHelp(oEvent, oBinding, "Countries");
		},

		handleValueHelpNationality : function(oEvent) {
			var oBinding = {
				path : "/ValueSet/nationality",
				parameters : {
					request: {url : "http://hl7.org/fhir/ValueSet/v3-hl7Realm"}
				}
			};
			this.handleValueHelp(oEvent, oBinding, "Nationality");
		},

		handleValueHelpDiagnosis : function(oEvent) {
			var oBinding = {
				path : "/ValueSet/ICD10",
				parameters : {
					request: {url : "scala_poc/ValueSet/ICD10"}
				}
			};
			this.handleValueHelp(oEvent, oBinding, "Diagnosises");
		},

		handleValueHelpDiagnosisCode : function(oEvent) {
			var oBinding = {
				path : "/ValueSet/ICD10",
				parameters : {
					request: {url : "scala_poc/ValueSet/ICD10"}
				},
				template : this.createStandardListItem("display", "code")
			};
			this.handleValueHelp(oEvent, oBinding, "Diagnosises", "code");
		},

		handleSuggestPayor : function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.setCoverageRef(oSelectedItem.getBindingContext().getPath());
			}
		},

		setCoverageRef : function(sPath) {
			this.oModel.setProperty("/Coverage/" + this.sCoverageId + "/payor", [
				{
					reference : sPath.substring(1)
				}
			]);
		}

	});

});