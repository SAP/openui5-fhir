/*!
 * ${copyright}
 */

/**
 * @class This class is an abstract base class for all FHIR URI primitive types
 * (see {@link https://www.hl7.org/fhir/R4/datatypes.html#uri URI})
 * @abstract
 *  All Sub types would implement this class
 * @extends sap.ui.model.SimpleType
 * @namespace
 * @alias sap.fhir.model.r4.type.URI
 * @author SAP SE
 * @public
 * @since 1.1.0
 * @version ${version}
 */

sap.ui.define(["sap/ui/model/SimpleType"],function(SimpleType) {
	"use strict";

	/**
	 * URI DataTypes
	 *
	 */
	var URI = SimpleType.extend("sap.fhir.model.r4.type.URI", {

		constructor : function (oFormatOptions, oConstraints) {
			// do not call super constructor to avoid generation of unused objects
		},
		metadata : {
			"abstract" : true
		}
	    }
	);

	/**
	 * @see sap.ui.base.Object#getInterface
	 *
	 * @returns {object} this
	 * @public
	 */
	URI.prototype.getInterface = function () {
		return this;
	};

	/**
	 * FHIR URI Types are immutable and do not allow modifying the type's constraints.
	 * This function overwrites the <code>setConstraints</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}.
	 * @private
	 */
	URI.prototype.setConstraints = function (oConstraints) {
		// do nothing!
	};

	/**
	 * URI Types are immutable and do not allow modifying the type's format options.
	 * This function overwrites the <code>setFormatOptions</code> of
	 * <code>sap.ui.model.SimpleType</code> and does nothing.
	 *
	 * @param {object} [oFormatOptions]
	 *   format options, see {@link #constructor}.
	 * @private
	 */
	URI.prototype.setFormatOptions = function (oFormatOptions) {
		// do nothing!
	};

	/**
	 * Default Implementation which can be overriden in subtypes
	 *
	 * @param {string} sValue Some value e.g. '123'
	 * @returns {boolean} True, if the expression matches the regex.
	 * @protected
	 * @since 1.1.0
	 */
	URI.prototype.validateValue = function (sValue) {
		return true;
	};

	return URI;

});