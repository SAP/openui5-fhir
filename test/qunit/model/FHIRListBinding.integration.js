sap.ui.define(["../utils/TestUtilsIntegration", "../utils/TestUtils"], function (TestUtilsIntegration, TestUtils) {
	"use strict";

	var oModel, oListBinding, oContextBinding;

	function createModel(mParameters) {
		oModel = TestUtils.createFHIRModel("http://localhost:8080/fhir/R4", mParameters);
	}

	function createListBinding(sPath, oContext, aSorters, aFilters, mParameters) {
		// create binding
		oListBinding = oModel.bindList(sPath, oContext, aSorters, aFilters, mParameters).initialize();
	}

	function createContextBinding(sPath, oContext, mParameters) {
		// create binding
		oContextBinding = oModel.bindContext(sPath, oContext, mParameters).initialize();
	}


	QUnit.module("Integration-Tests: FHIRListBinding", {
		beforeEach: function () {
			createModel();
		}
	});

	QUnit.test("check if valueset is loaded if mentioned in the structure definition field description of type 'code'", function (assert) {
		var sPath = "/Patient/a2519";
		var sListPath = "gender";

		var done = assert.async();

		var fnChangeHandler1 = function () {
			var fnChangeHandler2 = function (oEvent) {
				var fnChangeHandler3 = function (oEvent) {
					var aValueSetKeys = Object.keys(oModel.oData.ValueSet);
					var sFirstValueSetKey = aValueSetKeys[0];
					var aValueSetEntries = oModel.oData.ValueSet[sFirstValueSetKey];
					assert.strictEqual(sFirstValueSetKey[0] === "§", true);
					assert.strictEqual(sFirstValueSetKey[sFirstValueSetKey.length - 1] === "§", true);
					assert.strictEqual(aValueSetEntries.length, 4);
					assert.strictEqual(oListBinding.aKeys.length, 4);
					done();
				};
				oListBinding.detachChange(fnChangeHandler2);
				oListBinding.attachChange(fnChangeHandler3);
				var aStructureDefinitionKeys = Object.keys(oModel.oData.StructureDefinition);
				assert.strictEqual(aStructureDefinitionKeys.length, 1);
			};

			createListBinding(sListPath, oContextBinding.getBoundContext());
			oListBinding.attachChange(fnChangeHandler2);
			oListBinding.getContexts();
		};

		createContextBinding(sPath);
		oContextBinding.attachChange(fnChangeHandler1);
	});

	QUnit.test("check if valueset is loaded if mentioned in the structure definition field description of type 'codeableconcept'", function (assert) {
		var sPath = "/Coverage/a7854";
		var sListPath = "type";

		var done = assert.async();

		var fnChangeHandler1 = function () {
			var fnChangeHandler2 = function (oEvent) {
				var fnChangeHandler3 = function (oEvent) {
					var aValueSetKeys = Object.keys(oModel.oData.ValueSet);
					var sFirstValueSetKey = aValueSetKeys[0];
					var aValueSetEntries = oModel.oData.ValueSet[sFirstValueSetKey];
					assert.strictEqual(sFirstValueSetKey[0] === "§", true);
					assert.strictEqual(sFirstValueSetKey[sFirstValueSetKey.length - 1] === "§", true);
					assert.strictEqual(aValueSetEntries.length, 21);
					assert.strictEqual(oListBinding.aKeys.length, 21);
					done();
				};
				oListBinding.detachChange(fnChangeHandler2);
				oListBinding.attachChange(fnChangeHandler3);
				var aStructureDefinitionKeys = Object.keys(oModel.oData.StructureDefinition);
				assert.strictEqual(aStructureDefinitionKeys.length, 1);
			};

			createListBinding(sListPath, oContextBinding.getBoundContext());
			oListBinding.attachChange(fnChangeHandler2);
			oListBinding.getContexts();
		};
		createContextBinding(sPath);
		oContextBinding.attachChange(fnChangeHandler1);
	});
});