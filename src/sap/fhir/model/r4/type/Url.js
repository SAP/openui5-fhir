/*!
 * ${copyright}
 */

/**A Uniform Resource Locator (RFC 1738 ). e.g 'http://abc.com"
 * @class
 * @final
 * @extends sap.fhir.model.r4.type.Uri
 * @alias sap.fhir.model.r4.type.Url
 * @author SAP SE
 * @protected
 * @since 1.1.0
 * @version ${version}
 */

sap.ui.define(["sap/fhir/model/r4/type/Uri"], function (Uri) {
	"use strict";

	/**
	 * FHIR Url DataType
	 *
	 */
	var Url = Uri.extend("sap.fhir.model.r4.type.Uri", {

		constructor: function (oFormatOptions, oConstraints) {
			Uri.apply(this, arguments);
		}

	});

	/**
	 * Returns the type's name.
	 *
	 * @returns {string} the type's name
	 * @protected
	 * @since 1.1.0
	 */
	Url.prototype.getName = function () {
		return "sap.fhir.model.r4.type.Url";
	};

	/**
	 * Returns the type's readable string.
	 *
	 * @returns {string} the type's name
	 * @protected
	 * @since 1.1.0
	 */
	Url.prototype.toString = function () {
		return "url";
	};

	return Url;

});
