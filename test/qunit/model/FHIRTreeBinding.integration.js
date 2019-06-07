sap.ui.define([
	"../utils/TestUtilsIntegration",
	"../utils/TestUtils",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterOperator"
], function (TestUtilsIntegration, TestUtils, FHIRFilter, FHIRFilterOperator) {
	"use strict";

	function createModel(mParameters) {
		return TestUtils.createFHIRModel("http://localhost:8080/fhir/R4", mParameters);
	}

	QUnit.module("Integration-Tests: FHIRTreeBinding", {
		before: function () {
			this.oFhirModel = createModel();
		}
	});

	QUnit.test("check if response has no total property that error in tree binding is thrown", function (assert) {
		var sPath = "/StructureDefinition";
		var mParameters = { rootSearch: "base:exact", rootProperty: "baseDefinition", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", nodeProperty: "url", refreshByExpand: "true" };
		var oTreeBinding = this.oFhirModel.bindTree(sPath, undefined, undefined, mParameters);
		TestUtilsIntegration.manipulateResponse("http://localhost:8080/fhir/R4/StructureDefinition?base:exact=http://hl7.org/fhir/StructureDefinition/DomainResource&_count=10&_format=json&_total=accurate", this.oFhirModel, TestUtilsIntegration.setTotalUndefined, TestUtilsIntegration.checkErrorMsg.bind(undefined, this.oFhirModel, assert, "FHIR Server error: The \"total\" property is missing in the response for the requested FHIR resource " + sPath));
		oTreeBinding.getContexts();
	});

	QUnit.test("check that pending request is terminated in treebinding if no entry is found in the response object", function (assert) {
		var oBaseFilter = new FHIRFilter({ path: "type", operator: FHIRFilterOperator.Contains, value1: "FakeResourceType" });
		var mParameters = { rootSearch: "base:exact", rootProperty: "baseDefinition", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", nodeProperty: "url", refreshByExpand: "true" };
		var oTreeBinding = this.oFhirModel.bindTree("StructureDefinition", undefined, [oBaseFilter], mParameters);
		var done1 = assert.async();
		var fnDataReceivedCheck = function () {
			oTreeBinding.detachDataReceived(fnDataReceivedCheck);
			assert.strictEqual(false, oTreeBinding.bPendingRequest, "The request isn't pending");
			done1();
		};
		oTreeBinding.attachDataReceived(fnDataReceivedCheck);
		oTreeBinding.getContexts();
	});

	QUnit.test("Test setSelectedIndex", function(assert){
		var sPath = "/StructureDefinition";
		var mParameters = {rootSearch: 'base:exact', rootProperty: 'baseDefinition', rootValue: 'http://hl7.org/fhir/StructureDefinition/DomainResource', nodeProperty: 'url'};
		var oTreeBinding = this.oFhirModel.bindTree(sPath, undefined, undefined, mParameters);
		var done = assert.async();
		var fnDataReceivedCheck = function () {
			oTreeBinding.detachDataReceived(fnDataReceivedCheck);
			assert.strictEqual(false, oTreeBinding.isInitial(), "Treebinding is not longer in initial state.");
			// test here the setSelectedIndex method - go to opa tests and debug how nodes are generated at this point in time nodes are not there			
			done();
		};
		oTreeBinding.attachDataReceived(fnDataReceivedCheck);
		oTreeBinding.getContexts();
	});
});