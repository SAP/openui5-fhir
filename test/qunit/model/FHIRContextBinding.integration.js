sap.ui.define(["../utils/TestUtilsIntegration", "../utils/TestUtils"], function (TestUtilsIntegration, TestUtils) {
	"use strict";

	var oModel, oContextBinding;

	function createModel(mParameters) {
		oModel = TestUtils.createFHIRModel("http://localhost:8080/fhir/R4/", mParameters);
	}

	function createContextBinding(sPath, oContext, mParameters) {
		oContextBinding = oModel.bindContext(sPath, oContext, mParameters).initialize();
	}

	QUnit.module("Integration-Tests: FHIRContextBinding", {
		beforeEach: function () {
			createModel();
		}
	});

	QUnit.test("Check if contextbinding is initialized correctly", function (assert) {
		var done = assert.async();
		var fnChangeHandler1 = function(oEvent){
			oContextBinding.detachChange(fnChangeHandler1);
			var aPatientKeys = Object.keys(oModel.oData.Patient);
			assert.strictEqual(oContextBinding.isInitial(), false);
			assert.strictEqual(oContextBinding.bPendingRequest, false);
			assert.strictEqual(oContextBinding.bUnique, undefined);
			assert.strictEqual(aPatientKeys.length, 4);
			assert.strictEqual(oContextBinding.getBoundContext().iTotal, 4);
			assert.strictEqual(oContextBinding.getContext(), undefined);
			assert.strictEqual(oContextBinding.getPath(), "/Patient");
			done();
		};
		createContextBinding("/Patient", undefined, undefined);
		oContextBinding.attachChange(fnChangeHandler1);
	});
});