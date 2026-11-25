sap.ui.define(["../utils/TestUtils", "sap/fhir/model/r4/lib/HTTPMethod"], function (TestUtils, HTTPMethod) {
	"use strict";

	var oModel, oListBinding;

	QUnit.module("Unit-Tests: FHIRListBinding", {
		beforeEach: function () {
			oModel = TestUtils.createFHIRModel("https://example.com/fhir");
			oListBinding = oModel.bindList("/Patient");
		}
	});

	QUnit.test("suspend and resume", function (assert) {
		var iChanges = 0;
		oListBinding.attachChange(function () {
			iChanges++;
		});
		oListBinding.suspend();
		assert.strictEqual(oListBinding.isSuspended(), true, "The binding is suspended.");
		oListBinding.checkUpdate(false, undefined, HTTPMethod.PUT);
		assert.strictEqual(iChanges, 0, "A suspended binding does not fire a change event on checkUpdate.");
		oListBinding.resume();
		assert.strictEqual(oListBinding.isSuspended(), false, "The binding is resumed.");
		assert.strictEqual(iChanges, 1, "Resuming fires the change that was held back while suspended.");
		oListBinding.checkUpdate(false, undefined, HTTPMethod.PUT);
		assert.strictEqual(iChanges, 2, "A resumed binding fires change events again.");
	});

	QUnit.test("resume without a change during suspension", function (assert) {
		var iChanges = 0;
		oListBinding.attachChange(function () {
			iChanges++;
		});
		oListBinding.suspend();
		oListBinding.resume();
		assert.strictEqual(iChanges, 0, "Nothing changed while suspended, so resuming fires no change event.");
	});

});
