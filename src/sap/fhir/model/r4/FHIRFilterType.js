/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilterType
sap.ui.define(function() {

	"use strict";

	/**
	 * FHIRFilter value type
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.fhir.model.r4.FHIRFilterType
	 */
	var FHIRFilterType = {
		/**
		 * @public
		 */
		string : "string",
		/**
		 * @public
		 */
		date: "date",
		/**
		 * @public
		 */
		number: "number"
	};

	return FHIRFilterType;
});