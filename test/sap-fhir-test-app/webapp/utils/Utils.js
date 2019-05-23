sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/base/util/merge",
	"sap/ui/thirdparty/jquery"
], function(DateFormat, merge, jQuery) {
	"use strict";

	function formatDateFactory(sDate, oCustomDate) {
		if (sDate) {
			var oDate = new Date(sDate);
			return oCustomDate.format(oDate, true);
		} else {
			return "";
		}
	}

	function getjQueryUiObjListWithErrors() {
		return merge(jQuery(".sapMInputBaseError"), jQuery(".sapMSltError"));
	}

	function setControlValueState(oControl, sMsg, sState) {
		var oComponent = sap.ui.getCore().getComponent("demoComponent");
		var oResourceBundle = oComponent.getRootControl().getModel("i18n").getResourceBundle();
		oControl.setValueState(sState || "Error");
		oControl.setValueStateText(oResourceBundle.getText(sMsg));
	}

	function isEmpty(oControl) {
		var bIsEmpty = oControl.getValue() === "";
		setControlValueState(oControl, bIsEmpty ? "emptyValue" : "", bIsEmpty ? undefined : "None");
		return bIsEmpty;
	}

	function isValidDate(oEvent) {
		var bIsValid = oEvent.getParameter("valid");
		setControlValueState(oEvent.getSource(), bIsValid ? "" : "invalidValue", bIsValid ? "None" : undefined);
		return bIsValid;

	}

	function getBusyDialog() {
		var busyDialog = sap.ui.getCore().byId("busyDialog");

		if (!busyDialog) {
			busyDialog = new sap.m.BusyDialog("busyDialog", {});
		}

		return busyDialog;
	}

	return {

		/**
		 * Opens the busydialog
		 *
		 * @public
		 */
		openBusyDialog : function() {
			getBusyDialog().open();
		},

		/**
		 * Closes the busydialog
		 *
		 * @public
		 */
		closeBusyDialog : function() {
			getBusyDialog().close();
		},

		getControlByParentAndCssClass : function(oAncestorControl, sCssClass) {
			return sap.ui.getCore().byId(jQuery("#" + oAncestorControl.getId()).find("." + sCssClass).attr("id"));
		},

		getControlByParentAndCssClassWithIndex : function(oAncestorControl, sCssClass, iIndex) {
			return sap.ui.getCore().byId(jQuery("#" + oAncestorControl.getId()).find("." + sCssClass)[iIndex].id);
		},

		getControllByIdEndstring : function(sIdEndstring) {
			return sap.ui.getCore().byId(jQuery("[id$=" + sIdEndstring + "]").attr("id"));
		},

		getControllByIdSubstring : function(sIdSubstring) {
			if (jQuery("[id*=" + sIdSubstring + "]")[0]) {
				return sap.ui.getCore().byId(jQuery("[id*=" + sIdSubstring + "]")[0].id);
			}
			return undefined;
		},

		filterArrayContains : function(aArray, sAttribute, sFilterValue) {
			return aArray.filter(function(oArrayAttribute) {
				return oArrayAttribute[sAttribute].indexOf(sFilterValue) > -1;
			});
		},

		formatDateTime : function(sDate) {
			return formatDateFactory(sDate, DateFormat.getDateTimeInstance({
				style : "medium"
			}));
		},

		formatDate : function(sDate) {
			return formatDateFactory(sDate, DateFormat.getDateInstance({
				style : "medium"
			}));
		},

		areErrorMessagesCleared : function() {
			var jQueryUiObjListWithErrors = getjQueryUiObjListWithErrors();
			var bAreErrorMessagesCleared = jQueryUiObjListWithErrors[0] === undefined;
			if (!bAreErrorMessagesCleared) {
				sap.ui.getCore().byId(jQueryUiObjListWithErrors[0].id).focus();
			}
			return bAreErrorMessagesCleared;
		},

		setErrorValueState : function(oControl, sMsg, sState) {
			setControlValueState(oControl, sMsg, sState);
		},

		clearErrorValueState : function(oControl) {
			setControlValueState(oControl, "", "None");
		},

		doesValueMatchPattern : function(sValue, sRegex) {
			if (sRegex) {
				var regex = new RegExp(sRegex, "\g");
				return regex.test(sValue);
			}
			return true;
		},

		emptyCheck : function(oEvent) {
			if (oEvent.getSource().getSelectedKey()) {
				setControlValueState(oEvent.getSource(), "", "None");
			} else {
				setControlValueState(oEvent.getSource(), "invalidValue");
			}
		},

		validCheck : function(oEvent) {
			if (isEmpty(oEvent.getSource())) {
				return;
			}
			isValidDate(oEvent);
		},

		isValueStorable : function(oControl) {
			return oControl.getValue() !== "" && oControl.getValueState() === "None";
		},

		dateCheck : function(oEvent) {
			isValidDate(oEvent);
		},

		onAfterRenderingControllRedirectFocus : function(oControlWhoGetsFocus, oControlWhoShouldGetFocus) {
			if (oControlWhoGetsFocus) {
				oControlWhoGetsFocus.addEventDelegate({
					onfocusin : function() {
						if (oControlWhoShouldGetFocus) {
							oControlWhoShouldGetFocus.focus();
						}
					}
				});
			}
		},

		getI18nText : function(oView, sKey, aParameters) {
			return oView.getModel("i18n").getResourceBundle().getText(sKey, aParameters);
		}
	};
});