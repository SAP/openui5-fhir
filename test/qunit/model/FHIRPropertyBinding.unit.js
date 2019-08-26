sap.ui.define(["../utils/TestUtils"], function (TestUtils) {
	"use strict";

	var oModel, oPropertyBinding;

	function createModel(mParameters) {
		oModel = TestUtils.createFHIRModel("https://example.com/fhir", mParameters);
	}

	function createPropertyBinding(sPath, oContext, mParameters) {
		oPropertyBinding = oModel.bindProperty(sPath, oContext, mParameters);
	}

	QUnit.module("Unit-Tests: FHIRPropertyBinding", {
		beforeEach: function () {
			createModel();
		}
	});

	QUnit.test("create and initialize", function (assert) {
		var sPath = "/Patient/123/name/0/given";
		createPropertyBinding(sPath, undefined);
		assert.strictEqual(oPropertyBinding.isInitial(), false, "The binding is after creation not in 'initial' mode.");
		assert.deepEqual(oPropertyBinding.initialize(), oPropertyBinding, "The initialize method returns the binding itself.");
		assert.strictEqual(oPropertyBinding.isInitial(), false, "The binding is after initialization not in 'initial' mode.");
	});

});