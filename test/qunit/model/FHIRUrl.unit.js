sap.ui.define(["sap/fhir/model/r4/lib/FHIRUrl"], function(FHIRUrl) {
	"use strict";

	QUnit.module("Unit-Tests: FHIRUrl", {});
	QUnit.test("Test FHIRUrl", function(assert){

		/*
		* test with model with absolute service url
		*/

		// test with service url
		var sServiceUrl = "https://example.com/fhir";
		var sUrl = "https://example.com/fhir";
		var oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), undefined);
		assert.strictEqual(oFHIRUrl.getResourceType(), undefined);
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);

		// test with service url and query parameter
		sUrl = "https://example.com/fhir?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), undefined);
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);

		// test with absolute url, resource type
		sUrl = "https://example.com/fhir/Patient?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);

		// test with absolute url, resource type, resource id and query parameter
		sUrl = "https://example.com/fhir/Patient/1234?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");

		// test with bundle entry
		sUrl = "Patient/1234?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");

		// test with _history
		sUrl = "Patient/1234/_history/1?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234/_history/1");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234/_history/1?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");
		assert.strictEqual(oFHIRUrl.getHistoryVersion(), "1");
		assert.strictEqual(oFHIRUrl.getFullUrl(), "https://example.com/fhir/Patient/1234");
		assert.strictEqual(oFHIRUrl.getFullUrl("http://test.com/fhir/Patient/1234"), "http://test.com/fhir/Patient/1234");
		assert.strictEqual(oFHIRUrl.getFullUrl("http://test.com/fhir/Patient/1234?param=value1"), "http://test.com/fhir/Patient/1234");
		assert.strictEqual(oFHIRUrl.getFullUrl("Patient/XYZ"), "https://example.com/fhir/Patient/1234");

		/*
		* test with model with relative service url
		*/

		//  test with service url
		sServiceUrl = "/fhir";
		sUrl = "https://example.com/fhir";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), undefined);
		assert.strictEqual(oFHIRUrl.getResourceType(), undefined);
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);

		// test with service url and query parameter
		sServiceUrl = "/fhir";
		sUrl = "https://example.com/fhir?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), undefined);
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);

		// test with absolute url, resource type
		sUrl = "https://example.com/fhir/Patient?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);

		// test with absolute url, resource type, resource id and query parameter
		sUrl = "https://example.com/fhir/Patient/1234?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");

		// test with bundle entry
		sUrl = "Patient/1234?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");

		// test with _history
		sUrl = "Patient/1234/_history/1?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234/_history/1");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234/_history/1?param1=2&param2=test");
		assert.deepEqual(oFHIRUrl.getQueryParameters(), {param1: "2", param2: "test"});
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");
		assert.strictEqual(oFHIRUrl.getHistoryVersion(), "1");
		assert.strictEqual(oFHIRUrl.getFullUrl(), undefined);
		assert.strictEqual(oFHIRUrl.getFullUrl("http://test.com/fhir/Patient/1234"), "http://test.com/fhir/Patient/1234");
		assert.strictEqual(oFHIRUrl.getFullUrl("http://test.com/fhir/Patient/1234?param=value1"), "http://test.com/fhir/Patient/1234");
		assert.strictEqual(oFHIRUrl.getFullUrl("Patient/XYZ"), undefined);

		// test with custom operation
		sUrl = "Patient/1234/$look-up";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/1234/$look-up");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/1234/$look-up");
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "1234");
		assert.strictEqual(oFHIRUrl.getCustomOperation(), "$look-up");

		// test with custom operation
		sUrl = "Patient/$look-up";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/$look-up");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/$look-up");
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);
		assert.strictEqual(oFHIRUrl.getCustomOperation(), "$look-up");

		// test with next page link
		sUrl = "http://example.com/fhir/Patient/123?param1=2&param2=test";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/Patient/123");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/Patient/123?param1=2&param2=test");
		assert.strictEqual(oFHIRUrl.getResourceType(), "Patient");
		assert.strictEqual(oFHIRUrl.getResourceId(), "123");
		assert.strictEqual(oFHIRUrl.getCustomOperation(), undefined);

		// test with metadata endpoint
		sUrl = "/metadata";
		oFHIRUrl = new FHIRUrl(sUrl, sServiceUrl);
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithoutQueryParameters(), "/metadata");
		assert.strictEqual(oFHIRUrl.getRelativeUrlWithQueryParameters(), "/metadata");
		assert.strictEqual(oFHIRUrl.getResourceType(), "metadata");
		assert.strictEqual(oFHIRUrl.getResourceId(), undefined);
		assert.strictEqual(oFHIRUrl.getCustomOperation(), undefined);
		assert.strictEqual(oFHIRUrl.isMetadataRequest(), true);
	});
});