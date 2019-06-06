sap.ui.define([
	"../utils/TestUtils",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/OperationMode"
], function (TestUtils, FHIRFilter, FHIRFilterOperator, OperationMode) {

	"use strict";

	function createModel(mParameters) {
		return TestUtils.createFHIRModel("https://example.com/fhir", mParameters);
	}

	function createEventCallbackObject(fnCallback, oData, oListener) {
		return { fFunction: fnCallback, oData: oData, oListener: oListener };
	}

	QUnit.module("Unit-Tests: FHIRTreeBinding", {
		before: function () {
			this.oFhirModel1 = createModel();
			var mParameters = { rootSearch: "base:exact", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
			this.oTreeBinding = this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters);
		}
	});

	QUnit.test("Attach/Detach Model Events", function (assert) {
		var fnDummyCallback = function () { var a = 1; return 1 + a; };
		var fnDummyCallback2 = function () { var b = 1; return 1 - b; };

		assert.deepEqual(this.oTreeBinding.mEventRegistry, {}, "There are no event callbacks defined.");

		// Attachment of event treeLoadingStarted
		this.oTreeBinding.attachTreeLoadingStarted(fnDummyCallback);
		assert.deepEqual(this.oTreeBinding.mEventRegistry.treeLoadingStarted, [createEventCallbackObject(fnDummyCallback)], "The event callback for event: 'treeLoadingStarted' is correctly defined.");
		this.oTreeBinding.attachTreeLoadingStarted(fnDummyCallback2);
		assert.deepEqual(this.oTreeBinding.mEventRegistry.treeLoadingStarted, [createEventCallbackObject(fnDummyCallback), createEventCallbackObject(fnDummyCallback2)], "The event callback for event: 'treeLoadingStarted' is correctly defined.");
		assert.strictEqual(this.oTreeBinding.mEventRegistry.treeLoadingStarted.length, 2, "The event callback for event: 'treeLoadingStarted' is correctly attached.");

		// Attachment of event treeLoadingCompleted
		this.oTreeBinding.attachTreeLoadingCompleted(fnDummyCallback);
		assert.deepEqual(this.oTreeBinding.mEventRegistry.treeLoadingCompleted, [createEventCallbackObject(fnDummyCallback)], "The event callback for event: 'treeLoadingCompleted' is correctly defined.");
		this.oTreeBinding.attachTreeLoadingCompleted(fnDummyCallback2);
		assert.deepEqual(this.oTreeBinding.mEventRegistry.treeLoadingCompleted, [createEventCallbackObject(fnDummyCallback), createEventCallbackObject(fnDummyCallback2)], "The event callback for event: 'treeLoadingCompleted' is correctly defined.");
		assert.strictEqual(this.oTreeBinding.mEventRegistry.treeLoadingCompleted.length, 2, "The event callback for event: 'treeLoadingCompleted' is correctly attached.");

		// Attachment of event selectionChanged
		this.oTreeBinding.attachSelectionChanged(fnDummyCallback);
		assert.deepEqual(this.oTreeBinding.mEventRegistry.selectionChanged, [createEventCallbackObject(fnDummyCallback)], "The event callback for event: 'selectionChanged' is correctly defined.");
		this.oTreeBinding.attachSelectionChanged(fnDummyCallback2);
		assert.deepEqual(this.oTreeBinding.mEventRegistry.selectionChanged, [createEventCallbackObject(fnDummyCallback), createEventCallbackObject(fnDummyCallback2)], "The event callback for event: 'selectionChanged' is correctly defined.");
		assert.strictEqual(this.oTreeBinding.mEventRegistry.selectionChanged.length, 2, "The event callback for event: 'selectionChanged' is correctly attached.");

		// Detachment of event treeLoadingStarted
		this.oTreeBinding.detachTreeLoadingStarted(fnDummyCallback);
		assert.strictEqual(this.oTreeBinding.mEventRegistry.treeLoadingStarted.length, 1, "The event callback for event: 'treeLoadingStarted' is correctly detached.");
		assert.deepEqual(this.oTreeBinding.mEventRegistry.treeLoadingStarted, [createEventCallbackObject(fnDummyCallback2)], "The event callback for event: 'treeLoadingStarted' is correctly defined.");
		this.oTreeBinding.detachTreeLoadingStarted(fnDummyCallback2);

		// Detachment of event treeLoadingCompleted
		this.oTreeBinding.detachTreeLoadingCompleted(fnDummyCallback);
		assert.strictEqual(this.oTreeBinding.mEventRegistry.treeLoadingCompleted.length, 1, "The event callback for event: 'treeLoadingCompleted' is correctly detached.");
		assert.deepEqual(this.oTreeBinding.mEventRegistry.treeLoadingCompleted, [createEventCallbackObject(fnDummyCallback2)], "The event callback for event: 'treeLoadingCompleted' is correctly defined.");
		this.oTreeBinding.detachTreeLoadingCompleted(fnDummyCallback2);

		// Detachment of event selectionChanged
		this.oTreeBinding.detachSelectionChanged(fnDummyCallback2);
		assert.strictEqual(this.oTreeBinding.mEventRegistry.selectionChanged.length, 1, "The event callback for event: 'selectionChanged' is correctly detached.");
		assert.deepEqual(this.oTreeBinding.mEventRegistry.selectionChanged, [createEventCallbackObject(fnDummyCallback)], "The event callback for event: 'selectionChanged' is correctly defined.");
		this.oTreeBinding.detachSelectionChanged(fnDummyCallback);

		assert.deepEqual(this.oTreeBinding.mEventRegistry, {}, "There are no event callbacks defined.");
	});

	QUnit.test("Client/Server mode check", function (assert) {
		assert.strictEqual(this.oTreeBinding._isClientMode(), false);
		assert.strictEqual(this.oTreeBinding._isServerMode(), true);
	});

	QUnit.test("Set context of the treebinding", function (assert) {
		this.oTreeBinding.setCollapseRecursive(true);
		assert.strictEqual(this.oTreeBinding.getCollapseRecursive(), true);
		this.oTreeBinding.setCollapseRecursive(false);
		assert.strictEqual(this.oTreeBinding.getCollapseRecursive(), false);
	});

	QUnit.test("filter test with multiple group filters", function (assert) {
		var oNameFilter = new FHIRFilter({ path: "name", operator: FHIRFilterOperator.EQ, value1: ["Cancer", "Ruediger"] });
		var aFilters = [oNameFilter];
		this.oTreeBinding.filter(aFilters);
		var mParameters2 = this.oTreeBinding._buildParameters();
		assert.deepEqual(mParameters2.urlParameters["name:exact"], ["Cancer", "Ruediger"], "The query parameter object is the same");
	});

	QUnit.test("Should throw an error because creating a new FHIRTreeBinding without OperationMode.Server or undefined is not allowed", function (assert) {
		var mParameters = { operationMode: OperationMode.Client, rootSearch: "base:exact", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported OperationMode: Client. Only sap.fhir.model.r4.OperationMode.Server is supported."));

		mParameters = { operationMode: "Random", rootSearch: "base:exact", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported OperationMode: Random. Only sap.fhir.model.r4.OperationMode.Server is supported."));
	});

	QUnit.test("Should throw errors because creating a new FHIRTreeBinding without tree specific properties is not allowed", function (assert) {
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, undefined); }, new Error("Missing parameters: rootSearch, rootProperty, rootValue and nodeProperty have to be set in parameters."));
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, null); }, new Error("Missing parameters: rootSearch, rootProperty, rootValue and nodeProperty have to be set in parameters."));
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, {}); }, new Error("Missing parameters: rootSearch, rootProperty, rootValue and nodeProperty have to be set in parameters."));
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, 0); }, new Error("Missing parameters: rootSearch, rootProperty, rootValue and nodeProperty have to be set in parameters."));
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, 1); }, new Error("Missing parameters: rootSearch, rootProperty, rootValue and nodeProperty have to be set in parameters."));

		var mParameters = { rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Missing parameter: 'rootSearch'."));

		mParameters = { rootSearch: 0, rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported parameter type: 'rootSearch'. Parameter has to be of type string."));

		mParameters = { rootSearch: undefined, rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported parameter type: 'rootSearch'. Parameter has to be of type string."));

		mParameters = { rootSearch: null, rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported parameter type: 'rootSearch'. Parameter has to be of type string."));

		mParameters = { rootSearch: {}, rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported parameter type: 'rootSearch'. Parameter has to be of type string."));

		mParameters = { rootSearch: 1, rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported parameter type: 'rootSearch'. Parameter has to be of type string."));

		mParameters = { rootSearch: [], rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Unsupported parameter type: 'rootSearch'. Parameter has to be of type string."));

		mParameters = { rootSearch: "base:exact", rootProperty: "baseDefinition", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Missing parameter: 'rootValue'."));

		mParameters = { rootSearch: "base:exact", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", nodeProperty: "url" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Missing parameter: 'rootProperty'."));

		mParameters = { rootSearch: "base:exact", rootValue: "http://hl7.org/fhir/StructureDefinition/DomainResource", rootProperty: "baseDefinition" };
		assert.throws(function () { return this.oFhirModel1.bindTree("/StructureDefinition", undefined, undefined, mParameters); }, new Error("Missing parameter: 'nodeProperty'."));
	});

});