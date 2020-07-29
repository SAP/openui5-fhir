sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"../utils/TestUtils",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterType",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilterProcessor",
	"sap/fhir/model/r4/OperationMode",
	"sap/fhir/model/r4/lib/RequestHandle",
	"sap/fhir/model/r4/lib/Sliceable",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/fhir/model/r4/SubmitMode",
	"sap/fhir/model/r4/lib/FHIRBundleType",
	"sap/fhir/model/r4/lib/FHIRBundleRequest",
	"sap/base/util/deepEqual"
], function(jQuery, TestUtils, FHIRFilter, FHIRFilterType, FHIRFilterOperator, FHIRFilterProcessor, OperationMode, RequestHandle, Sliceable, FilterOperator, Filter, SubmitMode, FHIRBundleType, FHIRBundleRequest, deepEqual) {

	"use strict";

	function createModel(mParameters) {
		return TestUtils.createFHIRModel("https://example.com/fhir", mParameters);
	}

	var sChangingTextAfterUpdate = "initial";

	QUnit.module("Unit-Tests: FHIRModel", {

		/**
		 * Runs before the first test
		 */
		before: function() {
			var mParameters = {
				"groupProperties": {
					"patientDetails": {
						"submit": "Transaction"
					},
					"patientDetails2": {
						"submit": "Transaction"
					},
					"patientDetails3": {
						"submit": "Transaction"
					},
					"patientDetails4": {
						"submit": "Transaction"
					},
					"patients": {
						"submit": "Direct"
					},
					"valueSets" : {
						"submit" : "Batch"
					}
				},
				"defaultQueryParameters": { "_total": "accurate" }
			};

			this.oRequestHandle = TestUtils.createRequestHandle();
			this.oFhirModel1 = createModel(mParameters);
			this.oFhirModel2 = createModel({ "x-csrf-token": true, "defaultQueryParameters": { "_total": "accurate" } });
			this.oFhirModel3 = createModel(mParameters);
			this.loadDataIntoModel = function(sFilePath, sResourcePath, mParams, sMethod) {
				var mResponseHeaders = {"etag" : "W/\"1\""};
				var oJSONData = TestUtils.loadJSONFile(sFilePath);
				this.oRequestHandle.setUrl("https://example.com/fhir/" + sResourcePath);
				this.oRequestHandle.setRequest(TestUtils.createAjaxCallMock(mResponseHeaders));
				this.oFhirModel1._onSuccessfulRequest(this.oRequestHandle, oJSONData, undefined, undefined, undefined, sMethod, mParams);
				return TestUtils.deepClone(oJSONData);
			};
			this.dummyStrucDef = { url : "http://hl7.org/fhir/StructureDefinition/Patient"};
			this.sPatientId = "27f89dba-b3ee-465d-aec4-b732da01ead5";
			this.sPatientPath = "/Patient/" + this.sPatientId;
			this.sPatientId2 = "127e23a0-6db1-4ced-b433-98c7a70646b8";
			this.sPatientPath2 = "/Patient/" + this.sPatientId2;
			this.oContextBinding = this.oFhirModel1.bindContext(this.sPatientPath);
			this.oContextBinding2 = this.oFhirModel1.bindContext(this.sPatientPath2, undefined, {"groupId" : "patientDetails"});
			this.oContextBinding3 = this.oFhirModel1.bindContext("/Patient/1234");
			this.oFhirModel1.aBindings.push(this.oContextBinding);
			this.oDefaultError = new Error();
			this.oListBinding = this.oFhirModel1.bindList("/Patient");
			this.oListBinding2 = this.oFhirModel1.bindList("/DiagnosticReport");
			this.oListBinding3 = this.oFhirModel1.bindList("contact", this.oContextBinding.getBoundContext());
			this.oListBinding4 = this.oFhirModel1.bindList("/ValueSet", undefined, undefined,undefined, {"groupId" : "valueSets", request: {"url" : "http://hl7.org/fhir/ValueSet/v3-hl7Realm"}});
			this.oListBinding5 = this.oFhirModel1.bindList("/ValueSet", undefined, undefined,undefined, {"groupId" : "valueSets", request: {"url" : "http://pm2cloud_scala/ValueSet/nationality"}});
			this.oListBinding6 = this.oFhirModel1.bindList("/Practitioner", undefined, undefined,undefined, {request: {"_revinclude" : "PractitionerRole:practitioner"}});
			this.oListBinding7 = this.oFhirModel1.bindList("/PractitionerRole", undefined, undefined, [
				new FHIRFilter({
					path : "organization",
					operator : FHIRFilterOperator.Contains,
					value1: "252"
				})
			], {request: {"_include" : ["PractitionerRole:practitioner", "PractitionerRole:organization"], "_has:PractitionerRole:practitioner:organization": "252"} });
			this.oListBinding8 = this.oFhirModel1.bindList("/Patient", undefined, undefined,undefined, {"groupId" : "valueSets", request: {"url" : "http://hl7.org/fhir/ValueSet/v3-hl7Realm"}});
			this.oListBinding9 = this.oFhirModel1.bindList("/DummyResource", undefined, undefined,undefined, {"groupId" : "valueSets" });
			this.oFhirModel1.aBindings.push(this.oListBinding);
			this.oFhirModel1.aBindings.push(this.oListBinding2);
			this.oFhirModel1.aBindings.push(this.oListBinding3);
			this.oFhirModel1.aBindings.push(this.oListBinding4);
			this.oFhirModel1.aBindings.push(this.oListBinding5);
			this.oPropertyBinding = this.oFhirModel1.bindProperty("birthDate",this.oContextBinding.getBoundContext());
			this.oPropertyBinding2 = this.oFhirModel1.bindProperty("gender", this.oContextBinding.getBoundContext());
			this.oPropertyBinding3 = this.oFhirModel1.bindProperty("birthDate", this.oContextBinding2.getBoundContext());
			this.oPropertyBinding4 = this.oFhirModel1.bindProperty("gender", this.oContextBinding2.getBoundContext());
			this.oFhirModel1.aBindings.push(this.oPropertyBinding);
			this.oFhirModel1.aBindings.push(this.oPropertyBinding2);
			this.oFhirModel1.aBindings.push(this.oPropertyBinding3);
			this.oFhirModel1.aBindings.push(this.oPropertyBinding4);
			this.oFhirModel1.attachAfterUpdate(function(){
				sChangingTextAfterUpdate = "updated";
			});
		},

		/**
		 * Runs before each test
		 */
		beforeEach: function() {
			this.oFhirModel1.refresh();
			this.oFhirModel2.refresh();
			this.oFhirModel3.refresh();
			this.oFhirModel1.oData.StructureDefinition = { dummy : this.dummyStrucDef };
			this.oFhirModel1.oDataServerState.StructureDefinition = { dummy : this.dummyStrucDef };
		}
	});

	QUnit.test("Should throw an error by creating a model, if no service url is given", function(assert) {
		assert.throws(function() {return TestUtils.createFHIRModel();}, new Error("Missing service root URL"), "Error with message 'Missing service root URL' is thrown");
	});

	QUnit.test("initialize model with complex filtering", function(assert) {
		assert.throws(function() {
			createModel({simpleFiltering : false});
		}, new Error("Complex filtering not supported"));
	});

	QUnit.test("filter test with multiple group filters", function(assert) {
		var oNameFilter =  new sap.ui.model.Filter({path: "name", operator: FilterOperator.EQ, value1: ["Cancer", "Ruediger"]});
		var aFilters = [oNameFilter];
		this.oListBinding.filter(aFilters);
		var mParameters = this.oListBinding._buildParameters();
		var oRequestHandle = this.oFhirModel3.loadData("/Patient", mParameters);
		assert.deepEqual(mParameters.urlParameters["name:exact"], ["Cancer", "Ruediger"], "The query parameter object is the same");
		assert.strictEqual(oRequestHandle.getUrl().indexOf("name:exact=Ruediger") > -1, true, "The parameter was defined");
		assert.strictEqual(oRequestHandle.getUrl().indexOf("name:exact=Cancer") > -1, true, "The parameter was defined");
		var oNameFilter1 =  new sap.ui.model.Filter({path: "name", operator: FilterOperator.EQ, value1: "Habibi"});
		var oNameFilter2 =  new sap.ui.model.Filter({path: "name", operator: FilterOperator.EQ, value1: "Knopf"});
		var oCombinedFilter = new sap.ui.model.Filter({filters : [oNameFilter1, oNameFilter2], and : false});
		aFilters = [oCombinedFilter];
		this.oListBinding.filter(aFilters);
		mParameters = this.oListBinding._buildParameters();
		assert.deepEqual(mParameters.urlParameters["name:exact"], ["Habibi", "Knopf"], "The query parameter object is the same");
		var oNameFilter3 =  new sap.ui.model.Filter({path: "name", operator: FilterOperator.Contains, value1: "Jimmy"});
		var oCombinedFilter1 = new sap.ui.model.Filter({filters : [oCombinedFilter, oNameFilter3], and : true});
		aFilters = [oCombinedFilter1];
		this.oListBinding.filter(aFilters);
		mParameters = this.oListBinding._buildParameters();
		assert.deepEqual(mParameters.urlParameters["name:exact"], ["Habibi", "Knopf"], "The query parameter object is the same");
		assert.deepEqual(mParameters.urlParameters["name:contains"], "Jimmy", "The query parameter object is the same");
		var oCombinedFilter2 = new sap.ui.model.Filter({filters : [oNameFilter1, oNameFilter2], and : false});
		oCombinedFilter1 = new sap.ui.model.Filter({filters : [oCombinedFilter2, oNameFilter3], and : false});
		oCombinedFilter = new sap.ui.model.Filter({filters : [oCombinedFilter1, oNameFilter3], and : true});
		aFilters = [oCombinedFilter];
		this.oListBinding.filter(aFilters);
		assert.throws(function() {
			this.oListBinding._buildParameters();
		}.bind(this), new Error("A depth of 3 is not supported for simple filtering, please reduce it to a maximum of 2"));
	});

	QUnit.test("check that format request parameter", function(assert) {
		assert.strictEqual(this.oFhirModel1.oRequestor._buildQueryParameters(), "");
		assert.strictEqual(this.oFhirModel1.oRequestor._buildQueryParameters({ _format: "xml" }, this.oFhirModel1.getBindingInfo("/Patient")), "?_format=json&_total=accurate");
		assert.strictEqual(this.oFhirModel1.oRequestor._buildQueryParameters({ _format: "xml" }, this.oFhirModel1.getBindingInfo("/Patient/123")), "?_format=json");
		assert.strictEqual(this.oFhirModel1.oRequestor._buildQueryParameters({ _format: "application/json" }, this.oFhirModel1.getBindingInfo("/Patient/123")), "?_format=application/json");
		assert.strictEqual(this.oFhirModel1.oRequestor._buildQueryParameters({ _format: "application/fhir+json" }, this.oFhirModel1.getBindingInfo("/Patient/123")), "?_format=application/fhir%2Bjson");
		assert.strictEqual(this.oFhirModel1.oRequestor._buildQueryParameters({ _format: "json" }, this.oFhirModel1.getBindingInfo("/Patient/123")), "?_format=json");
	});

	QUnit.test("check listbinding getcontexts in relative case for different depths of paths when resource gets newly created", function(assert) {
		var sPatientPath = "/Patient/" + this.oFhirModel1.create("Patient", {});
		var oContextBinding = this.oFhirModel1.bindContext(sPatientPath);
		var oContextBinding2 = this.oFhirModel1.bindContext(sPatientPath + "/name/0");
		var oListBinding = this.oFhirModel1.bindList("contact", oContextBinding.getBoundContext());
		var oListBinding2 = this.oFhirModel1.bindList("given", oContextBinding2.getBoundContext());
		oListBinding.iTotalLength = 0;
		oListBinding.iLastLength = 2;
		oListBinding2.iTotalLength = 0;
		oListBinding2.iLastLength = 2;
		this.oFhirModel1.aBindings.push(oListBinding);
		this.oFhirModel1.aBindings.push(oListBinding2);
		this.oFhirModel1.setProperty(sPatientPath + "/contact", [{}]);
		this.oFhirModel1.setProperty(sPatientPath + "/name/0/given", ["Hans", "Peter"]);
		var aContexts = oListBinding.getContexts();
		var aContexts2 = oListBinding2.getContexts();
		assert.strictEqual(oListBinding.getLength(), 1, "The total length matches");
		assert.strictEqual(aContexts.length, 1, "The total length matches");
		assert.strictEqual(oListBinding2.getLength(), 2, "The total length matches");
		assert.strictEqual(aContexts2.length, 2, "The total length matches");
	});

	QUnit.test("check listbinding getcontexts in relative case for newly created resource with aggregation changes", function(assert) {
		var sPatientPath = "/Patient/" + this.oFhirModel1.create("Patient", {});
		var oContextBinding = this.oFhirModel1.bindContext(sPatientPath);
		var oListBinding = this.oFhirModel1.bindList("contact", oContextBinding.getBoundContext());
		oListBinding.iTotalLength = 0;
		oListBinding.iLastLength = 2;
		this.oFhirModel1.aBindings.push(oListBinding);
		var aContacts = [{}, {}];
		this.oFhirModel1.setProperty(sPatientPath + "/contact", aContacts);
		var aContexts = oListBinding.getContexts();
		assert.strictEqual(oListBinding.getLength(), 2, "The total length matches");
		assert.strictEqual(aContexts.length, 2, "The total length matches");
		aContacts.pop();
		this.oFhirModel1.setProperty(sPatientPath + "/contact", aContacts);
		aContexts = oListBinding.getContexts();
		assert.strictEqual(oListBinding.getLength(), 1, "The total length matches");
		assert.strictEqual(aContexts.length, 1, "The total length matches");
	});

	QUnit.test("check listbinding getcontexts in relative case when context is set but no data is in the model", function(assert) {
		var aContexts = this.oListBinding3.getContexts();
		assert.deepEqual(aContexts, [], "The contexts matches");
		assert.strictEqual(this.oListBinding3.getLength(), 0, "The total length matches");
	});

	QUnit.test("initializing contextbinding with upper context", function(assert) {
		var oContextBinding = this.oFhirModel1.bindContext("contact", this.oContextBinding.getBoundContext());
		assert.strictEqual(oContextBinding.getContext().getPath(), this.sPatientPath, "The context path matches");
	});

	QUnit.test("destroy the model", function(assert) {
		var oRequestHandle = this.oFhirModel2.loadData(this.sPatientPath);
		this.oFhirModel2.destroy();
		assert.strictEqual(true, oRequestHandle.getRequest().state() === "rejected", "The destroy was successful");
	});

	QUnit.test("loadData with unrequestable path", function(assert) {
		var oRequestHandle = this.oFhirModel2.loadData(this.sPatientPath + "/contact");
		assert.strictEqual(undefined, oRequestHandle, "The request couldn't be sent");
	});

	QUnit.test("FHIRBundleRequest getBundleRequestData all params check", function(assert) {
		var sIfModifiedSince = "Wed, 21 Oct 2015 07:28:00 GMT";
		var sIfNoneExist = "identifier=http://acme.org/mrns|12345";
		var sIfNoneMatch = "bfc13a64729c4290ef5b2c2730249c88ca92d82d";
		var sIfMatch = "1";
		var sUrl = "http://localhost:8080/fhir/R4";
		var sMethod = "PUT";
		var oFbr = new FHIRBundleRequest(undefined,sMethod , sUrl, undefined, undefined, sIfMatch, sIfNoneMatch, sIfNoneExist, sIfModifiedSince);
		var mBundleRequestData = oFbr.getBundleRequestData();
		assert.strictEqual(mBundleRequestData.method, sMethod, "The method matches");
		assert.strictEqual(mBundleRequestData.url, sUrl,"The url matches");
		assert.strictEqual(mBundleRequestData.ifMatch, sIfMatch, "The ifmatch matches");
		assert.strictEqual(mBundleRequestData.ifNoneMatch, sIfNoneMatch, "The ifnonematch matches");
		assert.strictEqual(mBundleRequestData.ifNoneExist, sIfNoneExist, "The ifnoneexist matches");
		assert.strictEqual(mBundleRequestData.ifModifiedSince, sIfModifiedSince, "The ifmodifiedsince matches");
	});

	QUnit.test("error checks when the request method with no path is called and empty query params check", function(assert) {
		assert.strictEqual(this.oFhirModel1.oRequestor._request(), undefined);
		var sParamString = this.oFhirModel1.oRequestor._buildQueryParameters({ param : ""});
		assert.strictEqual(sParamString, "", "The param string is empty");
		var jqXHR = jQuery.ajax();
		var oRequestHandle = new RequestHandle();
		oRequestHandle.setRequest(jqXHR);
		var done = assert.async();
		this.oFhirModel1.oRequestor.sToken = "abc";
		jqXHR.done(function(oRequestHandle, oData, sStatusText, oJqXHR){
			this.oFhirModel1.oRequestor._callBackForXcsrfToken(function(oReq, data){
				assert.deepEqual(data, {}, "The same object");
				assert.deepEqual(oReq, oRequestHandle, "The same object");
				assert.strictEqual(this.oFhirModel1.oRequestor.sToken, undefined, "the token was set");
				done();
			}.bind(this), oRequestHandle, {}, "", oJqXHR);
		}.bind(this,oRequestHandle));
	});

	QUnit.test("error checks when server response is wrong", function(assert) {
		var oEntry = {};
		assert.throws(function() {
			this.oFhirModel1._mapBundleEntriesToResourceMap([oEntry]);
		}.bind(this), new Error("No resource could be found for bundle entry: " + oEntry));
		assert.throws(function() {
			this.oFhirModel1._mapBundleEntriesToResourceMap([undefined]);
		}.bind(this), new Error("No response from the FHIR Service available"));
		assert.throws(function() {
			this.oFhirModel1._mapResourceToResourceMap(undefined);
		}.bind(this), new Error("No data could be found which should be mapped as updated resource"));
		this.oFhirModel1._buildGroupProperties();
		var oRequestHandle = this.oFhirModel1.sendGetRequest("dummy");
		oRequestHandle.getRequest().abort();
		this.oFhirModel1._processError(oRequestHandle);
	});

	QUnit.test("Direct minimal response process when server didn't changed the id and client posted new data", function(assert) {
		var oPatient = TestUtils.loadJSONFile("Patient");
		var oPatient2 = TestUtils.loadJSONFile("Patient2");
		this.oFhirModel1.oData.Patient = {};
		this.oFhirModel1.oData.Patient[this.sPatientId] = oPatient;
		this.oFhirModel1.oData.Patient[this.sPatientId2] = oPatient2;
		var oRequestHandle = this.oFhirModel1.loadData(this.sPatientPath);
		oRequestHandle.setData(JSON.stringify(oPatient));
		oRequestHandle.setUrl(oRequestHandle.getUrl().substring(0, oRequestHandle.getUrl().indexOf("?"))  + "/_history/3");
		oRequestHandle.setRequest(TestUtils.createAjaxCallMock({ location: oRequestHandle.getUrl()}));
		var oRequestHandle2 = this.oFhirModel1.loadData(this.sPatientPath2);
		oRequestHandle2.setData(JSON.stringify(oPatient2));
		oRequestHandle2.setUrl(oRequestHandle2.getUrl().substring(0, oRequestHandle2.getUrl().indexOf("?")) + "/_history/1");
		oRequestHandle2.setRequest(TestUtils.createAjaxCallMock({ location: oRequestHandle2.getUrl()}));
		this.oFhirModel1._onSuccessfulRequest(oRequestHandle,"", undefined, undefined, undefined, "POST");
		this.oFhirModel1._onSuccessfulRequest(oRequestHandle2, "", undefined, undefined, undefined, "PUT");
		assert.strictEqual(this.oFhirModel1.oData.Patient.hasOwnProperty(this.sPatientId), true, "There was no change in the id");
		assert.strictEqual(this.oFhirModel1.oData.Patient[this.sPatientId].meta.versionId, "3", "The version id was successfully written");
		assert.strictEqual(this.oFhirModel1.oData.Patient[this.sPatientId2].meta.versionId, "1", "The version id was successfully written");
	});

	QUnit.test("no real changes, so submit changes returns undefined", function(assert) {
		this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		this.oFhirModel1.setProperty(this.sPatientPath + "/birthDate", "2008-04-27");
		assert.strictEqual(this.oFhirModel1.submitChanges(), undefined, "submit changes returns undefined because of no changes");
	});

	QUnit.test("get group submit mode", function(assert) {
		var sSubmitMode = this.oFhirModel1.getGroupSubmitMode();
		assert.strictEqual(sSubmitMode, "Direct", "The default submit mode is defined");
		sSubmitMode = this.oFhirModel1.getGroupSubmitMode("patientDetails");
		assert.strictEqual(sSubmitMode, "Transaction", "The default submit mode is defined");
	});

	QUnit.test("Removing Resources from FHIR Model", function(assert) {
		var mChangedResources = JSON.parse("{\"Patient\":{\"123\":{\"url\":\"/Patient/123\",\"method\":\"DELETE\"},\"abc\":{\"url\":\"/Patient/abc\",\"method\":\"DELETE\"}}}");
		this.oFhirModel1.remove(["/Patient/123", "/Patient/abc"]);
		assert.deepEqual(mChangedResources, this.oFhirModel1.mChangedResources, "The changed resources are equal");
	});

	QUnit.test("Call next link, which has no query params, and check that it is directly call", function(assert) {
		this.oListBinding9.sNextLink = "https://example.com/fhir/abc?_getpages=1263645";
		this.oListBinding9.iLastLength = 10;
		this.oListBinding9.getContexts(0,20);
		var bFound = false;
		this.oFhirModel1.oRequestor._aPendingRequestHandles.forEach(function(oEntry, i) {
			if (oEntry.getUrl().endsWith("abc?_getpages=1263645")){
				bFound = true;
			}
		});
		assert.strictEqual(bFound, true, "The request of the listbinding with next link without params was found");
	});

	QUnit.test("Context binding after _loadcontext change event has to be fired", function(assert) {
		var done = assert.async();
		var fnChangeEvent = function(oEvent){
			var oBinding = oEvent.getSource();
			assert.strictEqual(oBinding.bInitial, false, "Change event got triggered after request");
			oBinding.detachChange(fnChangeEvent);
			done();
		};
		this.oContextBinding.attachChange(fnChangeEvent);
		this.oContextBinding.getBoundContext()._loadContext();
	});

	QUnit.test("Set/Get invalid property path", function(assert) {
		assert.throws(function() {
			this.oFhirModel1.setProperty("/foo//test", "test");
		}.bind(this), new Error("Invalid property binding path"));
		assert.throws(function() {
			this.oFhirModel1.getProperty("/foo//test");
		}.bind(this), new Error("Invalid property binding path"));
	});

	QUnit.test("Should throw an error by calling getcontext method of FHIRModel", function(assert) {
		assert.throws(function() {
			this.oFhirModel1.getContext("/Patient/123");
		}.bind(this), new Error("Unsupported operation: sap.fhir.model.r4.FHIRModel#getContext"));
	});

	QUnit.test("Set/get service url", function(assert) {
		var oTempModel = TestUtils.createFHIRModel("/fhir/");
		assert.strictEqual(oTempModel.getServiceUrl(), "/fhir");
		oTempModel = TestUtils.createFHIRModel("/fhir");
		assert.strictEqual(oTempModel.getServiceUrl(), "/fhir");
		oTempModel = TestUtils.createFHIRModel("http://example.com/fhir/");
		assert.strictEqual(oTempModel.getServiceUrl(), "http://example.com/fhir");
		oTempModel = TestUtils.createFHIRModel("http://example.com/fhir");
		assert.strictEqual(oTempModel.getServiceUrl(), "http://example.com/fhir");
	});

	QUnit.test("Should return default base profil url", function(assert) {
		assert.strictEqual(this.oFhirModel1.getBaseProfileUrl(), "http://hl7.org/fhir/StructureDefinition/");
	});

	QUnit.test("Should return http://abc/ as base profil url", function(assert) {
		var oFhirModel = createModel({
			baseProfileUrl: "http://abc/"
		});
		assert.strictEqual(oFhirModel.getBaseProfileUrl(), "http://abc/");
	});

	QUnit.test("Should throw an error because creating a new FHIRListBinding without OperationMode.Server or undefined is not allowed", function(assert){
		var mParameters = {operationMode: OperationMode.Client};
		assert.throws(function() {return this.oFhirModel1.bindList("/Patient", undefined, undefined, undefined, mParameters);}, new Error("Unsupported OperationMode: Client. Only sap.fhir.model.r4.OperationMode.Server is supported."));

		mParameters = {operationMode: "Random"};
		assert.throws(function() {return this.oFhirModel1.bindList("/Patient", undefined, undefined, undefined, mParameters);}, new Error("Unsupported OperationMode: Random. Only sap.fhir.model.r4.OperationMode.Server is supported."));

		mParameters = {operationMode: OperationMode.Server};
		var oListBinding = this.oFhirModel1.bindList("/Patient", undefined, undefined, undefined, mParameters);
		assert.strictEqual(oListBinding._isClientMode(), false);
		assert.strictEqual(oListBinding._isServerMode(), true);

		oListBinding = this.oFhirModel1.bindList("/Patient", undefined, undefined, undefined, undefined);
		assert.strictEqual(oListBinding._isClientMode(), false);
		assert.strictEqual(oListBinding._isServerMode(), true);
	});

	QUnit.test("Map Single Resource to Model", function(assert) {
		var oJSON = this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		assert.equal(sChangingTextAfterUpdate,"updated");
		assert.strictEqual(JSON.stringify(this.oFhirModel1.oData.Patient[this.sPatientId]), JSON.stringify(oJSON));
		this.oListBinding3.StructureDefinition = this.dummyStructDefPatient;
		assert.equal(5,this.oListBinding3.getContexts().length);
		this.oListBinding3.StructureDefinition = undefined;
	});

	QUnit.test("Map Updated Patients in Bundle to Model", function(assert) {
		this.loadDataIntoModel("TwoUpdatedPatients");
		var oJSONData = TestUtils.loadJSONFile("ResponseOfMultiplePutInBundle");
		assert.equal("7",this.oFhirModel1.oData.Patient["253"].meta.versionId);
		assert.equal("3",this.oFhirModel1.oData.Patient["254"].meta.versionId);
		this.oRequestHandle.setUrl("https://example.com/fhir/");
		this.oFhirModel1._onSuccessfulRequest(this.oRequestHandle, oJSONData);
		assert.equal("8",this.oFhirModel1.oData.Patient["253"].meta.versionId);
		assert.equal("4",this.oFhirModel1.oData.Patient["254"].meta.versionId);
	});

	QUnit.test("Map Bundle to Model", function(assert) {
		var oJSON = this.loadDataIntoModel("DiagnosticReportBundle", "");
		assert.strictEqual(JSON.stringify(this.oFhirModel1.oData.DiagnosticReport["37eceb82-9ec9-4452-a203-10ed4d8ef639"]), JSON.stringify(
			oJSON.entry[0].resource));
		assert.strictEqual(JSON.stringify(this.oFhirModel1.oData.DiagnosticReport["5b37f536-3b28-41c3-b657-1a824bc01440"]), JSON.stringify(
			oJSON.entry[1].resource));
		assert.strictEqual(JSON.stringify(this.oFhirModel1.oData.DiagnosticReport["e78adbfe-fa87-4d99-b427-98b191d2780b"]), JSON.stringify(
			oJSON.entry[2].resource));
	});

	QUnit.test("Map ValueSet to Model", function(assert) {
		var oJSON = this.loadDataIntoModel("ValueSet");
		assert.strictEqual(JSON.stringify(this.oFhirModel1.oData.ValueSet["§urn:uuid:fbfdffb2-c750-472b-ac85-e047563c4216§"]), JSON.stringify(oJSON.expansion.contains));
	});

	QUnit.test("loadData without parameters", function(assert) {
		var oRequestHandle = this.oFhirModel1.loadData("/Patient");
		assert.equal(oRequestHandle.getUrl(), "https://example.com/fhir/Patient?_total=accurate&_format=json");

		var oRequestHandle1 = this.oFhirModel1.loadData("/Patient/123");
		assert.equal(oRequestHandle1.getUrl(), "https://example.com/fhir/Patient/123?_format=json");
	});

	QUnit.test("loadData with csrf token", function(assert) {
		this.oFhirModel2.oRequestor.sToken = "123";
		var oRequestHandle = this.oFhirModel2.loadData("/Patient");
		assert.equal(oRequestHandle.getUrl(), "https://example.com/fhir/Patient?_total=accurate&_format=json");
		this.oFhirModel2.oRequestor.sToken = undefined;
	});

	QUnit.test("loadData with parameters", function(assert) {
		var oParameter = {
			urlParameters : {url: "http://pm2cloud_scala/ValueSet/nationality",
				_format: "json",
				_include: undefined,
				_pretty: true,
				_sort: undefined,
				_language : ["FR","EN"]}
		};
		var oRequestHandle = this.oFhirModel1.loadData("/ValueSet/$expand", oParameter);
		assert.equal(oRequestHandle.getUrl(),
			"https://example.com/fhir/ValueSet/$expand?url=http://pm2cloud_scala/ValueSet/nationality&_format=json&_pretty=true&_language=FR&_language=EN");
	});

	QUnit.test("submit data post directly", function(assert) {
		var oPatient2 = TestUtils.loadJSONFile("Patient2");
		var oEncounter = TestUtils.loadJSONFile("Encounter");
		this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		this.oFhirModel1.create("Patient", oPatient2);
		this.oFhirModel1.create("Encounter",oEncounter);
		assert.equal(this.oFhirModel1.hasResourceTypePendingChanges("Patient"),true);
		assert.equal(this.oFhirModel1.hasResourceTypePendingChanges("Encounter"),true);
		assert.equal(this.oFhirModel1.hasResourceTypePendingChanges("DiagnosticReport"),false);
		var mRequestHandles = this.oFhirModel1.submitChanges();
		assert.equal(mRequestHandles.direct[0].getUrl(),"https://example.com/fhir/Patient?_format=json");
		assert.equal(mRequestHandles.direct[0].getData(), JSON.stringify(oPatient2));
		assert.equal(mRequestHandles.direct[1].getUrl(),"https://example.com/fhir/Encounter?_format=json");
		assert.equal(mRequestHandles.direct[1].getData(), JSON.stringify(oEncounter));
	});

	QUnit.test("submit data put/post directly", function(assert) {
		this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		var oPatientUpdated = TestUtils.loadJSONFile("PatientUpdated");
		var oPatient2 = TestUtils.loadJSONFile("Patient2");
		this.oFhirModel1.create("Patient",oPatient2);
		var oPropertyBinding = this.oFhirModel1.bindProperty("", this.oContextBinding.getBoundContext());
		assert.equal(this.oFhirModel1.oData.Patient[this.sPatientId], oPropertyBinding.getValue());
		this.oFhirModel1.setProperty(this.sPatientPath + "/name/0/given/1", "Peterle"); // create new array index
		assert.equal(this.oFhirModel1.getProperty(this.sPatientPath + "/name/0/given/1"),"Peterle");
		this.oFhirModel1.setProperty("name/0/given/2", "Klausi", this.oContextBinding.getBoundContext()); // create new array index with context
		assert.equal(this.oFhirModel1.getProperty("name/0/given/2", this.oContextBinding.getBoundContext()),"Klausi");
		this.oFhirModel1.setProperty(this.sPatientPath + "/name/0/given/0", "newValue"); // update existing array index
		assert.equal(this.oFhirModel1.getProperty(this.sPatientPath + "/name/0/given/0"), "newValue");
		this.oFhirModel1.setProperty("contact/0/name/given/0", "newValue", this.oContextBinding.getBoundContext()); // update existing array index with context
		assert.equal(this.oFhirModel1.getProperty("contact/0/name/given/0", this.oContextBinding.getBoundContext()), "newValue");

		this.oFhirModel1.setProperty(this.sPatientPath + "/foo", "bar"); // create new property
		assert.equal(this.oFhirModel1.getProperty(this.sPatientPath + "/foo"), "bar");
		this.oFhirModel1.setProperty(this.sPatientPath + "/name/[use=nickname]/family", "Krafti"); // create sliced property
		assert.equal(this.oFhirModel1.getProperty(this.sPatientPath + "/name/[use=nickname]/family"), "Krafti");
		this.oFhirModel1.setProperty("bar", "foo", this.oContextBinding.getBoundContext()); // create new property with context
		assert.equal(this.oFhirModel1.getProperty("bar", this.oContextBinding.getBoundContext()), "foo");
		this.oFhirModel1.setProperty("name/[use=old]/family", "Kraftlos", this.oContextBinding.getBoundContext()); // create sliced property with context
		assert.equal(this.oFhirModel1.getProperty("name/[use=old]/family", this.oContextBinding.getBoundContext()), "Kraftlos");

		this.oFhirModel1.setProperty(this.sPatientPath + "/updateProperty", "newValue"); // update existing property
		assert.equal(this.oFhirModel1.getProperty(this.sPatientPath + "/updateProperty"), "newValue");
		this.oFhirModel1.setProperty(this.sPatientPath + "/name/[use=official]/family", "Kraft"); // update exisiting sliced property
		assert.equal(this.oFhirModel1.getProperty(this.sPatientPath + "/name/[use=official]/family"), "Kraft");
		this.oFhirModel1.setProperty("updateProperty", "newValue", this.oContextBinding.getBoundContext()); // update existing property with context
		assert.equal(this.oFhirModel1.getProperty("updateProperty",this.oContextBinding.getBoundContext()), "newValue");
		this.oFhirModel1.setProperty("contact/0/telecom/[use=mobile,system=phone]/value", "Kraft",this.oContextBinding.getBoundContext()); // update exisiting sliced property with context
		assert.equal(this.oFhirModel1.getProperty("contact/0/telecom/[use=mobile,system=phone]/value", this.oContextBinding.getBoundContext()), "Kraft");
		var mRequestHandles = this.oFhirModel1.submitChanges();
		assert.equal(mRequestHandles.direct[0].getUrl(),"https://example.com/fhir/Patient?_format=json");
		assert.equal(mRequestHandles.direct[0].getData(), JSON.stringify(oPatient2));
		assert.equal(mRequestHandles.direct[1].getUrl(),"https://example.com/fhir/Patient/27f89dba-b3ee-465d-aec4-b732da01ead5?_format=json");
		assert.equal(mRequestHandles.direct[1].getData(), JSON.stringify(oPatientUpdated));
		assert.strictEqual(mRequestHandles.direct[1].getHeaders()["If-Match"], "W/\"1\"", "If-Match Header for PUT request is of correct syntax");
	});

	QUnit.test("submit changes without any changes", function(assert){
		var mRequestHandles = this.oFhirModel1.submitChanges();
		assert.deepEqual(mRequestHandles, undefined);
	});


	QUnit.test("submit changes and abort request", function(assert){
		this.loadDataIntoModel("Patient2", this.sPatientPath2.substring(1));
		this.oPropertyBinding3.setValue("2008-04-27");

		var mRequestHandles = this.oFhirModel1.submitChanges();
		var oRequestHandlePatient = mRequestHandles.patientDetails;

		assert.equal(oRequestHandlePatient.getRequest().readyState, 1);

		oRequestHandlePatient.abort();
		assert.equal(oRequestHandlePatient.getRequest().readyState, 0);
	});


	QUnit.test("reset changed resource", function(assert) {
		var oPatient = this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		this.oFhirModel1.setProperty(this.sPatientPath + "/name/0/given/1", "Peterle");
		this.oFhirModel1.resetChanges();
		assert.deepEqual(this.oFhirModel1.oData.Patient[this.sPatientId], oPatient);
	});

	QUnit.test("reset created/changed resources", function(assert) {
		var oPatient = this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		var oPatient2 = TestUtils.loadJSONFile("Patient2");
		var sId = this.oFhirModel1.create("Patient", oPatient2);
		oPatient2.id = sId;
		assert.deepEqual(this.oFhirModel1.oData.Patient[oPatient2.id], oPatient2);
		this.oFhirModel1.setProperty(this.sPatientPath + "/name/0/given/1", "Peterle");
		this.oFhirModel1.resetChanges();
		assert.deepEqual(this.oFhirModel1.oData.Patient[this.sPatientId], oPatient);
		assert.deepEqual(this.oFhirModel1.oData.Patient[oPatient2.id], undefined);
	});

	QUnit.test("get/set value of propertybinding", function(assert) {
		this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		assert.equal("2008-04-27",this.oPropertyBinding._getValue());
		assert.equal("male",this.oPropertyBinding2._getValue());
		assert.equal("male", this.oFhirModel1.oData.Patient[this.sPatientId].gender);
		this.oPropertyBinding2.setValue("female");
		assert.equal("female",this.oPropertyBinding2._getValue());
		assert.equal("female", this.oFhirModel1.oData.Patient[this.sPatientId].gender);
		this.oPropertyBinding2.setValue(null);
		assert.equal(undefined, this.oPropertyBinding2._getValue());
		assert.equal(undefined, this.oFhirModel1.oData.Patient[this.sPatientId].gender);
	});

	QUnit.test("filtering a valueset", function(assert){
		var oFilter = new sap.ui.model.Filter({path: "display", operator: FHIRFilterOperator.Contains, value1: "ger"});
		this.oListBinding4.filter([oFilter]);
		var mGoal = {"filter" : "ger"};
		var mParameters = this.oListBinding4._buildParameters();
		assert.equal(mGoal.filter, mParameters.urlParameters.filter);
	});

	QUnit.test("filtering and sorting a list", function(assert){
		this.loadDataIntoModel("Patients");
		var oGenderFilter = new sap.ui.model.Filter({path: "gender", operator: FHIRFilterOperator.EQ, value1: "male"});
		var oGivenNameFilter =  new sap.ui.model.Filter({path: "given", operator: FHIRFilterOperator.Contains, value1: "Hor"});
		var oAddressFilter =  new sap.ui.model.Filter({path: "address", operator: FHIRFilterOperator.Missing, value1: "true"});
		var oGivenSwFilter =  new sap.ui.model.Filter({path: "given", operator: FHIRFilterOperator.StartsWith, value1: "Hor"});
		var oGtFilter =  new sap.ui.model.Filter({path: "num0", operator: FHIRFilterOperator.GT, value1: 20});
		var oLtFilter =  new sap.ui.model.Filter({path: "num1", operator: FHIRFilterOperator.LT, value1: 20});
		var oBtFilter =  new sap.ui.model.Filter({path: "birthdate", operator: FHIRFilterOperator.BT, value1: new Date("2014","2","2"), value2: new Date("2018","2","2")});
		var oGeFilter =  new sap.ui.model.Filter({path: "num2", operator: FHIRFilterOperator.GE, value1: 20});
		var oLeFilter =  new sap.ui.model.Filter({path: "num3", operator: FHIRFilterOperator.LE, value1: 20});
		var oSaFilter =  new sap.ui.model.Filter({path: "num4", operator: FHIRFilterOperator.SA, value1: 20});
		var oEbFilter =  new sap.ui.model.Filter({path: "num5", operator: FHIRFilterOperator.EB, value1: 20});
		var oApFilter =  new sap.ui.model.Filter({path: "num6", operator: FHIRFilterOperator.AP, value1: 20});
		var oNeFilter =  new sap.ui.model.Filter({path: "num7", operator: FHIRFilterOperator.NE, value1: 20});
		var oUndefFilter =  new sap.ui.model.Filter({path: "num8", operator: undefined, value1: 20});

		var oSort =  new sap.ui.model.Sorter("birthdate", true);
		var oSort1 =  new sap.ui.model.Sorter("gender", false);

		var aSorters = [oSort, oSort1];
		var aFilters = [
			oGenderFilter,
			oGivenNameFilter,
			oAddressFilter,
			oGivenSwFilter,
			oGtFilter,
			oLtFilter,
			oBtFilter,
			oGeFilter,
			oLeFilter,
			oSaFilter,
			oEbFilter,
			oApFilter,
			oNeFilter,
			oUndefFilter
		];
		this.oListBinding.sort(aSorters);
		this.oListBinding.filter(aFilters);

		assert.deepEqual(this.oListBinding.getFilters(), aFilters);
		assert.deepEqual(this.oListBinding.getSorters(), aSorters);

		var mParameters = this.oListBinding._buildParameters();
		var mGoalParameters = {"_sort": "-birthdate,gender", "gender:exact": "male", "given:contains":"Hor", "address:missing": "true", "given" : "Hor", "num0" : "gt20", "num1" : "lt20","num2" : "ge20","num3" : "le20","num4" : "sa20","num5" : "eb20","num6" : "ap20", "num7" : "ne20", "birthdate" : ["ge" + new Date("2014","2","2").toISOString(), "le" + new Date("2018","2","2").toISOString()], "num8" : "20"};
		assert.equal(mGoalParameters["gender:exact"], mParameters.urlParameters["gender:exact"]);
		assert.equal(mGoalParameters["given:contains"], mParameters.urlParameters["given:contains"]);
		assert.equal(mGoalParameters["address:missing"], mParameters.urlParameters["address:missing"]);
		assert.equal(mGoalParameters.given, mParameters.urlParameters.given);
		assert.equal(mGoalParameters.num0, mParameters.urlParameters.num0);
		assert.equal(mGoalParameters.num1, mParameters.urlParameters.num1);
		assert.equal(mGoalParameters.num2, mParameters.urlParameters.num2);
		assert.equal(mGoalParameters.num3, mParameters.urlParameters.num3);
		assert.equal(mGoalParameters.num4, mParameters.urlParameters.num4);
		assert.equal(mGoalParameters.num5, mParameters.urlParameters.num5);
		assert.equal(mGoalParameters.num6, mParameters.urlParameters.num6);
		assert.equal(mGoalParameters.num7, mParameters.urlParameters.num7);
		assert.equal(mGoalParameters.num8, mParameters.urlParameters.num8);
		assert.equal(mGoalParameters._sort, mParameters.urlParameters._sort);
		assert.deepEqual(mGoalParameters.birthdate, mParameters.urlParameters.birthdate);
	});

	QUnit.test("initial duplicate includes, has chaining and filter", function(assert){
		var mParameters = this.oListBinding7._buildParameters();
		var mGoalParameters = {"_include" : ["PractitionerRole:practitioner", "PractitionerRole:organization"], "_has:PractitionerRole:practitioner:organization" : "252", "organization:contains" : "252"};
		assert.deepEqual(mGoalParameters._include, mParameters.urlParameters._include);
		assert.equal(mGoalParameters._has, mParameters.urlParameters._has);
		assert.equal(mGoalParameters["organization:contains"], mParameters.urlParameters["organization:contains"]);
		var oListBinding = this.oFhirModel1.bindList("/Patient", undefined, undefined, [
			new FHIRFilter({
				path : "birthDate",
				operator : FHIRFilterOperator.EQ,
				valueType : FHIRFilterType.date,
				value1: "2014"
			}),
			new FHIRFilter({
				path : "foo",
				operator : FHIRFilterOperator.EQ,
				valueType : FHIRFilterType.number,
				value1: "2014"
			})
		]);
		mParameters = oListBinding._buildParameters();
		mGoalParameters = {"urlParameters":{"birthDate":"eq2014","foo":"eq2014","_count": undefined,"_sort": undefined}};
		assert.deepEqual(mGoalParameters, mParameters);
	});

	QUnit.test("initial revinclude", function(assert){
		var mParameters = this.oListBinding6._buildParameters();
		var mGoalParameters = {"_revinclude" : "PractitionerRole:practitioner"};
		assert.equal(mGoalParameters._revinclude, mParameters.urlParameters._revinclude);
	});

	QUnit.test("submit batch patient without groupid", function(assert){
		this.loadDataIntoModel("Patient2", this.sPatientPath2.substring(1));
		this.oPropertyBinding3.setValue("2008-04-27");
		this.oPropertyBinding4.setValue("female");
		var mRequestHandles = this.oFhirModel1.submitChanges(function(){}, function(){});
		assert.equal(mRequestHandles.patientDetails.getBundle().getBundleType(), "transaction");
		assert.ok(mRequestHandles.patientDetails.getBundle().getId() !== "", "generated uuid");
		assert.equal(this.oFhirModel1.oData.Patient[this.sPatientId2], mRequestHandles.patientDetails.getBundle().getBundlyEntry(0).getResource());
	});

	QUnit.test("submit changes without groupid but with changes in two different groups", function(assert){
		this.loadDataIntoModel("Patient2", this.sPatientPath2.substring(1));
		this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		var oContextBinding2 = this.oFhirModel1.bindContext(this.sPatientPath2, undefined, {"groupId" : "patientDetails4"});
		var oPropertyBinding2 = this.oFhirModel1.bindProperty("birthDate", oContextBinding2.getBoundContext());
		var oContextBinding = this.oFhirModel1.bindContext(this.sPatientPath, undefined, {"groupId" : "patientDetails3"});
		var oPropertyBinding = this.oFhirModel1.bindProperty("birthDate", oContextBinding.getBoundContext());
		this.oFhirModel1.aBindings.push(oContextBinding);
		this.oFhirModel1.aBindings.push(oPropertyBinding);
		this.oFhirModel1.aBindings.push(oContextBinding2);
		this.oFhirModel1.aBindings.push(oPropertyBinding2);
		oPropertyBinding2.setValue("2008-04-27");
		oPropertyBinding.setValue("2000-01-01");
		var mRequestHandles = this.oFhirModel1.submitChanges();
		var oRequestHandlePatient = mRequestHandles.patientDetails3;
		var oRequestHandlePatient2 = mRequestHandles.patientDetails4;

		assert.ok(Object.keys(mRequestHandles), 2);

		// check requesthandle for group id patientDetails
		assert.equal(oRequestHandlePatient.getUrl(), "https://example.com/fhir", "The request has the correct url");
		assert.strictEqual(oRequestHandlePatient.getBinding(), undefined, "The request was triggered by an API call not by a binding, so binding is correctly undefined");
		assert.ok(oRequestHandlePatient.getRequest(),"The xhr object is included in the requesthandle");
		assert.equal(oRequestHandlePatient.getBundle().getBundleEntries().length, 1, "Bundle contains one bundle entry");
		assert.equal(oRequestHandlePatient.getBundle().getBundleType(), "transaction", "Bundle has the correct bundle type");
		assert.equal(oRequestHandlePatient.getBundle().getGroupId(), "patientDetails3", "Bundle has the correct group id");

		// check requesthandle for group id patientDetails2
		assert.equal(oRequestHandlePatient2.getUrl(), "https://example.com/fhir", "The request has the correct url");
		assert.strictEqual(oRequestHandlePatient2.getBinding(), undefined, "The request was triggered by an API call not by a binding, so binding is correctly undefined");
		assert.ok(oRequestHandlePatient2.getRequest(),"The xhr object is included in the requesthandle");
		assert.equal(oRequestHandlePatient2.getBundle().getBundleEntries().length, 1, "Bundle contains one bundle entry");
		assert.equal(oRequestHandlePatient2.getBundle().getBundleType(), "transaction", "Bundle has the correct bundle type");
		assert.equal(oRequestHandlePatient2.getBundle().getGroupId(), "patientDetails4", "Bundle has the correct group id");
	});

	QUnit.test("submit batch patient with specific groupid", function(assert){
		this.loadDataIntoModel("Patient2", this.sPatientPath2.substring(1));
		this.loadDataIntoModel("Patient", this.sPatientPath.substring(1));
		this.oPropertyBinding.setValue("2000-01-01");
		this.oPropertyBinding2.setValue("female");
		this.oPropertyBinding3.setValue("2008-04-27");
		this.oPropertyBinding4.setValue("female");
		var mRequestHandles = this.oFhirModel1.submitChanges("patientDetails");
		assert.equal(this.oFhirModel1.oData.Patient[this.sPatientId2], mRequestHandles.patientDetails.getBundle().getBundlyEntry(1).getResource());
	});

	QUnit.test("submit batch value sets", function(assert){
		var oParameter = {
			urlParameters : {url: "http://pm2cloud_scala/ValueSet/nationality"},
			groupId : "valueSets",
			forceDirectCall : false,
			binding : this.oListBinding4
		};
		var oParameter2 = {
			urlParameters : {url: "http://hl7.org/fhir/ValueSet/v3-hl7Realm"},
			groupId : "valueSets",
			forceDirectCall : false,
			binding : this.oListBinding5
		};
		this.oListBinding4.bPendingRequest = true;
		this.oListBinding5.bPendingRequest = true;
		this.oFhirModel1.loadData("/ValueSet/$expand", oParameter);
		var oRequestHandle = this.oFhirModel1.loadData("/ValueSet/$expand", oParameter2);
		var oValueSetBatchRequest = TestUtils.loadJSONFile("ValueSetBatchRequest");
		assert.equal(JSON.stringify(JSON.parse(oRequestHandle.getData()).entry), JSON.stringify(oValueSetBatchRequest.entry));

	});

	QUnit.test("Generate valid slicable object", function(assert){
		// Example FHIR Address without whitespace
		var sAddressExpression = "[use=home,type=postal]";
		var aSliceablesB = Sliceable.getSliceables(sAddressExpression);
		var oSliceableB1 = aSliceablesB["use=home"];
		var oSliceableB2 = aSliceablesB["type=postal"];

		assert.strictEqual(oSliceableB1.oValue1, "home");
		assert.strictEqual(oSliceableB1.sOperator, "EQ");
		assert.strictEqual(oSliceableB2.oValue1, "postal");
		assert.strictEqual(oSliceableB1.sOperator, "EQ");

		// Example FHIR HumanName
		var sHumanNameExpression = "[use=maiden]";
		var oSliceableF = Sliceable.getSliceables(sHumanNameExpression)["use=maiden"];
		assert.strictEqual(oSliceableF.oValue1, "maiden");

		// Example FHIR StructureDefinition telecom
		var sStructureDefinitionTelecomExpression = "[id=StructureDefinition.telecom]";
		var oSliceableG = Sliceable.getSliceables(sStructureDefinitionTelecomExpression)["id=StructureDefinition.telecom"];
		assert.strictEqual(oSliceableG.oValue1, "StructureDefinition.telecom");

		// Example FHIR StructureDefinition differential
		var sStructureDefinitionDifferentialExpression = "[id=StructureDefinition.differential/element]";
		var oSliceableH = Sliceable.getSliceables(sStructureDefinitionDifferentialExpression)["id=StructureDefinition.differential/element"];
		assert.strictEqual(oSliceableH.oValue1, "StructureDefinition.differential/element");

		// Example FHIR ValueSet Url for selectedkey in extension
		var sValueSetExtensionExpression = "[url=http://hl7.org/fhir/StructureDefinition/patient-nationality]";
		var oSliceableI = Sliceable.getSliceables(sValueSetExtensionExpression)["url=http://hl7.org/fhir/StructureDefinition/patient-nationality"];
		assert.strictEqual(oSliceableI.oValue1, "http://hl7.org/fhir/StructureDefinition/patient-nationality");
	});

	QUnit.test("Should throw exception for empty slicable expression", function(assert){
		// empty expression
		assert.throws(function() {return Sliceable.getSliceables();}, new Error("Invalid Sliceable: Expression is empty."));
	});

	QUnit.test("Should throw exception for setting/getting properties with invalid sliceable objects", function(assert){
		var sSliceablePropertyPath = "[use:slicable]";
		var sPropertyPathInvalid;
		var sName = "Peter";
		var fRefreshPropertyPath = function(sSliceablePath){
			sPropertyPathInvalid = this.sPatientPath + "/name/" + sSliceablePath + "/family";
		}.bind(this);

		// setter
		fRefreshPropertyPath(sSliceablePropertyPath);
		assert.throws(function() {return this.oFhirModel1.setProperty(sPropertyPathInvalid, sName);}, new Error("Invalid Sliceable: \"" + sSliceablePropertyPath + "\". Key can't be determined."));

		sSliceablePropertyPath = " [ use =  home  , type =  postal  ] ";
		fRefreshPropertyPath(sSliceablePropertyPath);
		assert.throws(function() {return this.oFhirModel1.setProperty(sPropertyPathInvalid, sName);}, new Error("Invalid Sliceable: \"" + sSliceablePropertyPath + "\" doesn't start or end with a square bracket."));

		sSliceablePropertyPath = "[=maiden]";
		fRefreshPropertyPath(sSliceablePropertyPath);
		assert.throws(function() {return this.oFhirModel1.setProperty(sPropertyPathInvalid, sName);}, new Error("Invalid Sliceable: \"" + sSliceablePropertyPath + "\". Key can't be determined."));

		// getter
		sSliceablePropertyPath = "[use:slicable]";
		fRefreshPropertyPath(sSliceablePropertyPath);
		assert.throws(function() {return this.oFhirModel1.getProperty(sPropertyPathInvalid);}, new Error("Invalid Sliceable: \"" + sSliceablePropertyPath + "\". Key can't be determined."));

		sSliceablePropertyPath = " [ use =  home  , type =  postal  ] ";
		fRefreshPropertyPath(sSliceablePropertyPath);
		assert.throws(function() {return this.oFhirModel1.getProperty(sPropertyPathInvalid);}, new Error("Invalid Sliceable: \"" + sSliceablePropertyPath + "\" doesn't start or end with a square bracket."));

		sSliceablePropertyPath = "[=maiden]";
		fRefreshPropertyPath(sSliceablePropertyPath);
		assert.throws(function() {return this.oFhirModel1.getProperty(sPropertyPathInvalid);}, new Error("Invalid Sliceable: \"" + sSliceablePropertyPath + "\". Key can't be determined."));
	});

	QUnit.test("Should throw exception for invalid submitmode", function(assert){
		var sSubmitMode = SubmitMode.Direct;
		assert.throws(function() {return this.oFhirModel1.oRequestor._getBundleTypeBySubmitMode(sSubmitMode);}, new Error("Unsupported SubmitMode: " + sSubmitMode));

		sSubmitMode = "MyTestSubmitMode";
		assert.throws(function() {return this.oFhirModel1.oRequestor._getBundleTypeBySubmitMode(sSubmitMode);}, new Error("Unsupported SubmitMode: " + sSubmitMode));
	});

	QUnit.test("Should determine correct bundle type", function(assert){
		var sSubmitMode = SubmitMode.Batch;
		var sBundleType = FHIRBundleType.Batch;
		assert.strictEqual(this.oFhirModel1.oRequestor._getBundleTypeBySubmitMode(sSubmitMode), sBundleType);

		sSubmitMode = SubmitMode.Transaction;
		sBundleType = FHIRBundleType.Transaction;
		assert.strictEqual(this.oFhirModel1.oRequestor._getBundleTypeBySubmitMode(sSubmitMode), sBundleType);
	});

	QUnit.test("Should determine correct submit mode for group or throw exception", function(assert){
		var sPropertyNameFail = "mySubmit";
		var sPropertyNameValid = "submit";
		var sGroupId = "myGroup1";
		assert.throws(function() {return this.oFhirModel1.getGroupProperty(sGroupId, sPropertyNameFail);}, new Error("Unsupported group property: " + sPropertyNameFail));

		// default is SubmitMode.Direct
		assert.strictEqual(this.oFhirModel1.getGroupProperty(sGroupId, sPropertyNameValid), SubmitMode.Direct);

		// change default submit mode by the parameter in the constructor of the model
		var oTmpFhirModel = createModel({defaultSubmitMode: SubmitMode.Batch});
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sPropertyNameValid), SubmitMode.Batch);

		// for group "patientDetails"
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patientDetails", sPropertyNameValid), SubmitMode.Transaction);

		// for group "patients"
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patients", sPropertyNameValid), SubmitMode.Direct);

		// for group "valueSets"
		assert.strictEqual(this.oFhirModel1.getGroupProperty("valueSets", sPropertyNameValid), SubmitMode.Batch);
	});

	QUnit.test("Should determine correct fullUrl type for group or throw exception", function(assert){
		var sPropertyNameFail = "myFullUrlType";
		var sPropertyNameValid = "uri";
		var sSubmitProperty = "submit";
		var sGroupId = "myGroup1";
		assert.throws(function () { return this.oFhirModel1.getGroupProperty(sGroupId, sPropertyNameFail); }, new Error("Unsupported group property: " + sPropertyNameFail));

		// default is uuid
		assert.strictEqual(this.oFhirModel1.getGroupProperty(sGroupId, sPropertyNameValid).toString(), "uuid");

		// if the default submit mode is not direct then default fullUrlType is  uuid
		var oTmpFhirModel = createModel({ defaultSubmitMode: SubmitMode.Batch });
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sSubmitProperty), SubmitMode.Batch);
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sPropertyNameValid).toString(), "uuid");

		// set default fullUrlType
		oTmpFhirModel = createModel({ defaultSubmitMode: SubmitMode.Batch, defaultFullUrlType: "url" });
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sSubmitProperty), SubmitMode.Batch);
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sPropertyNameValid).toString(), "url");

		// set default fullUrlType
		oTmpFhirModel = createModel({ defaultSubmitMode: SubmitMode.Batch, defaultFullUrlType: "uuid" });
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sSubmitProperty), SubmitMode.Batch);
		assert.strictEqual(oTmpFhirModel.getGroupProperty(sGroupId, sPropertyNameValid).toString(), "uuid");

		// for group "patientDetails"
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patientDetails", sSubmitProperty), SubmitMode.Transaction);
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patientDetails", sPropertyNameValid).toString(), "uuid");

		// for group "patients"
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patients", sSubmitProperty), SubmitMode.Direct);
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patients", sPropertyNameValid).toString(), "uuid");

		// for group "valueSets"
		assert.strictEqual(this.oFhirModel1.getGroupProperty("valueSets", sSubmitProperty), SubmitMode.Batch);
		assert.strictEqual(this.oFhirModel1.getGroupProperty("patients", sPropertyNameValid).toString(), "uuid");
	});

	QUnit.test("Should throw exception for invalid group properties", function(assert){
		// it's not an object as group properties
		var mTmpParameters = { groupProperties: { testGroup1: "This is a test group" } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. The properties must be of type object, found \"This is a test group\""));

		// submit mode is not from type sap.fhir.model.r4.SubmitMode
		mTmpParameters = { groupProperties: { testGroup1: { submit: "test" } } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. The value of property \"submit\" must be of type sap.fhir.model.r4.SubmitMode, found: \""
			+ mTmpParameters.groupProperties.testGroup1.submit + "\""));

		// more group properties are defined as allowed
		mTmpParameters = { groupProperties: { testGroup1: { submit: "test", submit2: "test1234" } } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. Only the property \"submit\" and \"fullUrlType\" is allowed and has to be set, found \"" + JSON.stringify(mTmpParameters.groupProperties.testGroup1)
			+ "\""));

		// check for fullurl type
		mTmpParameters = { groupProperties: { testGroup1: { submit: "Batch", fullUrlType: "test1234" } } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. The value of property \"fullUrlType\" must be either uuid or url, found: \""
			+ mTmpParameters.groupProperties.testGroup1.fullUrlType + "\""));

		// check for fullurl type with submit mode not batch /transaction
		mTmpParameters = { groupProperties: { testGroup1: { submit: "Direct", fullUrlType: "uuid" } } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. The value of property \"fullUrlType\" is applicable only for batch and transaction submit modes, found: \""
			+ mTmpParameters.groupProperties.testGroup1.submit + "\""));

		// only fullurl without submit mode
		mTmpParameters = { groupProperties: { testGroup1: { fullUrlType: "test1234" } } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. The property \"fullUrlType\" is allowed only when submit property is present, found \"" + JSON.stringify(mTmpParameters.groupProperties.testGroup1)
			+ "\""));

		// submit mode is not defined in group properties
		mTmpParameters = { groupProperties: { testGroup1: { submit2: "test1234" } } };
		assert.throws(function () { return createModel(mTmpParameters); }, new Error("Group \"testGroup1\" has invalid properties. Only the property \"submit\" is allowed and has to be set, found \"" + JSON.stringify(mTmpParameters.groupProperties.testGroup1)
			+ "\""));
	});

	QUnit.test("ListBinding should be successfully if context is not there at initialization", function(assert){
		var oTempListBinding = this.oFhirModel1.bindList("contact");
		this.oFhirModel1.aBindings.push(oTempListBinding);
		assert.strictEqual(oTempListBinding.getLength(), undefined);
		assert.strictEqual(oTempListBinding.oContext, undefined);
		oTempListBinding.setContext(this.oContextBinding.getBoundContext());
		this.oFhirModel1.setProperty(this.sPatientPath + "/contact/0", "newValue");
		oTempListBinding.getContexts();
		var aKeysResult = [];
		aKeysResult.push(this.sPatientPath.substring(1) + "/contact/0");
		assert.deepEqual(oTempListBinding.aKeys, aKeysResult);
		assert.strictEqual(oTempListBinding.getLength(), 1);
		assert.strictEqual(oTempListBinding.oContext, this.oContextBinding.getBoundContext());
	});

	QUnit.test("getBindingInfo with nested contexts", function(assert){
		var oContextBinding = this.oFhirModel1.bindContext("/Patient");
		var oContextBinding2 = this.oFhirModel1.bindContext("123", oContextBinding.oElementContext);
		var oContextBinding3 = this.oFhirModel1.bindContext("name/0", oContextBinding2.oElementContext);
		var oBindingInfo = this.oFhirModel1.getBindingInfo("family", oContextBinding3.oElementContext);
		assert.strictEqual(oBindingInfo.getAbsolutePath(), "/Patient/123/name/0/family");
		assert.strictEqual(this.oFhirModel1.getBindingInfo(), undefined);
		assert.strictEqual(this.oFhirModel1.getBindingInfo("contact"), undefined);
		assert.strictEqual(this.oFhirModel1.getBindingInfo(undefined, oContextBinding.oElementContext).getAbsolutePath(), "/Patient");
	});

	QUnit.test("create and set property in resource and check then listbinding items", function(assert){
		var oListBinding = this.oFhirModel1.bindList("/Coverage");
		oListBinding.iTotalLength = 0;
		this.oFhirModel1.aBindings.push(oListBinding);
		var sId = this.oFhirModel1.create("Coverage");
		oListBinding.getContexts();
		this.oFhirModel1.setProperty("/Coverage/" + sId + "/period/start", "2019-03-05T23:00:00.000Z");
		oListBinding.getContexts();
		assert.strictEqual(oListBinding.getLength(), 1, "Length is correct");
		var sId2 = this.oFhirModel1.create("Coverage");
		oListBinding.getContexts();
		assert.strictEqual(oListBinding.getLength(), 2, "Length is correct");
		this.oFhirModel1.remove(["/Coverage/" + sId, "/Coverage/" + sId2]);
		oListBinding.getContexts();
		assert.strictEqual(oListBinding.getLength(), 0, "Length is correct");
	});

	QUnit.test("multiple references in getproperty", function(assert){
		this.oFhirModel1.oData = {
			Coverage : {
				123 : {
					payor : [
						{
							reference: "Organization/123",
							name : "samesame",
							period : {
								validTo : "2019-04-09"
							}
						},
						{
							reference: "Patient/123",
							name : "samesame",
							period : {
								validTo : "2019-04-03"
							}
						},
						{
							reference: "Organization/456",
							type : "Organization"
						},
						{
							use : "payment",
							type : "Coverage",
							period : {
								validTo : "9999-01-01"
							}
						}
					],
					test : []
				}
			},
			Organization : {
				123 : {
					name : "bar"
				},
				456 : {
					name : "foo"
				},
				xyz : {
					name : "xyz"
				}
			},
			Patient : {
				1: {
					address : [
						{
							type : "physical",
							use : "home",
							another : "unmatch"
						},
						{
							type : "physical",
							use : "home",
							another : "match"
						},
						{
							type : "postal",
							use : "official"
						},
						{
							type : "postal",
							use : "second"
						},
						{
							type : "physical",
							use : "second"
						}
					]
				}

			}
		};
		var mChangedResources = {"Coverage":{"123":{"method":"PUT","url":"/Coverage/123"}},"Organization":{"123":{"method":"PUT","url":"/Organization/123"},"456":{"method":"PUT","url":"/Organization/456"},"xyz":{"method":"PUT","url":"/Organization/xyz"}},
				  "path": {
					    "lastUpdated": "/Coverage/123/payor/[reference=Organization/xyz]/reference/test"
					  }};
		var oContextBinding = this.oFhirModel1.bindContext("/Coverage/123", undefined, {groupId : "patientDetails"});
		var oListBinding = this.oFhirModel1.bindList("payor/[reference StartsWith Organization]", oContextBinding.getBoundContext());
		oListBinding.iTotalLength = 0;
		var aContexts = oListBinding.getContexts();
		var oPropertyBinding = this.oFhirModel1.bindProperty("reference/name", aContexts[0]);
		var oPropertyBinding2 = this.oFhirModel1.bindProperty("reference/name", aContexts[1]);
		this.oFhirModel1.aBindings.push(oPropertyBinding2);
		this.oFhirModel1.aBindings.push(oPropertyBinding);
		assert.deepEqual(oPropertyBinding.getValue(), "bar", "the value is correct for multiple reference context");
		assert.deepEqual(oPropertyBinding2.getValue(), "foo", "the value is correct for multiple reference context");
		oPropertyBinding2.setValue("hello");
		this.oFhirModel1.setProperty("/Coverage/123/payor/0/reference/name", "test");
		this.oFhirModel1.setProperty("/Coverage/123/payor/0/reference/bar/0/family", "Hans");
		this.oFhirModel1.setProperty("/Coverage/123/payor/4/reference", "Organization/xyz");
		this.oFhirModel1.setProperty("/Coverage/123/payor/[reference=Organization/xyz]/reference/test", "fooo");
		assert.strictEqual("fooo", this.oFhirModel1.oData.Organization.xyz.test,"Contains the correct value");
		var oOrg = {"reference":"Organization/456","type":"Organization"};
		var oOrgTmp = this.oFhirModel1.getProperty("/Coverage/123/payor/[reference=Organization/456]");
		var oOrg2 = {"2":{"reference":"Organization/456","type":"Organization"},"4":{"reference":"Organization/xyz"}};
		var oOrgTmp2 = this.oFhirModel1.getProperty("/Coverage/123/payor/[period/validTo Missing]");
		var oOrg3 = {"reference":"Patient/123","name":"samesame","period":{"validTo":"2019-04-03"}};
		var oOrgTmp3 = this.oFhirModel1.getProperty("/Coverage/123/payor/[period/validTo LT 2019-04-08]");
		assert.deepEqual(oOrg, oOrgTmp, "orgtmp is the same");
		assert.deepEqual(oOrg2, oOrgTmp2, "orgtmp2 is the same");
		assert.deepEqual(oOrg3, oOrgTmp3, "org is the same");
		var oSlice = this.oFhirModel1.oData.Coverage["123"].payor[2];
		var oSliceTmp = this.oFhirModel1.getProperty("/Coverage/123/payor/[type=Organization]");
		assert.deepEqual(oSlice, oSliceTmp, "slice is the same");
		var oSlice2 = {"0":{"reference":"Organization/123","name":"samesame","period":{"validTo":"2019-04-09"}},"1":{"reference":"Patient/123","name":"samesame","period":{"validTo":"2019-04-03"}}};
		var oSliceTmp2 = this.oFhirModel1.getProperty("/Coverage/123/payor/[name=samesame]");
		assert.deepEqual(oSlice2, oSliceTmp2, "slice is the same");
		var oOrg123 = this.oFhirModel1.getProperty("/Coverage/123/payor/[name=samesame]/0/reference");
		assert.deepEqual("Organization/123", oOrg123, "org ref value is the same");
		var sOrg123NameValue = this.oFhirModel1.getProperty("/Coverage/123/payor/[name=samesame]/0/reference/name");
		assert.deepEqual("test", sOrg123NameValue, "org name is the same");
		var oEmpty = this.oFhirModel1.getProperty("/Coverage/123/test/[reference=Organization]");
		assert.deepEqual(undefined, oEmpty, "the value is correct for empty reference");
		var oUndefined = this.oFhirModel1.getProperty("/Coverage/123/test2/[reference=Organization]");
		assert.deepEqual(undefined, oUndefined, "the value is correct for undefined reference");
		assert.strictEqual(oPropertyBinding.getValue(), "test", "the value is correct for multiple reference context");
		assert.strictEqual(oPropertyBinding2.getValue(), "hello", "the value is correct for multiple reference context");
		assert.strictEqual(this.oFhirModel1.oData.Organization["123"].bar[0].family, "Hans", "the value is correct for multiple reference context");
		assert.strictEqual(this.oFhirModel1.oData.Coverage["123"].payor[4].reference, "Organization/xyz", "the value is correct for multiple reference context");
		assert.deepEqual(this.oFhirModel1.mChangedResources, mChangedResources, "The changed resource map is correct");
		this.oFhirModel1.setProperty("/Coverage/123/payor/[use=payment]/type", "Org");
		var sSliceTypeValue = this.oFhirModel1.getProperty("/Coverage/123/payor/[use=payment]/type");
		assert.strictEqual(sSliceTypeValue, "Org", "The slicevalue is correct");
		var oSliceWithAndLink = this.oFhirModel1.oData.Patient["1"].address[1];
		var oSliceWithAndLinkTmp = this.oFhirModel1.getProperty("/Patient/1/address/[use=home&&type=physical&&another=match]");
		assert.deepEqual(oSliceWithAndLink, oSliceWithAndLinkTmp, "The slicevalue is correct");
		var oSliceWithAndLink2 = {
			2 : this.oFhirModel1.oData.Patient["1"].address[2],
			3 : this.oFhirModel1.oData.Patient["1"].address[3]
		};
		var oSliceWithAndLinkTmp2 = this.oFhirModel1.getProperty("/Patient/1/address/[use=official, type StartsWith post && type NE physicial]");
		assert.deepEqual(oSliceWithAndLink2, oSliceWithAndLinkTmp2, "The slicevalue is correct");
		var oSliceWithAndLink3 = {
			2 : this.oFhirModel1.oData.Patient["1"].address[2],
			3 : this.oFhirModel1.oData.Patient["1"].address[3],
			4 : this.oFhirModel1.oData.Patient["1"].address[4]
		};
		var oSliceWithAndLinkTmp3 = this.oFhirModel1.getProperty("/Patient/1/address/[use=second, type StartsWith post && type NE physicial]");
		assert.deepEqual(oSliceWithAndLink3, oSliceWithAndLinkTmp3, "The slicevalue is correct");
		var oSliceWithAndLinkTmp4 = this.oFhirModel1.getProperty("/Patient/1/address/[use=second, type StartsWith post &amp;&amp; type NE physicial]");
		assert.deepEqual(oSliceWithAndLink3, oSliceWithAndLinkTmp4, "The slicevalue is correct");
		this.oFhirModel1.setProperty("/Patient/1/address/[use=blah&&type=foo]/city", "BlahFooVillage");
		assert.deepEqual({city:"BlahFooVillage", use:"blah", type: "foo"}, this.oFhirModel1.oData.Patient["1"].address[5]);
	});

	QUnit.test("Multiple or filter which matches", function(assert) {
		var oData =	{
			dummy : "foo"
		};
		var bMatch = FHIRFilterProcessor._evaluateFilter(new Filter({filters : [ new Filter("dummy", "EQ", "foo"), new Filter("dummy", "EQ", "bar")], and : false}), oData, function(vRef, sProperty){
			return this.oFhirModel1._getProperty(vRef, sProperty.split("/"));
		}.bind(this));
		assert.ok(bMatch, "The filter matched one of the given values for dummy property");
	});

	QUnit.test("Get Updated Resource from response when location has / or not shouldnot fail ", function(assert) {
		this.loadDataIntoModel("TwoUpdatedPatients");
		var oJSONData = TestUtils.loadJSONFile("ResponseOfMultiplePutInBundle");
		this.oRequestHandle.setUrl("https://example.com/fhir/");
		this.oFhirModel1._onSuccessfulRequest(this.oRequestHandle, oJSONData);
		var sPatientPath = "/Patient/253";
		var oResource = this.oFhirModel1.getProperty(sPatientPath);
		assert.strictEqual(oResource.id, "253", "Response with location having / at the beginning gives proper resource object and doesnot throw error");
		sPatientPath = "/Patient/254";
		oResource = this.oFhirModel1.getProperty(sPatientPath);
		assert.strictEqual(oResource.id, "254", "Response with location without having / at the beginning gives proper resource object and doesnot throw error");
	});

	QUnit.test("Search Bundle Response should not throw an error if resource id is not present", function(assert) {
		var oJSONData = TestUtils.loadJSONFile("BundleWithoutResourceId");
		var mResponseHeaders = { "etag": "W/\"1\"" };
		this.oRequestHandle.setUrl("https://example.com/fhir/Patient?_count=0&total=accurate&_format=json");
		this.oRequestHandle.setRequest(TestUtils.createAjaxCallMock(mResponseHeaders));
		this.oFhirModel1._onSuccessfulRequest(this.oRequestHandle, oJSONData);
		var sOperationOutcomePath = "/OperationOutcome";
		var oOperationOutcome = this.oFhirModel1.getProperty(sOperationOutcomePath);
		assert.strictEqual(Object.keys(oOperationOutcome).length, 1, "Bundle Response without resource id is parsed without throwing an error");
	});

	QUnit.test("Submit Bundle with correct ETag", function(assert){
		this.loadDataIntoModel("Patient2", this.sPatientPath2.substring(1));
		this.oPropertyBinding3.setValue("2008-04-27");
		this.oPropertyBinding4.setValue("female");
		var mRequestHandles = this.oFhirModel1.submitChanges("patientDetails");
		assert.strictEqual("W/\"1\"", mRequestHandles.patientDetails.getBundle().getBundlyEntry(1).getRequest().getBundleRequestData().ifMatch, "If-Match header is of correct syntax in bundle enteries ");
	});

	QUnit.test("Determine the correct Structure Definition URL for a binding info", function(assert){
		var oJSONData = TestUtils.loadJSONFile("Patient3");
		this.loadDataIntoModel("Patient3");
		var oBindingInfo = this.oFhirModel1.getBindingInfo("/Patient/125678");
		var oResource = this.oFhirModel1.getProperty(oBindingInfo.getResourcePath());
		var sStrucDefUrl = this.oFhirModel1.getStructureDefinitionUrl(oResource);
		assert.strictEqual(sStrucDefUrl, oJSONData.meta.profile[0], "Structure definition URL is determined correctly from the meta of the resource");
		this.loadDataIntoModel("Patient2");
		oBindingInfo = this.oFhirModel1.getBindingInfo("/Patient/127e23a0-6db1-4ced-b433-98c7a70646b8");
		oResource = this.oFhirModel1.getProperty(oBindingInfo.getResourcePath());
		sStrucDefUrl = this.oFhirModel1.getStructureDefinitionUrl(oBindingInfo);
		assert.strictEqual(sStrucDefUrl, oJSONData.meta.profile[0], "Default Structure definition URL is returned since resource doesnot have profile information");
	});

});
