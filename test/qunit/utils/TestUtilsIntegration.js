sap.ui.define(["sap/base/util/merge"], function (merge) {
	"use strict";
	var TestUtilsIntegration = {};

	/**
	 * Manipulates the response of the request on given <code>sRequestedUrl</code>
	 *
	 * @protected
	 * @param {string} sRequestedUrl The requested URL
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The FHIRModel instance
	 * @param {function} fnSetResponse The function which overrides the response
	 * @param {function} fnDoCheck The function which performs the asserts
	 * @since 1.0.0
	 */
	TestUtilsIntegration.manipulateResponse = function (sRequestedUrl, oModel, fnSetResponse, fnDoCheck) {
		var fnManipulateResponse = function (oEvent) {
			if (oEvent.getParameter("requestHandle").getUrl() === sRequestedUrl) {
				oModel.detachRequestSent(fnManipulateResponse);
				oEvent.getParameter("requestHandle").getRequest().success(function (oRequestHandle) {
					fnSetResponse(oRequestHandle);
				}.bind(this, oEvent.getParameter("requestHandle")));
			}
		};
		oModel.attachRequestSent(fnManipulateResponse);
		fnDoCheck();
	};

	/**
	 * Removes the 'total' property in a response
	 *
	 * @protected
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The affected request
	 * @since 1.0.0
	 */
	TestUtilsIntegration.setTotalUndefined = function (oRequestHandle) {
		delete oRequestHandle.getRequest().responseJSON.total;
	};

	/**
	 * Removes the 'total' property in a valueset expansion response
	 *
	 * @protected
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The affected request
	 * @since 1.0.0
	 */
	TestUtilsIntegration.setTotalOfValueSetOperationUndefined = function (oRequestHandle) {
		delete oRequestHandle.getRequest().responseJSON.expansion.total;
	};

	/**
	 * Removes the 'total' property and the code values in a valueset expansion response
	 *
	 * @protected
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The affected request
	 * @since 1.0.0
	 */
	TestUtilsIntegration.setValueSetPropertiesUndefined = function (oRequestHandle) {
		TestUtilsIntegration.setTotalOfValueSetOperationUndefined(oRequestHandle);
		delete oRequestHandle.getRequest().responseJSON.expansion.contains;
	};

	/**
	 * Checks if a request to the given <code>sRequestedUrl</code> was triggered by the given <code>oModel</code> instance
	 *
	 * @protected
	 * @param {string} sRequestedUrl The requested URL
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The FHIRModel instance
	 * @param {function} fnDoCheck The function which performs the asserts
	 */
	TestUtilsIntegration.checkSendRequest = function (sRequestedUrl, oModel, fnDoCheck) {
		var fnCheckRequest = function (oEvent) {
			var oRequestHandle = oEvent.getParameter("requestHandle");
			if (oRequestHandle.getUrl() === sRequestedUrl) {
				fnDoCheck(oRequestHandle);
			}
		};
		oModel.attachRequestSent(fnCheckRequest);
	};


	/**
	 * Checks if the <code>oModel</code> instance throws a message with given <code>sMessage</code>
	 *
	 * @protected
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The FHIRModel instance
	 * @param {object} assert The QUnit assert
	 * @param {string} sMessage The message text
	 */
	TestUtilsIntegration.checkErrorMsg = function (oModel, assert, sMessage) {
		var done1 = assert.async();
		var fnCheckErrorMessage = function (oEvent) {
			oModel.detachMessageChange(fnCheckErrorMessage);
			done1();
			assert.strictEqual(oEvent.getParameter("newMessages").message, sMessage, "The correct message was send and retrieved.");
		};
		oModel.attachMessageChange(fnCheckErrorMessage);
	};

	return TestUtilsIntegration;

});