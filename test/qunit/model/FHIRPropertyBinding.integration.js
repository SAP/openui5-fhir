sap.ui.define(["../utils/TestUtilsIntegration", "../utils/TestUtils"], function (TestUtilsIntegration, TestUtils) {
	"use strict";

	var oModel, oContextBinding, oPropertyBinding;

	function createModel(mParameters) {
		oModel = TestUtils.createFHIRModel("http://localhost:8080/fhir/R4/", mParameters);
	}

	function createContextBinding(sPath, oContext, mParameters) {
		oContextBinding = oModel.bindContext(sPath, oContext, mParameters).initialize();
	}

	function createPropertyBinding(sPath, oContext, mParameters) {
		oPropertyBinding = oModel.bindProperty(sPath, oContext, mParameters).initialize();
	}

	QUnit.module("Integration-Tests: FHIRPropertyBinding", {
		beforeEach: function () {
			createModel();
		}
	});

	QUnit.test("Check if propertybinding is initialized correctly if context is a aggregation of resources", function (assert) {
		var done = assert.async();
		var fnChangeHandler1 = function(oEvent){
			oContextBinding.detachChange(fnChangeHandler1);
			createPropertyBinding("%total%", oContextBinding.getBoundContext());
			assert.strictEqual(oPropertyBinding.getValue(), 4, "The value of the propertybinding contains the correct 'total' value.");
			done();
		};
		createContextBinding("/Patient", undefined, undefined);
		oContextBinding.attachChange(fnChangeHandler1);
	});

	QUnit.test("Check if propertybinding is initialized correctly if context is a single resource", function (assert) {
		var done = assert.async();
		var fnChangeHandler1 = function(oEvent){
			oContextBinding.detachChange(fnChangeHandler1);
			createPropertyBinding("name/0/given/0", oContextBinding.getBoundContext());
			assert.strictEqual(oPropertyBinding.getValue(), "Hans", "The value of the propertybinding contains the correct given name.");
			done();
		};
		createContextBinding("/Patient/a2519", undefined, undefined);
		oContextBinding.attachChange(fnChangeHandler1);
	});

	QUnit.test("Check if propertybinding is initialized correctly if propertybinding is created before context is loaded", function (assert) {
		var done = assert.async();
		createContextBinding("/Patient", undefined, undefined);
		createPropertyBinding("%total%", undefined);
		var fnChangeHandler1 = function(oEvent){
			var fnChangeHandler2 = function(oEvent){
				oPropertyBinding.detachChange(fnChangeHandler2);
				assert.strictEqual(oPropertyBinding.getValue(), 4, "The value of the propertybinding contains the correct 'total' value.");
				done();
			};
			oContextBinding.detachChange(fnChangeHandler1);
			oPropertyBinding.attachChange(fnChangeHandler2);
			oPropertyBinding.setContext(oContextBinding.getBoundContext());
		};
		oContextBinding.attachChange(fnChangeHandler1);
	});

	QUnit.test("Its red", function(assert){
		assert.ok(false);
	});
});