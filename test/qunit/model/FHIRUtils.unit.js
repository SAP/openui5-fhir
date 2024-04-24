sap.ui.define(["../utils/TestUtils", "sap/fhir/model/r4/FHIRUtils"], function(TestUtils, FHIRUtils) {
	"use strict";

	QUnit.module("Unit-Tests: FHIRUtils", {});

	QUnit.test("Test function Quantity", function(assert) {
		// have to enhanced if quantity is supported
		assert.strictEqual(false, FHIRUtils.isQuantity());
	});

	QUnit.test("Test function Number", function(assert) {
		assert.strictEqual(true, FHIRUtils.isNumber(1));
		assert.strictEqual(false, FHIRUtils.isNumber(""));
		assert.strictEqual(false, FHIRUtils.isNumber({}));
		assert.strictEqual(false, FHIRUtils.isNumber([]));
		assert.strictEqual(false, FHIRUtils.isNumber(new Date()));
	});

	QUnit.test("Test function isObject", function(assert) {
		assert.strictEqual(false, FHIRUtils.isObject(1));
		assert.strictEqual(false, FHIRUtils.isObject(""));
		assert.strictEqual(true, FHIRUtils.isObject({}));
		assert.strictEqual(true, FHIRUtils.isObject([]));
		assert.strictEqual(true, FHIRUtils.isObject(new Date()));
	});

	QUnit.test("is path requestable", function(assert) {
		var bBindingInfoNotRequestable = FHIRUtils.isRequestable("/Patient/123/name");
		var bBindingInfoRequestable = FHIRUtils.isRequestable("/Patient/123");
		var bBindingInfoRequestable2 = FHIRUtils.isRequestable("/Patient");
		var bBindingInfoRequestable3 = FHIRUtils.isRequestable("/Patient/123/_history");
		assert.strictEqual(bBindingInfoNotRequestable, false, "The absolute path is not requestable");
		assert.strictEqual(bBindingInfoRequestable, true, "The absolute path is requestable");
		assert.strictEqual(bBindingInfoRequestable2, true, "The absolute path is requestable");
		assert.strictEqual(bBindingInfoRequestable3, true, "The absolute path is requestable");
	});

	QUnit.test("Test function isEmptyObject", function(assert) {
		var oEmptyObject = {};
		var oNotEmptyObject = {test: "1"};
		var oUndefinedObject;
		var oNullObject = null;

		assert.strictEqual(FHIRUtils.isEmptyObject(oEmptyObject), true);
		assert.strictEqual(FHIRUtils.isEmptyObject(oNotEmptyObject), false);
		assert.strictEqual(FHIRUtils.isEmptyObject(oUndefinedObject), true);
		assert.strictEqual(FHIRUtils.isEmptyObject(oNullObject), true);
	});

	QUnit.test("Test function isSubset for arrays of type string", function(assert) {
		// positives
		var aStringCollection = [
			"test",
			"test1",
			"test2",
			"test3",
			"test4",
			"test5",
			"test6",
			"test7"
		];
		var aStringSubCollection1 = [
			"test",
			"test1",
			"test2",
			"test3"
		];
		var aStringSubCollection2 = ["test", "test7"];
		var aStringSubCollection3 = ["test"];
		var aStringSubCollection4 = ["test7"];
		var aStringSubCollection5 = [
			"test2",
			"test3",
			"test4"
		];
		var aStringSubCollection6 = [
			"test1",
			"test4",
			"test6"
		];

		// negatives
		var aStringSubCollection7 = [
			"test0",
			"test",
			"test1",
			"test2",
			"test3"
		];
		var aStringSubCollection8 = ["test0", "test7"];
		var aStringSubCollection9 = ["test", "test8"];
		var aStringSubCollection10 = ["test0"];
		var aStringSubCollection11 = [
			"test2",
			"test3",
			"test0",
			"test4"
		];

		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection1, aStringCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection2, aStringCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection3, aStringCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection4, aStringCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection5, aStringCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection6, aStringCollection), true);

		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection7, aStringCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection8, aStringCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection9, aStringCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection10, aStringCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aStringSubCollection11, aStringCollection), false);
	});

	QUnit.test("Test function isSubset for arrays of type number", function(assert) {
		// positives
		var aNumberCollection = [
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18
		];
		var aNumberSubCollection1 = [
			10,
			11,
			12,
			13
		];
		var aNumberSubCollection2 = [10, 18];
		var aNumberSubCollection3 = [10];
		var aNumberSubCollection4 = [18];
		var aNumberSubCollection5 = [
			11,
			12,
			13
		];
		var aNumberSubCollection6 = [
			11,
			14,
			17
		];

		// negatives
		var aNumberSubCollection7 = [
			9,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18
		];
		var aNumberSubCollection8 = [9, 18];
		var aNumberSubCollection9 = [10, 19];
		var aNumberSubCollection10 = [9];
		var aNumberSubCollection11 = [
			11,
			13,
			19,
			16,
			17
		];

		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection1, aNumberCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection2, aNumberCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection3, aNumberCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection4, aNumberCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection5, aNumberCollection), true);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection6, aNumberCollection), true);

		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection7, aNumberCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection8, aNumberCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection9, aNumberCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection10, aNumberCollection), false);
		assert.strictEqual(FHIRUtils.isSubset(aNumberSubCollection11, aNumberCollection), false);

	});

	QUnit.test("Test function countOccurrence", function(assert) {
		assert.throws(function(){
			return FHIRUtils.countOccurrence(undefined);
		}, new Error("sBase is undefined"));
		assert.throws(function(){
			return FHIRUtils.countOccurrence({});
		}, new Error("sBase is not a string"));
	});

	QUnit.test("Test function checkPathParameter", function(assert) {
		var mParam = { "foo" : "/notallowed", "foo2" : "alsonotallowed/" };
		assert.throws(function(){
			return FHIRUtils.checkPathParameter(mParam, "foo");
		}, new Error("Unsupported parameter: 'foo'. Parameter must not start with a '/'."));
		assert.throws(function(){
			return FHIRUtils.checkPathParameter(mParam, "foo2");
		}, new Error("Unsupported parameter: 'foo2'. Parameter must not end with a '/'."));
	});

	QUnit.test("Test function filterArray", function(assert) {
		var TestObject = function(sId, sDescription, bStatus) {
			this.id = sId;
			this.description = sDescription;
			this.status = bStatus;
		};
		var aTest = TestUtils.createArray(function(iIndex) {
			return new TestObject("_id" + iIndex, "Dummy Description", iIndex % 2 === 0);
		}, 20);

		var aCorrectResult = [ new TestObject("_id3", "Dummy Description", false) ];
		var aResult = FHIRUtils.filterArray(aTest, "id", "_id3");
		assert.deepEqual(aResult, aCorrectResult, "One object was filtered out of the given array.");

		aResult = FHIRUtils.filterArray(aTest, "description", "Dummy Description");
		assert.deepEqual(aResult, aTest, "No object were filtered out of the given array, because all objects are matching.");

		aCorrectResult = [];
		for (var i = 0; i < 20; i += 2) {
			aCorrectResult.push(new TestObject("_id" + i, "Dummy Description", true));
		}
		aResult = FHIRUtils.filterArray(aTest, "status", true);
		assert.deepEqual(aResult, aCorrectResult, "Multiple objects were filtered out of the given array.");

		aCorrectResult = [];
		aResult = FHIRUtils.filterArray(aTest, "description", "Wrong Description");
		assert.deepEqual(aResult, aCorrectResult, "All objects were filtered out of the given array, because no value matches the given string.");

		aCorrectResult = [];
		aResult = FHIRUtils.filterArray(aTest, "gender", "male");
		assert.deepEqual(aResult, aCorrectResult, "All objects were filtered out of the given array, because no object contains a property with the given name.");
	});

	QUnit.test("Test function deepclone", function(assert) {
		// Note: creation of objects with deeper levels than 8, will lead to overflow the memory stack
		for (var i = 0; i < 10; i++) {
			var oNewObject = TestUtils.createRandomObject(20, 5);
			var oClonedObject = FHIRUtils.deepClone(oNewObject);
			assert.deepEqual(oClonedObject, oNewObject, "The cloned object is equal with the created one.");
		}
	});

	QUnit.test("Test function deepClone for Date", function(assert) {
		var oDate = new Date(2000,1,1);
		var oNewDate = FHIRUtils.deepClone(oDate);
		oDate.setYear(2001);
		assert.strictEqual(oNewDate.getFullYear(), 2000);
		assert.strictEqual(oDate.getFullYear(), 2001);
	});

	QUnit.test("Test function uuidv4", function(assert) {
		var aNewUuidV4 = [];
		var iNumberOfUuids = 1000;
		var rUuidV4Regex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

		for (var i = 0; i < iNumberOfUuids; i++) {
			aNewUuidV4[i] = FHIRUtils.uuidv4();
		}

		aNewUuidV4.forEach(function(sUuid) {
			var bIsUuidV4Correct = rUuidV4Regex.test(sUuid);
			assert.ok(bIsUuidV4Correct, "The generated version 4 based UUID '" + sUuid + "' " + "is " + (bIsUuidV4Correct ? "" : "not ") + "valid.");
		});
	});

	QUnit.test("Test isBinding methods", function(assert) {
		var oModel = TestUtils.createFHIRModel("https://example.com/fhir");
		var oContextBinding = oModel.bindContext("/Patient");
		var oPropertyBinding = oModel.bindProperty("/Patient/123/name");
		assert.strictEqual(FHIRUtils.isPropertyBinding(oPropertyBinding), true);
		assert.strictEqual(FHIRUtils.isPropertyBinding(oContextBinding), false);
		assert.strictEqual(FHIRUtils.isContextBinding(oContextBinding), true);
		assert.strictEqual(FHIRUtils.isContextBinding(oPropertyBinding), false);
	});

	QUnit.test("Test function checkRegularExpression", function(assert) {
		var rRegExp = /^http:\/\/sap.com\/myapp\/123\?use=dev$/g;
		var sValidUrl = "http://sap.com/myapp/123?use=dev";
		assert.strictEqual(FHIRUtils.checkRegularExpression(sValidUrl, rRegExp), true);

		var sFailedUrl = "http://sap.com/454/myapp/123?use=dev";
		assert.strictEqual(FHIRUtils.checkRegularExpression(sFailedUrl, rRegExp), false);

		sFailedUrl = "111http://sap.com/myapp/123?use=dev";
		assert.strictEqual(FHIRUtils.checkRegularExpression(sFailedUrl, rRegExp), false);

		sFailedUrl = "http://sap.com/myapp/123?use=devAA";
		assert.strictEqual(FHIRUtils.checkRegularExpression(sFailedUrl, rRegExp), false);

		assert.throws(function(){
			return FHIRUtils.checkRegularExpression("", "");
		}, new Error("Empty string. Can not check the regular expression:  for an undefined text."));
		assert.throws(function(){
			return FHIRUtils.checkRegularExpression("foo", "");
		}, new Error("Empty regular expression"));
	});

	QUnit.test("Test function splitPath", function(assert) {
		var sPath = "/Patient/12ade3/gender";
		var aPath = [
			"",
			"Patient",
			"12ade3",
			"gender"
		];
		assert.deepEqual(FHIRUtils.splitPath(sPath), aPath);

		sPath = "/Patient/12ade3/name/0/given/1";
		aPath = [
			"",
			"Patient",
			"12ade3",
			"name",
			"0",
			"given",
			"1"
		];
		assert.deepEqual(FHIRUtils.splitPath(sPath), aPath);

		sPath = "/Patient/12ade3/name/[use=nickname]/family";
		aPath = [
			"",
			"Patient",
			"12ade3",
			"name",
			"[use=nickname]",
			"family"
		];
		assert.deepEqual(FHIRUtils.splitPath(sPath), aPath);

		sPath = "/Claim/12ade3/extension/[url=http://hl7.org/fhir/StructureDefinition/CommentForClaimItem]/extension/[url=code]/valueCodeableConcept/text";
		aPath = [
			"",
			"Claim",
			"12ade3",
			"extension",
			"[url=http://hl7.org/fhir/StructureDefinition/CommentForClaimItem]",
			"extension",
			"[url=code]",
			"valueCodeableConcept",
			"text"
		];
		assert.deepEqual(FHIRUtils.splitPath(sPath), aPath);
	});

	QUnit.test("Test function getIndexOfValueInArray", function(assert) {
		// negative tests
		assert.equal(FHIRUtils.getIndexOfValueInArray(undefined, {}), -1);
		assert.equal(FHIRUtils.getIndexOfValueInArray(undefined, ""), -1);
		assert.equal(FHIRUtils.getIndexOfValueInArray(undefined, 1), -1);

		// Test for values with type Object
		var oObject1 = {name: "Peter", age: 80, lastModified: new Date()};
		var oObject2 = {name: "Hans", age: 67, lastModified: new Date()};
		var oObject3 = {name: "Marie", age: 20, lastModified: new Date()};
		var oObject3a = {name: "Marie", age: 20, lastModified: new Date()};
		var oObject4 = {name: "Jule", age: 25, lastModified: new Date()};
		var oObject5 = {name: "Max", age: 12, lastModified: new Date()};

		var aObject = [];
		aObject.push(oObject1);
		aObject.push(oObject2);
		aObject.push(oObject3);
		aObject.push(oObject3a);
		aObject.push(oObject4);

		var iIndexOfObject1 = FHIRUtils.getIndexOfValueInArray(oObject1, aObject);
		var iIndexOfObject2 = FHIRUtils.getIndexOfValueInArray(oObject2, aObject);
		var iIndexOfObject3 = FHIRUtils.getIndexOfValueInArray(oObject3, aObject);
		var iIndexOfObject3a = FHIRUtils.getIndexOfValueInArray(oObject3a, aObject);
		var iIndexOfObject4 = FHIRUtils.getIndexOfValueInArray(oObject4, aObject);
		var iIndexOfObject5 = FHIRUtils.getIndexOfValueInArray(oObject5, aObject);

		assert.equal(iIndexOfObject1, 0);
		assert.equal(iIndexOfObject2, 1);
		assert.equal(iIndexOfObject3, 2);
		assert.equal(iIndexOfObject3a, 2);
		assert.equal(iIndexOfObject4, 4);
		assert.equal(iIndexOfObject5, -1);

		// Test for values with type String
		var sString1 = "Peter";
		var sString2 = "Hans";
		var sString3 = "Marie";
		var sString3a = "Marie";
		var sString4 = "Jule";
		var sString5 = "Max";

		var aString = [];
		aString.push(sString1);
		aString.push(sString2);
		aString.push(sString3);
		aString.push(sString3a);
		aString.push(sString4);

		var iIndexOfString1 = FHIRUtils.getIndexOfValueInArray(sString1, aString);
		var iIndexOfString2 = FHIRUtils.getIndexOfValueInArray(sString2, aString);
		var iIndexOfString3 = FHIRUtils.getIndexOfValueInArray(sString3, aString);
		var iIndexOfString3a = FHIRUtils.getIndexOfValueInArray(sString3a, aString);
		var iIndexOfString4 = FHIRUtils.getIndexOfValueInArray(sString4, aString);
		var iIndexOfString5 = FHIRUtils.getIndexOfValueInArray(sString5, aString);

		assert.equal(iIndexOfString1, 0);
		assert.equal(iIndexOfString2, 1);
		assert.equal(iIndexOfString3, 2);
		assert.equal(iIndexOfString3a, 2);
		assert.equal(iIndexOfString4, 4);
		assert.equal(iIndexOfString5, -1);

		// Test for values with type Number
		var iNumber1 = 80;
		var iNumber2 = 67;
		var iNumber3 = 20;
		var iNumber3a = 20;
		var iNumber4 = 25;
		var iNumber5 = 12;

		var aNumber = [];
		aNumber.push(iNumber1);
		aNumber.push(iNumber2);
		aNumber.push(iNumber3);
		aNumber.push(iNumber3a);
		aNumber.push(iNumber4);

		var iIndexOfNumber1 = FHIRUtils.getIndexOfValueInArray(iNumber1, aNumber);
		var iIndexOfNumber2 = FHIRUtils.getIndexOfValueInArray(iNumber2, aNumber);
		var iIndexOfNumber3 = FHIRUtils.getIndexOfValueInArray(iNumber3, aNumber);
		var iIndexOfNumber3a = FHIRUtils.getIndexOfValueInArray(iNumber3a, aNumber);
		var iIndexOfNumber4 = FHIRUtils.getIndexOfValueInArray(iNumber4, aNumber);
		var iIndexOfNumber5 = FHIRUtils.getIndexOfValueInArray(iNumber5, aNumber);

		assert.equal(iIndexOfNumber1, 0);
		assert.equal(iIndexOfNumber2, 1);
		assert.equal(iIndexOfNumber3, 2);
		assert.equal(iIndexOfNumber3a, 2);
		assert.equal(iIndexOfNumber4, 4);
		assert.equal(iIndexOfNumber5, -1);

		// Test for values with type Array
		var aArray1 = ["Peter", "Hans"];
		var aArray2 = ["Marie", "Jule"];
		var aArray3 = ["Max", "David"];
		var aArray3a = ["Max", "David"];
		var aArray4 = ["Steve", "Max"];
		var aArray5 = ["Jenny", "Max"];

		var aArray = [];
		aArray.push(aArray1);
		aArray.push(aArray2);
		aArray.push(aArray3);
		aArray.push(aArray3a);
		aArray.push(aArray4);

		var iIndexOfArray1 = FHIRUtils.getIndexOfValueInArray(aArray1, aArray);
		var iIndexOfArray2 = FHIRUtils.getIndexOfValueInArray(aArray2, aArray);
		var iIndexOfArray3 = FHIRUtils.getIndexOfValueInArray(aArray3, aArray);
		var iIndexOfArray3a = FHIRUtils.getIndexOfValueInArray(aArray3a, aArray);
		var iIndexOfArray4 = FHIRUtils.getIndexOfValueInArray(aArray4, aArray);
		var iIndexOfArray5 = FHIRUtils.getIndexOfValueInArray(aArray5, aArray);

		assert.equal(iIndexOfArray1, 0);
		assert.equal(iIndexOfArray2, 1);
		assert.equal(iIndexOfArray3, 2);
		assert.equal(iIndexOfArray3a, 2);
		assert.equal(iIndexOfArray4, 4);
		assert.equal(iIndexOfArray5, -1);

		// Test for values of type Date
		var oDate1 = new Date(2018, 11, 24);
		var oDate2 = new Date(2018, 11, 25);
		var oDate3 = new Date(2018, 11, 26);
		var oDate3a = new Date(2018, 11, 26);
		var oDate4 = new Date(2018, 11, 27);
		var oDate5 = new Date(2018, 11, 28);

		var aDate = [];
		aDate.push(oDate1);
		aDate.push(oDate2);
		aDate.push(oDate3);
		aDate.push(oDate3a);
		aDate.push(oDate4);

		var iIndexOfDate1 = FHIRUtils.getIndexOfValueInArray(oDate1, aDate);
		var iIndexOfDate2 = FHIRUtils.getIndexOfValueInArray(oDate2, aDate);
		var iIndexOfDate3 = FHIRUtils.getIndexOfValueInArray(oDate3, aDate);
		var iIndexOfDate3a = FHIRUtils.getIndexOfValueInArray(oDate3a, aDate);
		var iIndexOfDate4 = FHIRUtils.getIndexOfValueInArray(oDate4, aDate);
		var iIndexOfDate5 = FHIRUtils.getIndexOfValueInArray(oDate5, aDate);

		assert.equal(iIndexOfDate1, 0);
		assert.equal(iIndexOfDate2, 1);
		assert.equal(iIndexOfDate3, 2);
		assert.equal(iIndexOfDate3a, 2);
		assert.equal(iIndexOfDate4, 4);
		assert.equal(iIndexOfDate5, -1);
	});

	QUnit.test("Test function addRequestQueryParameters ", function(assert){
		var mRequestParameters = {};
		var oBindingMock = {mParameters: { request: {}}};
		FHIRUtils.addRequestQueryParameters(oBindingMock, mRequestParameters);
		assert.deepEqual(mRequestParameters.urlParameters, {});
	});

	QUnit.test("Test function generateFullUrl ", function (assert) {
		var sFullUrl = FHIRUtils.generateFullUrl(TestUtils.createUri("uuid"), "/Patient/123", "123", "http://example.com");
		var rUUIDTypeRegex = /^(urn):(uuid):[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
		assert.strictEqual(true, FHIRUtils.checkRegularExpression(sFullUrl, rUUIDTypeRegex));
		sFullUrl = FHIRUtils.generateFullUrl(TestUtils.createUri("uuid"), "/Patient/f1db03d0-9414-49ea-8554-cdbdede32c98", "f1db03d0-9414-49ea-8554-cdbdede32c98", "http://example.com");
		assert.strictEqual("urn:uuid:f1db03d0-9414-49ea-8554-cdbdede32c98", sFullUrl);
		sFullUrl = FHIRUtils.generateFullUrl(undefined, "/Patient/123", "123", "http://example.com");
		assert.strictEqual(sFullUrl, undefined);
		sFullUrl = FHIRUtils.generateFullUrl(TestUtils.createUri("url"), "/Patient/123", "123", "http://example.com");
		assert.strictEqual(sFullUrl, "http://example.com/Patient/123");
	});

	QUnit.test("Test getIDsFromOperationOutcomes", function(assert) {
		var operationOutcomes = {
			"0": {
				"_sResourceType": "OperationOutcome",
				"_aIssue": [
					{
						"severity": "error",
						"code": "conflict",
						"details": {
							"text": "Referenced resource exist '7b4abf15-8a93-4e11-8d85-96c945530d05' for resource 'RolePermission}'"
						},
						"diagnostics": "Referenced resource exist '7b4abf15-8a93-4e11-8d85-96c945530d05' for resource 'RolePermission}'"
					}
				]
			}
		};
		var expectedIds = ["7b4abf15-8a93-4e11-8d85-96c945530d05"];

		var actualIds = FHIRUtils.getsIdFromOperationOutcome(operationOutcomes);

		assert.deepEqual(actualIds, expectedIds, "IDs extracted correctly from operationOutcomes");
	});

	QUnit.test("Test filterResourcesByIds", function (assert) {
		var resources = [
			{ id: "1", name: "Resource 1" },
			{ id: "2", name: "Resource 2" },
			{ id: "3", name: "Resource 3" }
		];
		var sIds = ["2"];
		var filteredResources = FHIRUtils.filterResourcesByIds(resources, sIds);
		assert.deepEqual(filteredResources, [{ id: "1", name: "Resource 1" }, { id: "3", name: "Resource 3" }], "Filtered resources should match expected result");
	});

});