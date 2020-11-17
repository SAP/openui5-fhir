/*!
 * ${copyright}
 */

/**
 * @class This class is an abstract base class for all FHIR Uri primitive types
 * (see {@link https://www.hl7.org/fhir/R4/datatypes.html#Uri Uri})
 * @abstract
 *  All Sub types would implement this class
 * @extends sap.ui.model.SimpleType
 * @namespace
 * @alias sap.fhir.model.r4.type.Uri
 * @author SAP SE
 * @protected
 * @since 1.1.0
 * @version ${version}
 */

sap.ui.define(["sap/ui/model/SimpleType"], function (SimpleType) {
	"use strict";

	/**
	 * Uri DataTypes
	 *
	 */
	var Uri = SimpleType.extend("sap.fhir.model.r4.type.Uri", {

		constructor: function (oFormatOptions, oConstraints) {
			// do not call super constructor to avoid generation of unused objects
		},

		metadata: {
			"abstract": true
		}

	});

	/**
	 * @see sap.ui.base.Object#getInterface
	 *
	 * @returns {object} this
	 * @protected
	 * @since 1.1.0
	 */
	Uri.prototype.getInterface = function () {
		return this;
	};

	/**
	 * FHIR Uri Types are immutable and do not allow modifying the type's constraints.
	 * This function overwrites the <code>setConstraints</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oConstraints] constraints, see {@link #constructor}.
	 * @protected
	 * @since 1.1.0
	 */
	Uri.prototype.setConstraints = function (oConstraints) {
		// do nothing!
	};

	/**
	 * Uri Types are immutable and do not allow modifying the type's format options.
	 * This function overwrites the <code>setFormatOptions</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oFormatOptions] format options, see {@link #constructor}.
	 * @protected
	 * @since 1.1.0
	 */
	Uri.prototype.setFormatOptions = function (oFormatOptions) {
		// do nothing!
	};

	/**
	 * Default Implementation which can be overriden in subtypes
	 *
	 * @param {string} sValue Some value e.g. '123'
	 * @returns {boolean} True
	 * @protected
	 * @since 1.1.0
	 */
	Uri.prototype.validateValue = function (sValue) {
		return true;
	};

	return Uri;

});
