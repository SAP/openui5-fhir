sap.ui.define([
	"../utils/TestUtilsIntegration",
	"../utils/TestUtils",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterOperator"
], function (TestUtilsIntegration, TestUtils, FHIRFilter, FHIRFilterOperator) {
	"use strict";

	var oModel, oTreeBinding;

	function createModel(mParameters) {
		oModel = TestUtils.createFHIRModel("http://localhost:8080/fhir/R4", mParameters);
	}

	function createTreeBinding(sPath, oContext, aFilters, mParameters, aSorters){
		// create binding
		oTreeBinding = oModel.bindTree(sPath, oContext, aFilters, mParameters, aSorters).initialize();
	}


	QUnit.module("Integration-Tests: FHIRTreeBinding", {
		beforeEach: function () {
			createModel();
		}
	});

	QUnit.test("check if response has no total property that error in tree binding is thrown", function (assert) {
		var sPath = "/StructureDefinition";
		var mParameters = { rootSearch: "base", rootProperty: "baseDefinition", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", nodeProperty: "url", refreshByExpand: "true" };
		createTreeBinding(sPath, undefined, undefined, mParameters);
		TestUtilsIntegration.manipulateResponse("http://localhost:8080/fhir/R4/StructureDefinition?base=http://hl7.org/fhir/StructureDefinition/DomainResource&_count=10&_format=json&_total=accurate", oModel, TestUtilsIntegration.setTotalUndefined, TestUtilsIntegration.checkErrorMsg.bind(undefined, oModel, assert, "FHIR Server error: The \"total\" property is missing in the response for the requested FHIR resource " + sPath));
		oTreeBinding.getContexts();
	});

	QUnit.test("check that pending request is terminated in treebinding if no entry is found in the response object", function (assert) {
		var oBaseFilter = new FHIRFilter({ path: "type", operator: FHIRFilterOperator.Contains, value1: "FakeResourceType" });
		var mParameters = { rootSearch: "base", rootProperty: "baseDefinition", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", nodeProperty: "url", refreshByExpand: "true" };
		createTreeBinding("StructureDefinition", undefined, [oBaseFilter], mParameters);
		var done1 = assert.async();
		var fnDataReceivedCheck = function () {
			oTreeBinding.detachDataReceived(fnDataReceivedCheck);
			assert.strictEqual(false, oTreeBinding.bPendingRequest, "The request isn't pending");
			done1();
		};
		oTreeBinding.attachDataReceived(fnDataReceivedCheck);
		oTreeBinding.getContexts();
	});

	QUnit.test("Test getNodeContexts", function(assert){
		var mParameters = {rootSearch: "base", rootProperty: "baseDefinition", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", nodeProperty: "url"};
		createTreeBinding("/StructureDefinition", undefined, undefined, mParameters);

		var done = assert.async();

		var fnChangeHandler2 = function(){
			oTreeBinding.getContexts(0, 10);
			var oAccountNode = oTreeBinding.getNodeByIndex(0);
			assert.strictEqual(oAccountNode.nodeState.expanded, false, "The first node is not expanded.");
			done();
		};

		var fnChangeHandler1 = function () {
			oTreeBinding.detachChange(fnChangeHandler1);
			assert.strictEqual(false, oTreeBinding.isInitial(), "Treebinding is not longer in initial state.");
			var aContexts = oTreeBinding.getContexts(0, 10);
			var oAccountContext = aContexts[0];
			assert.strictEqual(oModel.getProperty("name", oAccountContext), "Account", "The first context in tree is 'Account'");
			oTreeBinding.getNodeContexts(oAccountContext, fnChangeHandler2);
		};


		oTreeBinding.attachChange(fnChangeHandler1);
		oTreeBinding.getContexts(0, 10);
	});
});