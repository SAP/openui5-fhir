/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilterComplexOperator
sap.ui.define(["sap/fhir/model/r4/FHIRFilterOperator"], function (FHIRFilterOperator) {

	"use strict";

	/**
	 * Operators for the FHIR Complex Filter. Documentation https://www.hl7.org/fhir/search_filter.html#ops
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.fhir.model.r4.FHIRFilterComplexOperator
	 * @extends sap.ui.model.FHIRFilterOperator
	 */
	var FHIRFilterComplexOperator = {
		/**
		 * The set is empty or not (value is false or true)
		 *
		 * @public
		 */
		PR: "pr",

		/**
		 * If a (implied) date period in the set overlaps with the implied period in the value
		 *
		 * @public
		 */
		PO: "po",

		/**
		 * If the value subsumes a concept in the set
		 *
		 * @public
		 */
		SS: "ss",

		/**
		 * If the value is subsumed by a concept in the set
		 *
		 * @public
		 */
		SB: "sb",

		/**
		 * If one of the concepts is in the nominated value set by URI, either a relative, literal or logical vs
		 *
		 * @public
		 */
		IN: "in",

		/**
		 * If none of the concepts is in the nominated value set by URI, either a relative, literal or logical vs
		 *
		 * @public
		 */
		NI: "ni",

		/**
		 * If one of the references in set points to the given URL
		 *
		 * @public
		 */
		RE: "re"
	};

	// merge the FHIR FilterOperator object into the FHIRFilterComplexOperator
	return Object.assign(FHIRFilterComplexOperator, FHIRFilterOperator);
});