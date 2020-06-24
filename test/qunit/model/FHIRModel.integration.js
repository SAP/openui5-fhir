sap.ui.define([
	"../utils/TestUtilsIntegration",
	"../utils/TestUtils",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/OperationMode",
	"sap/fhir/model/r4/lib/RequestHandle",
	"sap/fhir/model/r4/lib/Sliceable",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/fhir/model/r4/SubmitMode",
	"sap/fhir/model/r4/lib/FHIRBundleType",
	"sap/fhir/model/r4/lib/FHIRBundleRequest",
	"sap/base/util/each",
	"sap/base/util/deepEqual",
	"sap/ui/core/format/DateFormat"
], function(TestUtilsIntegration, TestUtils, FHIRFilterOperator, OperationMode, RequestHandle, Sliceable, FilterOperator, Filter, SubmitMode, FHIRBundleType, FHIRBundleRequest, each, deepEqual, DateFormat) {
	"use strict";

	function createModel(mParameters) {
		return TestUtils.createFHIRModel("http://localhost:8080/fhir/R4", mParameters);
	}

	QUnit.module("Integration-Tests: FHIRModel", {

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
						"submit": "Batch"
					},
					"appointment": {
						"submit": "Batch"
					},
					"patients": {
						"submit": "Direct"
					},
					"valueSets" : {
						"submit" : "Batch"
					},
					"practitioner":{
						"submit":"Batch",
						"fullUrlType":"uuid"
					},
					"practitioner1":{
						"submit":"Transaction",
						"fullUrlType":"url"
					}
				},
				"defaultQueryParameters": { "_total": "accurate" }
			};
			this.oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
			this.oFhirModel = createModel(mParameters);
			this.oFhirModel1 = createModel(mParameters);
		},

		/**
		 * Runs before each test
		 */
		beforeEach: function() {
			this.oFhirModel.aBindings = [];
			this.oFhirModel.refresh();
			this.oFhirModel.mChangedResources = {};
		}
	});

	QUnit.test("check if response has no total property that error in list binding is thrown", function(assert) {
		var sPath = "/Patient";
		var oListBinding = this.oFhirModel.bindList(sPath);
		TestUtilsIntegration.manipulateResponse("http://localhost:8080/fhir/R4/Patient?_count=10&_total=accurate&_format=json", this.oFhirModel, TestUtilsIntegration.setTotalUndefined, TestUtilsIntegration.checkErrorMsg.bind(undefined, this.oFhirModel, assert, "FHIR Server error: The \"total\" property is missing in the response for the requested FHIR resource " + sPath));
		oListBinding.getContexts();
	});

	QUnit.test("$everything operation", function(assert) {
		var oContextBinding = this.oFhirModel.bindContext("/Encounter/a2652/$everything");
		var oPropertyBinding = this.oFhirModel.bindProperty("subject/reference/gender", oContextBinding.getBoundContext());
		var done1 = assert.async();
		var fnRequestCompleted = function(oEvent){
			if (oEvent.getParameter("requestHandle").getUrl().indexOf("/Encounter/a2652") > -1){
				assert.strictEqual(oPropertyBinding._getValue(), "male");
				this.oFhirModel.detachRequestCompleted(fnRequestCompleted);
				done1();
			}
		}.bind(this);
		this.oFhirModel.attachRequestCompleted(fnRequestCompleted);
	});

	QUnit.test("refresh context and check that property is reseted to server state", function(assert) {
		var oContextBinding = this.oFhirModel.bindContext("/Patient/a2522");
		var oPropertyBinding = this.oFhirModel.bindProperty("gender", oContextBinding.getBoundContext());
		var done1 = assert.async();
		var fnRequestCompleted = function(oEvent){
			if (oEvent.getParameter("requestHandle").getUrl().indexOf("/Patient/a2522") > -1){
				if (this.bContextRefresh){
					this.oFhirModel.detachRequestCompleted(fnRequestCompleted);
					assert.strictEqual(oPropertyBinding._getValue(), "female");
					done1();
				} else {
					assert.strictEqual(oPropertyBinding._getValue(), "female");
					oPropertyBinding.setValue("male");
					assert.strictEqual(oPropertyBinding._getValue(), "male");
					this.bContextRefresh = true;
					oContextBinding.getBoundContext().refresh();
				}
			}
		}.bind(this);
		this.oFhirModel.attachRequestCompleted(fnRequestCompleted);
	});

	QUnit.test("check message model in direct call", function(assert) {
		var oPatient = {
			birthDate : "abc"
		};
		this.oFhirModel.create("Patient", oPatient);
		var done1 = assert.async();
		var fnRequestFailed = function(oEvent){
			this.oFhirModel.detachRequestFailed(fnRequestFailed);
			var aMsgs = this.oMessageModel.getData();
			var oMessage = aMsgs[aMsgs.length - 1];
			assert.strictEqual(oEvent.getParameter("requestHandle").getRequest().responseText, oMessage.getDescription());
			done1();
		}.bind(this);
		this.oFhirModel.attachRequestFailed(fnRequestFailed);
		this.oFhirModel.submitChanges();

	});

	QUnit.test("check message model in transation call", function(assert) {
		var oPatient = {
			birthDate : "abc"
		};
		var sPatientId = this.oFhirModel.create("Patient", oPatient, "patientDetails");
		var oEncounter = {
			status : "arrived",
			subject : {
				reference : "Patient/" + sPatientId
			}
		};
		this.oFhirModel.create("Encounter", oEncounter, "patientDetails");
		var done1 = assert.async();
		var fnRequestFailed = function(oEvent){
			this.oFhirModel.detachRequestFailed(fnRequestFailed);
			var aMsgs = this.oMessageModel.getData();
			var oMessage = aMsgs[aMsgs.length - 1];
			assert.strictEqual(oEvent.getParameter("requestHandle").getRequest().responseText, oMessage.getDescription());
			assert.strictEqual(oEvent.getParameter("requestHandle").getUrl(), oMessage.getDescriptionUrl());
			done1();
		}.bind(this);
		this.oFhirModel.attachRequestFailed(fnRequestFailed);
		this.oFhirModel.submitChanges("patientDetails");
	});

	QUnit.test("check that the model is refreshed and the context has after refresh the correct number of patients", function(assert) {
		var oContextBinding = this.oFhirModel.bindContext("/Patient");
		var oContextBinding2 = this.oFhirModel.bindContext("/Patient");
		var oContextBinding3 = this.oFhirModel.bindContext("a2522/contact", oContextBinding.getBoundContext());
		assert.deepEqual(oContextBinding3.getContext(), oContextBinding.getBoundContext());
		var oPropertyBinding = this.oFhirModel.bindProperty("a2522/name/0/family", oContextBinding.getBoundContext());
		var oPropertyBinding2 = this.oFhirModel.bindProperty("%total%");
		var oPropertyBinding3 = this.oFhirModel.bindProperty("%total%");
		this.oFhirModel.refresh();
		assert.strictEqual(undefined, this.oFhirModel.oData.Patient, "There was no patient data loaded yet");
		var done1 = assert.async();
		var bIsContextReady = false;
		var bIsContext2Ready = false;
		var fnDataReceivedCheck = function(oEvent){
			if (oEvent.getSource() === oContextBinding2){
				oContextBinding2.detachChange(fnDataReceivedCheck);
				bIsContext2Ready = true;
			} else {
				oContextBinding.detachChange(fnDataReceivedCheck);
				bIsContextReady = true;
			}
			if (bIsContextReady && bIsContext2Ready){
				assert.strictEqual(4, oContextBinding2.getBoundContext().iTotal, "The patient data is loaded now");
				assert.strictEqual(4, oContextBinding.getBoundContext().iTotal, "The patient data is loaded now");
				oPropertyBinding.checkUpdate();
				assert.strictEqual("Cancer", oPropertyBinding.getValue());
				oPropertyBinding2.setContext(oContextBinding.getBoundContext());
				assert.strictEqual(4, oPropertyBinding2.getValue());
				oPropertyBinding3.initialize();
				assert.strictEqual(undefined, oPropertyBinding3.getValue());
				oContextBinding3.setContext(oContextBinding2.getBoundContext());
				assert.deepEqual(oContextBinding3.getContext(), oContextBinding2.getBoundContext());
				done1();
			}
		};
		oContextBinding.attachChange(fnDataReceivedCheck);
		oContextBinding2.attachChange(fnDataReceivedCheck);
	});

	QUnit.test("check that datareceived event is fired in listbinding if response was a http 4xx code, change to correct path, request again and expect one result context", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/foo");
		var done1 = assert.async();
		var fnDataReceivedCheck = function(){
			if (oListBinding.bResourceNotAvailable){
				oListBinding.sPath = "/Patient";
				var oFamilyFilter =  new sap.ui.model.Filter({path: "family", operator: FilterOperator.EQ, value1: "Wurst"});
				oListBinding.filter([oFamilyFilter]);
				oListBinding.getContexts();
			}
			if (oListBinding.getLength() > 0){
				assert.strictEqual(1, oListBinding.getLength(), "There was one context found in the listbinding");
				done1();
			}
		};
		oListBinding.attachDataReceived(fnDataReceivedCheck);
		oListBinding.getContexts();
	});

	QUnit.test("cache filter", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Patient");
		var oNameFilter =  new sap.ui.model.Filter({path: "family", operator: FilterOperator.Contains, value1: "C"});
		var oNameFilter1 =  new sap.ui.model.Filter({path: "family", operator: FilterOperator.Contains, value1: "Ca"});
		var oNameFilter2 = new sap.ui.model.Filter({path: "family", operator: FilterOperator.Contains, value1: "Can"});
		oListBinding.filter([oNameFilter]);
		oListBinding.getContexts();
		oListBinding.filter([oNameFilter1]);
		oListBinding.getContexts();
		each(this.oFhirModel.oRequestor._aPendingRequestHandles, function(i, oEntry) {
			if (deepEqual(oEntry.getBinding(), oListBinding)){
				assert.strictEqual(oEntry.getUrl().indexOf("family:contains=C&") > -1, true);
				assert.strictEqual(oEntry.getUrl().indexOf("family:contains=Ca&") === -1, true);
			}
		});
		var done1 = assert.async();
		var fnDataReceivedCheck = function(){
			oListBinding.detachDataReceived(fnDataReceivedCheck);
			oListBinding.getContexts();
			var bFound = false;
			each(this.oFhirModel.oRequestor._aPendingRequestHandles, function(i, oEntry) {
				if (deepEqual(oEntry.getBinding(), oListBinding)){
					assert.strictEqual(oEntry.getUrl().indexOf("family:contains=Ca&") === -1, true);
					if (oEntry.getUrl().indexOf("family:contains=Can&") > -1){
						bFound = true;
					}
				}
			});
			assert.strictEqual(bFound, true, "The cached filter is requested");
			done1();
		}.bind(this);
		oListBinding.attachDataReceived(fnDataReceivedCheck);
		oListBinding.filter([oNameFilter2]);
		oListBinding.getContexts();
	});

	QUnit.test("cache sorter", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Patient");
		var oNameSorter =  new sap.ui.model.Sorter({path: "family", descending : true});
		var oNameSorter2 =  new sap.ui.model.Sorter({path: "family", descending : true});
		var oGivenSorter = new sap.ui.model.Sorter({path: "given", descending : false});
		oListBinding.sort([oNameSorter], true);
		oListBinding.getContexts();
		oListBinding.sort([oNameSorter2], true);
		oListBinding.getContexts();
		each(this.oFhirModel.oRequestor._aPendingRequestHandles, function(i, oEntry) {
			if (deepEqual(oEntry.getBinding(), oListBinding)){
				assert.strictEqual(oEntry.getUrl().indexOf("_sort=-family&") > -1, true);
				assert.strictEqual(oEntry.getUrl().indexOf("_sort=family&") === -1, true);
			}
		});
		var done1 = assert.async();
		var fnDataReceivedCheck = function(){
			oListBinding.detachDataReceived(fnDataReceivedCheck);
			oListBinding.getContexts();
			var bFound = false;
			each(this.oFhirModel.oRequestor._aPendingRequestHandles, function(i, oEntry) {
				if (deepEqual(oEntry.getBinding(), oListBinding)){
					assert.strictEqual(oEntry.getUrl().indexOf("_sort=family&") === -1, true);
					if (oEntry.getUrl().indexOf("_sort=given&") > -1){
						bFound = true;
					}
				}
			});
			assert.strictEqual(bFound, true, "The cached sort is requested");
			done1();
		}.bind(this);
		oListBinding.attachDataReceived(fnDataReceivedCheck);
		oListBinding.sort([oGivenSorter], true);
		oListBinding.getContexts();
	});

	QUnit.test("Test FHIRModel.read", function(assert){
		// success case
		var done = assert.async();
		var mParameters = {
			urlParameters: {family: "Notsowell"},
			success: function(oBundle){
				var oEntry = oBundle.entry[0];
				assert.strictEqual(oBundle.total, 1, "The number of entries of the bundle are correct.");
				assert.strictEqual(oEntry.resource.gender, "male", "The gender of the patient has the correct value.");
				assert.strictEqual(oEntry.resource.name[0].family, "Notsowell", "The family name of the patient has the correct value.");
				done();
			},
			error: function(oError){
				done();
				throw new Error("Error callback should not be called at this place");
			}
		};
		this.oFhirModel.sendGetRequest("/Patient", mParameters);
		// error case
		var done1 = assert.async();

		var mParameters1 = {
			urlParameters: {family: "Notsowell"},
			success: function(oBundle){
				done1();
				throw new Error("Success callback should not be called at this place");
			},
			error: function(oError){
				assert.strictEqual(oError.code, 404, "The error code has the correct value.");
				assert.strictEqual(oError.message, "Not Found", "The error message has the correct value.");
				done1();
			}
		};
		this.oFhirModel.sendGetRequest("/InvalidResourceType", mParameters1);
	});

	QUnit.test("Bind a list to operartion which returns multiple resources with the same ID", function(assert) {
		var oListBinding = this.oFhirModel1.bindList("/StructureDefinition/2552/$businessVersion", undefined, undefined, undefined,{ unique: true });
		oListBinding.getContexts();
		var done = assert.async();
		var refreshTrigger = false;
		var fnCheckVersions = function(oData){
			assert.strictEqual(oListBinding.getContexts().length, 3, "The contexts are generated correctly");
			var oProperty = this.oFhirModel1.bindProperty("meta/versionId", oListBinding.getContexts()[0]);
			var oProperty2 = this.oFhirModel1.bindProperty("meta/versionId", oListBinding.getContexts()[1]);
			var oProperty3 = this.oFhirModel1.bindProperty("meta/versionId", oListBinding.getContexts()[2]);
			assert.strictEqual(oProperty.getValue(), "1", "The value of business version is correct");
			assert.strictEqual(oProperty2.getValue(), "2", "The value of business version is correct");
			assert.strictEqual(oProperty3.getValue(), "3", "The value of business version is correct");
			if (!refreshTrigger){
				refreshTrigger = true;
				oListBinding.getContexts()[0].getBinding().attachChange(fnCheckVersions);
				oListBinding.getContexts()[0].refresh();
			} else {
				oListBinding.detachDataReceived(fnCheckVersions);
				oListBinding.getContexts()[0].getBinding().detachChange(fnCheckVersions);
				done();
			}
		}.bind(this);
		oListBinding.attachDataReceived(fnCheckVersions);
	});

	QUnit.test("check contexts in listbinding after and before paging", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Patient");
		oListBinding.getContexts(0, 2);
		var done1 = assert.async();
		var fnDataReceivedCheck = function(oData){
			if (oListBinding.aKeys.length === 4){
				var aKeys = TestUtils.deepClone(oListBinding.aKeys);
				oListBinding.getContexts(0, 4);
				assert.deepEqual(oListBinding.aKeys, aKeys, "The keys are generated correctly");
				done1();
			} else {
				oListBinding.getContexts(0, 4);
			}
		};
		oListBinding.attachDataReceived(fnDataReceivedCheck);
	});

	QUnit.test("Attach request failed to Model and expect the binding in the event", function(assert) {
		var done = assert.async();
		var oContextBinding;
		var fnRequestfailed = function(oEvent){
			assert.deepEqual(oContextBinding, oEvent.getParameter("requestHandle").getBinding(), "The binding property is in the request failed object");
			this.oFhirModel.detachRequestFailed(fnRequestfailed);
			done();
		}.bind(this);
		this.oFhirModel.attachRequestFailed(fnRequestfailed);
		oContextBinding = this.oFhirModel.bindContext("/foo");
	});

	QUnit.test("Attach request completed to Model and expect the binding in the event", function(assert) {
		var done = assert.async();
		var oContextBinding;
		var fnRequestCompleted = function(oEvent){
			assert.deepEqual(oContextBinding, oEvent.getParameter("requestHandle").getBinding(), "The binding property is in the request completed object");
			this.oFhirModel.detachRequestCompleted(fnRequestCompleted);
			done();
		}.bind(this);
		this.oFhirModel.attachRequestCompleted(fnRequestCompleted);
		oContextBinding = this.oFhirModel.bindContext("/Patient");
	});

	QUnit.test("Create resources for different groups and submit specific group, check if not submitted are still in changed resources", function(assert) {
		var done = assert.async();
		var sPatientId = this.oFhirModel.create("Patient", undefined, "patientDetails2");
		var sAppointmentId = this.oFhirModel.create("Appointment", undefined, "appointment");
		var fnSubmitCompleted = function(oEvent){
			assert.strictEqual(this.oFhirModel.mChangedResources.Patient.hasOwnProperty(sPatientId), true, "The changed resources for patient are still there");
			assert.strictEqual(this.oFhirModel.mChangedResources.Appointment.hasOwnProperty(sAppointmentId), false, "The changed resources for patient are still there");
			done();
		}.bind(this);
		this.oFhirModel.submitChanges("appointment", fnSubmitCompleted);
	});

	QUnit.test("Total property in valueset not available", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/ValueSet", undefined, undefined,undefined, {request: {"url" : "http://hl7.org/fhir/ValueSet/v3-hl7Realm"}});
		var done1 = assert.async();
		var fnAssertion = function(){
			var fnCheck = function(oEvent){
				oListBinding.detachDataReceived(fnCheck);
				done1();
				assert.strictEqual(oListBinding.getLength(), 42, "The lenght was set correctly to 42 because no total property could be deteced");
			};
			oListBinding.attachDataReceived(fnCheck);
		};
		TestUtilsIntegration.manipulateResponse("http://localhost:8080/fhir/R4/ValueSet/$expand?_count=10&url=http://hl7.org/fhir/ValueSet/v3-hl7Realm&displayLanguage=" + sap.ui.getCore().getConfiguration().getLanguage() + "&_format=json", this.oFhirModel, TestUtilsIntegration.setTotalOfValueSetOperationUndefined, fnAssertion);
		oListBinding.getContexts();
	});

	QUnit.test("Set properties and values in valueset undefined", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/ValueSet", undefined, undefined, undefined, {request: {"url" : "http://hl7.org/fhir/ValueSet/v3-hl7Realm"}});
		var done1 = assert.async();
		var fnAssertion = function(){
			var fnCheck = function(oEvent){
				oListBinding.detachDataReceived(fnCheck);
				done1();
				assert.strictEqual(oListBinding.getLength(), 0, "The length was set correctly to 0 because no values could be deteced");
			};
			oListBinding.attachDataReceived(fnCheck);
		};
		TestUtilsIntegration.manipulateResponse("http://localhost:8080/fhir/R4/ValueSet/$expand?_count=10&url=http://hl7.org/fhir/ValueSet/v3-hl7Realm&displayLanguage=" + sap.ui.getCore().getConfiguration().getLanguage() + "&_format=json", this.oFhirModel, TestUtilsIntegration.setValueSetPropertiesUndefined, fnAssertion);
		oListBinding.getContexts();
	});

	QUnit.test("Send POST request", function(assert) {
		var done1 = assert.async();
		var mParameters = {
			success : function(oData){
				var oValidateResponse = TestUtils.loadJSONFile("Validate");
				assert.deepEqual(oData, oValidateResponse, "Validate response was correct");
				done1();
			}
		};
		this.oFhirModel.sendPostRequest("Organization/$validate", {
			resourceType: "Parameters",
			parameter: [
			  {
			    name: "mode",
			    valueCode: "create"
			  },
			  {
			    name: "resource",
			    resource: {
			      resourceType: "Organization",
			      name: "XYZ Insurance"
			    }
			  }
			]
		}, mParameters);
	});

	QUnit.test("Bind context against Rüdiger history version 1 entry and load data", function(assert) {
		var oContextBinding = this.oFhirModel.bindContext("/Patient/a2520/_history/1");
		var oPropertyBinding = this.oFhirModel.bindProperty("name/0/family", oContextBinding.getBoundContext());
		var done1 = assert.async();
		var fnAssertion = function(){
			assert.strictEqual(oPropertyBinding._getValue(), "Rüdiger", "The history context binding load works");
			oContextBinding.detachChange(fnAssertion);
			done1();
		};
		oContextBinding.attachChange(fnAssertion);
	});

	QUnit.test("Bind list against Notsowells history and change value", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Patient/a2521/_history", undefined, undefined,undefined, {groupId : "patientDetails"});
		this.oFhirModel.aBindings.push(oListBinding);
		var done1 = assert.async();
		var fnAssertion = function(){
			oListBinding.detachDataReceived(fnAssertion);
			var aContext = oListBinding.getContexts();
			var oPropertyBinding = this.oFhirModel.bindProperty("birthDate", aContext[aContext.length - 1]);
			var oDate = new Date();
			var sOldDate = oPropertyBinding.getValue();
			oPropertyBinding.setValue(oDate);
			this.oFhirModel.submitChanges(undefined, function(oData){
				aContext = oListBinding.getContexts();
				assert.strictEqual(aContext[0].getObject().birthDate, oDate, "The history context binding load works");
				assert.strictEqual(oPropertyBinding._getValue(), sOldDate, "The history context binding load works");
				done1();
			});
		}.bind(this);
		oListBinding.getContexts();
		oListBinding.attachDataReceived(fnAssertion);
	});

	QUnit.test("Bind Context to a specific resource entity and check the created url", function(assert){
		var done = assert.async();
		var fnCheck = function(oRequestHandle){
			done();
			assert.strictEqual(TestUtils.getQueryParameters(oRequestHandle.getUrl())._total, undefined);
		};
		TestUtilsIntegration.checkSendRequest("http://localhost:8080/fhir/R4/Patient/a2522?_format=json", this.oFhirModel, fnCheck);
		this.oFhirModel.bindContext("/Patient/a2522");
	});

	QUnit.test("Bind Context to a collection of resources and check the created url", function(assert){
		var done = assert.async();
		var fnCheck = function(oRequestHandle){
			done();
			assert.strictEqual(TestUtils.getQueryParameters(oRequestHandle.getUrl())._total, "accurate");
		};
		TestUtilsIntegration.checkSendRequest("http://localhost:8080/fhir/R4/Patient?_total=accurate&_format=json", this.oFhirModel, fnCheck);
		this.oFhirModel.bindContext("/Patient");
	});

	QUnit.test("Test sent HTTP headers", function(assert){
		var done = assert.async();
		var fnCheck = function(oRequestHandle){
			assert.strictEqual(oRequestHandle.getHeaders()["Accept-Language"], sap.ui.getCore().getConfiguration().getLanguageTag());
			assert.strictEqual(oRequestHandle.getHeaders()["cache-control"], "no-cache");
			done();
		};
		TestUtilsIntegration.checkSendRequest("http://localhost:8080/fhir/R4/Patient/a2523?_format=json", this.oFhirModel, fnCheck);
		this.oFhirModel.bindContext("/Patient/a2523");
	});

	QUnit.test("Rev include property binding on reference", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Practitioner", undefined, undefined,undefined, {groupId : "patientDetails", request: {_revinclude: "PractitionerRole:practitioner", "_has:PractitionerRole:practitioner:organization" : "a2523"}});
		var done = assert.async();
		var fnAssertion = function(){
			var aContext = oListBinding.getContexts();
			assert.strictEqual(aContext[0].sPath, "/Practitioner/a2533", "The practitioner was loaded successfully");
			var oRevReferenceBinding = this.oFhirModel.bindList("[revreference/PractitionerRole=practitioner/reference]", aContext[0]);
			var aRevContext = oRevReferenceBinding.getContexts();
			var fnAssertionRevReference = function(){
				aRevContext = oRevReferenceBinding.getContexts();
				var oPropertyBinding = this.oFhirModel.bindProperty("id", aRevContext[0]);
				assert.strictEqual(oPropertyBinding._getValue(), "a2532", "The rev include property binding works");
				done();
			}.bind(this);
			oRevReferenceBinding.attachDataReceived(fnAssertionRevReference);
		}.bind(this);
		oListBinding.attachDataReceived(fnAssertion);
		oListBinding.getContexts();
	});

	QUnit.test("Reset of client changes and list update check", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Coverage");
		this.oFhirModel.aBindings.push(oListBinding);
		var done = assert.async();
		var fnAssertion = function(){
			var aContext = oListBinding.getContexts();
			assert.strictEqual(aContext.length, 1, "The actual number of coverages is correct.");
			this.oFhirModel.create("Coverage", { foo: "bar"});
			aContext = oListBinding.getContexts();
			assert.strictEqual(aContext.length, 2, "The actual number of coverages has been increased by 1 correctly.");
			var oPropertyBinding = this.oFhirModel.bindProperty("foo", aContext[0]);
			assert.strictEqual(oPropertyBinding.getValue(), "bar", "The practitioner was loaded successfully");
			this.oFhirModel.resetChanges();
			aContext = oListBinding.getContexts();
			assert.strictEqual(oListBinding.getLength(), 1, "Length got reseted");
			assert.strictEqual(aContext[0].getPath(), "/Coverage/a7854", "Contexts got cleared");
			done();
		}.bind(this);
		oListBinding.attachDataReceived(fnAssertion);
		oListBinding.getContexts();
	});

	QUnit.test("Reset of client changes when resource had groupid via context binding but in other context no groupid and got deleted", function(assert) {
		var oListBinding = this.oFhirModel.bindList("/Claim");
		this.oFhirModel.aBindings.push(oListBinding);
		var done = assert.async();
		var fnAssertion = function(){
			oListBinding.attachDataReceived(fnAssertion);
			var sId = this.oFhirModel.create("Claim");
			var oContextBinding = this.oFhirModel.bindContext("/Claim/" + sId, undefined, { groupId : "patientDetails"});
			var oPropertyBinding = this.oFhirModel.bindProperty("created", oContextBinding.getBoundContext());
			this.oFhirModel.aBindings.push(oContextBinding);
			this.oFhirModel.aBindings.push(oPropertyBinding);
			var oDate = new Date();
			oPropertyBinding.setValue(oDate);
			this.oFhirModel.submitChanges("patientDetails", function(oData){
				this.oFhirModel.remove(["/Claim/" + oData.id]);
				this.oFhirModel.submitChanges(undefined, function(oData){
					assert.deepEqual(this.oFhirModel.mChangedResources["Claim"], {} , "Claim in changed resources got cleared");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this);
		oListBinding.attachDataReceived(fnAssertion);
		oListBinding.getContexts();
	});

	QUnit.test("Conditional reference in transaction success", function(assert) {
		var sPatientId = this.oFhirModel.create("Patient", {}, "patientDetails");
		this.oFhirModel.create("Coverage", { payor : {
			reference : "urn:uuid:" + sPatientId
		}}, "patientDetails");
		var done = assert.async();
		var mRequestHandle;
		var bDeletionSuccess = false;
		var fnAssertion = function(oData){
			if (bDeletionSuccess){
				assert.ok(true, "Resources with reference could be saved and deleted via transaction call");
				done();
			} else {
				bDeletionSuccess = true;
				var aPatientKeys = Object.keys(this.oFhirModel.oData.Patient);
				var aCoverageKeys = Object.keys(this.oFhirModel.oData.Coverage);
				this.oFhirModel.remove(["/Patient/" + aPatientKeys[0], "/Coverage/" + aCoverageKeys[0]]);
				mRequestHandle = this.oFhirModel.submitChanges("patientDetails");
				mRequestHandle["patientDetails"].getRequest().complete(fnAssertion);
			}
		}.bind(this);
		mRequestHandle = this.oFhirModel.submitChanges("patientDetails");
		mRequestHandle["patientDetails"].getRequest().complete(fnAssertion);
	});

	QUnit.test("Test batch bundle entry fullUrl generation", function(assert) {
		var sPractitionerId = this.oFhirModel.create("Practitioner", {
			name: [
				{
					family: "warne",
					given: ["dexter"]
				}
			]
		}, "practitioner");
		var mRequestHandle;
		mRequestHandle = this.oFhirModel.submitChanges("practitioner");
		var oBundle = mRequestHandle["practitioner"].getBundle();
		var sFullUrl = oBundle._aBundleEntries[0]._sFullUrl;
		assert.strictEqual(sFullUrl, "urn:uuid:" + sPractitionerId, "Full Generated for Batch entry is of type uuid");
	});

	QUnit.test("Test transaction bundle entry fullUrl generation", function(assert) {
		var sPractitionerId = this.oFhirModel.create("Practitioner", {
			name: [
				{
					family: "johnson",
					given: ["dexter"]
				}
			]
		}, "practitioner1");
		var mRequestHandle;
		mRequestHandle = this.oFhirModel.submitChanges("practitioner1");
		var oBundle = mRequestHandle["practitioner1"].getBundle();
		var sFullUrl = oBundle._aBundleEntries[0]._sFullUrl;
		assert.strictEqual(sFullUrl, this.oFhirModel.sServiceUrl + "/Practitioner/" + sPractitionerId, "Full Generated for Transaction entry is of type url");
	});

});