sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/util/merge",
	"sap/fhir/model/r4/FHIRModel",
	"sap/fhir/model/r4/lib/RequestHandle"
], function (jQuery, merge, FHIRModel, RequestHandle) {
	"use strict";
	var TestUtils = {};

	/**
	 * Creates a new object with random data Note: creation of objects with deeper levels than 8, will lead to overflow the memory stack (tested with google chorme)
	 *
	 * @protected
	 * @param {number} iNumberOfFields The number of fields which the object contains shall contain
	 * @param {number} iLevel The number of levels which a object structure can have as field value
	 * @returns {object} oRandomObject
	 * @since 1.0.0
	 */
	TestUtils.createRandomObject = function (iNumberOfFields, iLevel) {
		var oRandomObject = {};
		for (var i = 0; i < iNumberOfFields; i++) {
			var oGeneratedField;
			switch (this.randomInt(0, iLevel > 0 ? 7 : 6)) {
				// null
				case 0:
					oGeneratedField = null;
					break;
					// boolean
				case 1:
					oGeneratedField = Math.random() < 0.5 ? true : false;
					break;
					// integer
				case 2:
					oGeneratedField = this.randomInt(0, 1000);
					break;
					// float
				case 3:
					oGeneratedField = Math.random();
					break;
					// string
				case 4:
					oGeneratedField = this.randomString(this.randomInt(0, 20));
					break;
					// array
				case 5:
					oGeneratedField = this.createArray(this.createSimpleRandomObject.bind(this), this.randomInt(0, 10));
					break;
					// object
				case 6:
					oGeneratedField = this.createRandomObject(iNumberOfFields, iLevel - 1);
					break;
				default:
					throw Error("API misuse: The maximum level is 6.");
			}
			// add field with a random label
			oRandomObject[this.randomString(10)] = oGeneratedField;
		}
		return oRandomObject;
	};

	/**
	 * Creates a random integer value between two digits
	 *
	 * @protected
	 * @param {number} iLowerLimit The lower limit (inclusive)
	 * @param {number} iUpperLimit The upper limit (exclusive)
	 * @returns {number} iRandomInteger
	 * @since 1.0.0
	 */
	TestUtils.randomInt = function (iLowerLimit, iUpperLimit) {
		return Math.floor((Math.random() * (iUpperLimit - iLowerLimit)) + iLowerLimit);
	};

	/**
	 * Creates random string with upper and lower case chars
	 *
	 * @protected
	 * @param {number} iLength The length of the string
	 * @returns {string} iRandomString
	 * @since 1.0.0
	 */
	TestUtils.randomString = function (iLength) {
		var sChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var sGeneratedString = "";
		for (var i = 0; i < iLength; i++) {
			sGeneratedString += sChars[this.randomInt(0, sChars.length)];
		}

		return sGeneratedString;
	};

	/**
	 * Creates an array with entities created by the given function
	 *
	 * @protected
	 * @param {function} fGenerateEntity - The function to create an entity
	 * @param {number} iLength - The length of the array
	 * @returns {array} oRandomArray
	 * @since 1.0.0
	 */
	TestUtils.createArray = function (fGenerateEntity, iLength) {
		var aGeneratedArray = [];
		for (var i = 0; i < iLength; i++) {
			aGeneratedArray.push(fGenerateEntity(i));
		}
		return aGeneratedArray;
	};

	/**
	 * Creates an object with one random string property
	 *
	 * @protected
	 * @returns {object} oRandomObject
	 * @since 1.0.0
	 */
	TestUtils.createSimpleRandomObject = function () {
		// create an object with one field
		var oDummyObject = {};
		oDummyObject[this.randomString(this.randomInt(0, 10))] = this.randomString(this.randomInt(0, 20));
		return oDummyObject;
	};

	/**
	 * Creates a full copy of the given <code>oObject</code>
	 *
	 * @protected
	 * @param {object} oObject The object to be cloned
	 * @returns {object} The cloned object
	 * @since 1.0.0
	 */
	TestUtils.deepClone = function (oObject) {
		if (oObject && typeof oObject === "object") {
			if (Array.isArray(oObject)) {
				return merge([], oObject);
			} else if (oObject instanceof Date) {
				return new Date(oObject.getTime());
			} else {
				return merge({}, oObject);
			}
		} else if (oObject) {
			return oObject;
		}
		return undefined;
	};


	/**
	 * Loads the JSON file located on the given <code>sFilePath</code>
	 *
	 * @protected
	 * @param {string} sFilePath The path to the JSON file
	 * @returns {object} The JSON object contained by the loaded file
	 * @since 1.0.0
	 */
	TestUtils.loadJSONFile = function (sFilePath) {
		var oJSON;
		jQuery.ajax({
			url: "../localService/" + sFilePath + ".json",
			async: false,
			dataType: "json",
			success: function (oResponseJSON) {
				oJSON = oResponseJSON;
			}
		});
		return oJSON;
	};

	/**
	 * Determines the url parameters by the url
	 *
	 * @protected
	 * @param {string} sUrl The url which might contain url parameters
	 * @returns {object} The map containing the url parameters
	 * @since 1.0.0
	 */
	TestUtils.getQueryParameters = function (sUrl) {
		if (!sUrl || sUrl.split("?").length !== 2) {
			return undefined;
		}
		var aUrlParameters = sUrl.split("?")[1].split("&");
		var mUrlParameters = {};
		aUrlParameters.forEach(function (sUrlParameter) {
			var aUrlParameter = sUrlParameter.split("=");
			mUrlParameters[aUrlParameter[0]] = aUrlParameter[1];
		});
		return mUrlParameters;
	};

	/**
	 * Creates a new FHIRModel instance
	 *
	 * @protected
	 * @param {string} sServiceBaseUrl The FHIR service base url
	 * @param {object} mParameters The model parameters
	 * @returns {sap.fhir.model.r4.FHIRModel} The newly created FHIRModel instance
	 * @since 1.0.0
	 */
	TestUtils.createFHIRModel = function (sServiceBaseUrl, mParameters) {
		return new FHIRModel(sServiceBaseUrl, mParameters);
	};

	/**
 	 * Creates a request handle with a mocked ajax request
	 *
	 * @protected
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} The request handle
	 * @since 1.0.0
	 */
	TestUtils.createRequestHandle = function () {
		var oRequestHandle = new RequestHandle();
		oRequestHandle.setRequest(TestUtils.createAjaxCallMock());
		return oRequestHandle;
	};

	/**
	 * Creates a mocked ajax request with given <code>mResponseHeaders</code>
	 *
	 * @protected
	 * @param {object} mResponseHeaders The map of response headers
	 * @returns {object} The mocked ajax request
	 * @since 1.0.0
	 */
	TestUtils.createAjaxCallMock = function (mResponseHeaders) {
		var jqXHRMock = {};
		var sResponseHeaders = "";
		for (var sKey in mResponseHeaders) {
			if (mResponseHeaders.hasOwnProperty(sKey)) {
				sResponseHeaders += sKey + ": " + mResponseHeaders[sKey] + "\r\n";
			}
		}
		jqXHRMock.getAllResponseHeaders = function () {
			return sResponseHeaders;
		};
		jqXHRMock.getResponseHeader = function (sKey) {
			return mResponseHeaders[sKey];
		};
		jqXHRMock.state = function () {
			return "";
		};
		return jqXHRMock;
	};

	return TestUtils;

});