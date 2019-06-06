sap.ui.define(["sap/base/util/merge", "sap/fhir/model/r4/FHIRModel"], function (merge, FHIRModel) {
	"use strict";
	var TestUtils = {};

	/**
	 * Creates a new object with random data Note: creation of objects with deeper levels than 8, will lead to overflow the memory stack (tested with google chorme)
	 *
	 * @public
	 * @param {number} iNumberOfFields - The number of fields which the object contains shall contain
	 * @param {number} iLevel - The number of levels which a object structure can have as field value
	 * @returns {object} oRandomObject
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
	 * @public
	 * @param {number} iLowerLimit - The lower limit (inclusive)
	 * @param {number} iUpperLimit - The upper limit (exclusive)
	 * @returns {number} iRandomInteger
	 */
	TestUtils.randomInt = function (iLowerLimit, iUpperLimit) {
		return Math.floor((Math.random() * (iUpperLimit - iLowerLimit)) + iLowerLimit);
	};

	/**
	 * Creates random string with upper and lower case chars
	 *
	 * @public
	 * @param {number} iLength - The length of the string
	 * @returns {string} iRandomString
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
	 * @public
	 * @param {function} fGenerateEntity - The function to create an entity
	 * @param {number} iLength - The length of the array
	 * @returns {array} oRandomArray
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
	 * @public
	 * @returns {object} oRandomObject
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
	 * @param {object} oObject The object to be cloned
	 * @returns {object} The cloned object
	 * @public
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
	 * @param {string} sUrl The url which might contain url parameters
	 * @returns {object} The map containing the url parameters
	 * @private
	 * @since 0.0.2
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


	TestUtils.createFHIRModel = function(sServiceBaseUrl, mParameters) {
		return new FHIRModel(sServiceBaseUrl, mParameters);
	};

	return TestUtils;

});