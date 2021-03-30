sap.ui.define([
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilterOperatorUtils",
	"sap/fhir/model/r4/FHIRFilter"
], function (FHIRFilterOperator, FHIRFilterOperatorUtils, FHIRFilter) {
	"use strict";

	QUnit.module("Unit-Tests: FHIRFilterOperatorUtils", {});

	QUnit.test("Test function getFHIRFilterPrefix ", function (assert) {
		var oFilter = new FHIRFilter({ operator: FHIRFilterOperator.EQ });
		var sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("eq", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.NE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ne", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.GE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ge", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.LE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("le", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.StartsWith });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("sw", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.EndsWith });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ew", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.GT });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("gt", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.LT });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("lt", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.SA });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("sa", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.EB });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("eb", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.AP });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ap", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.PR });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("pr", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.PO });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("po", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.IN });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("in", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.SS });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ss", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.SB });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("sb", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.RE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("re", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.Contains });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("co", sFHIRFilterPrefix);
		oFilter = new FHIRFilter({ operator: FHIRFilterOperator.NI });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ni", sFHIRFilterPrefix);
	});
});