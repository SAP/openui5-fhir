sap.ui.define([
	"sap/fhir/model/r4/FHIRFilterComplexOperator",
	"sap/fhir/model/r4/FHIRFilterOperatorUtils",
	"sap/fhir/model/r4/FHIRFilter"
], function (FHIRFilterComplexOperator, FHIRFilterOperatorUtils, FHIRFilter) {
	"use strict";

	QUnit.module("Unit-Tests: FHIRFilterOperatorUtils", {});

	QUnit.test("Test function getFHIRFilterPrefix ", function (assert) {
		var oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.EQ });
		var sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("eq", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.NE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ne", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.GE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ge", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.LE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("le", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.StartsWith });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("sw", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.EndsWith });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ew", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.GT });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("gt", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.LT });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("lt", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.SA });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("sa", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.EB });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("eb", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.AP });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ap", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.PR });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("pr", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.PO });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("po", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.IN });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("in", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.SS });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ss", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.SB });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("sb", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.RE });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("re", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.Contains });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("co", sFHIRFilterPrefix);

		oFilter = new FHIRFilter({ operator: FHIRFilterComplexOperator.NI });
		sFHIRFilterPrefix = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
		assert.strictEqual("ni", sFHIRFilterPrefix);
	});
});