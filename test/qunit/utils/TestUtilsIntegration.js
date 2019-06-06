sap.ui.define(["sap/base/util/merge"], function (merge) {
	"use strict";
	var TestUtilsIntegration = {};

	/**
	 * 
	 */
	TestUtilsIntegration.manipulateResponse = function (sRequestedUrl, oModel, fnSetResponse, fnDoCheck) {
		var fnManipulateResponse = function (oEvent) {
			if (oEvent.getParameter("requestHandle").getUrl() === sRequestedUrl) {
				oEvent.getParameter("requestHandle").getRequest().success(function (oRequestHandle) {
					fnSetResponse(oRequestHandle);
				}.bind(this, oEvent.getParameter("requestHandle")));
			}
		};
		oModel.attachRequestSent(fnManipulateResponse);
		fnDoCheck();
	};

	/**
	 * 
	 */
	TestUtilsIntegration.setTotalUndefined = function (oRequestHandle) {
		delete oRequestHandle.getRequest().responseJSON.total;
	};

	/**
	 * 
	 */
	TestUtilsIntegration.checkErrorMsg = function (oModel, assert, sPath) {
		var done1 = assert.async();
		var fnCheckErrorMessage = function (oEvent) {
			oModel.detachMessageChange(fnCheckErrorMessage);
			done1();
			assert.strictEqual(oEvent.getParameter("newMessages").message, "FHIR Server error: The \"total\" property is missing in the response for the requested FHIR resource " + sPath, "The correct error was thrown");
		};
		oModel.attachMessageChange(fnCheckErrorMessage);
	};

	return TestUtilsIntegration;

});