/*!
 * ${copyright}
 */

/** A Uuid (aka GUID) represented as a Uri (RFC 4122 ); e.g. urn:uuid:c757873d-ec9a-4326-a141-556f43239520
 * @class
 * @final
 * @extends sap.fhir.model.r4.type.Uri
 * @alias sap.fhir.model.r4.type.Uuid
 * @author SAP SE
 * @protected
 * @since 1.1.0
 * @version ${version}
 */

sap.ui.define(["sap/fhir/model/r4/type/Uri", "sap/fhir/model/r4/FHIRUtils"], function (Uri, FHIRUtils) {
	"use strict";

	/**
	 * FHIR Uuid DataType
	 *
	 */
	var Uuid = Uri.extend("sap.fhir.model.r4.type.Uri", {

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
	Uuid.prototype.getName = function () {
		return "sap.fhir.model.r4.type.Uuid";
	};

	/**
	 * Returns the type's readable string.
	 *
	 * @returns {string} the type's name
	 * @protected
	 * @since 1.1.0
	 */
	Uuid.prototype.toString = function () {
		return "uuid";
	};

	/**
	 * Determines if the given value is of type Uuid v4
	 *
	 * @param {string} sValue Some value e.g. '123'
	 * @returns {boolean} True, if the expression matches the regex.
	 * @protected
	 * @since 1.1.0
	 */
	Uuid.prototype.validateValue = function (sValue) {
		return FHIRUtils.checkRegularExpression(sValue, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
	};

	return Uuid;
});
