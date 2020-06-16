/*!
 * ${copyright}
 */

/** A UUID (aka GUID) represented as a URI (RFC 4122 ); e.g. urn:uuid:c757873d-ec9a-4326-a141-556f43239520
 * @class
 * @final
 * @extends sap.fhir.model.r4.type.URI
 * @alias sap.fhir.model.r4.type.UUID
 * @author SAP SE
 * @public
 * @since 1.1.0
 * @version ${version}
 */

sap.ui.define(["sap/fhir/model/r4/type/URI", "sap/fhir/model/r4/FHIRUtils"], function (URI, FHIRUtils) {
	"use strict";

	/**
	 * FHIR UUID DataType
	 *
	 */
	var UUID = URI.extend("sap.fhir.model.r4.type.URI", {

		constructor: function (oFormatOptions, oConstraints) {
			URI.apply(this, arguments);
		}

	}
	);

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	UUID.prototype.getName = function () {
		return "sap.fhir.model.r4.type.UUID";
	};


	/**
	 * Returns the type's readable string.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	UUID.prototype.toString = function () {
		return "uuid";
	};



	/**
	 * Determines if the given value is of type uuid v4
	 *
	 * @param {string} sValue Some value e.g. '123'
	 * @returns {boolean} True, if the expression matches the regex.
	 * @protected
	 * @since 1.1.0
	 */
	UUID.prototype.validateValue = function (sValue) {
		return FHIRUtils.checkRegularExpression(sValue, /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
	};


	return UUID;
});
