/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilterOperator
sap.ui.define(["sap/ui/model/FilterOperator"], function(FilterOperator) {

	"use strict";

	/**
	 * Operators for the FHIR Filter. Documentation https://www.hl7.org/fhir/search.html#modifiers and https://www.hl7.org/fhir/search.html#prefix
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.fhir.model.r4.FHIRFilterOperator
	 * @extends sap.ui.model.FilterOperator
	 */
	var FHIRFilterOperator = {
		/**
		 * FHIRFilterOperator missing
		 *
		 * @public
		 */
		Missing: "Missing",
		/**
		 * starts-after
		 * e.g.: sa2013-03-14
		 * @public
		 */
		SA: "sa",
		/**
		 * ends-before
		 * e.g.: eb2013-03-14
		 *
		 * @public
		 */
		EB: "eb",
		/**
		 * approximately the same to the provided value, but with 10% of the stated value (or for a date, 10% of the gap between now and the date)
		 * e.g.: ap2013-03-14
		 *
		 * @public
		 */
		AP: "ap",
		/**
		 * The set is empty or not (value is false or true)
		 *
		 * @public
		 */
		PR: "pr",
		/**
		 * if a (implied) date period in the set overlaps with the implied period in the value
		 *
		 * @public
		 */
		PO: "po",
		/**
		 * if the value subsumes a concept in the set
		 *
		 * @public
		 */
		SS: "ss",
		/**
		 * if the value is subsumed by a concept in the set
		 *
		 * @public
		 */
		SB: "sb",
		/**
		 * if one of the concepts is in the nominated value set by URI, either a relative, literal or logical vs
		 *
		 * @public
		 */
		IN: "in",
		/**
		 * if none of the concepts is in the nominated value set by URI, either a relative, literal or logical vs
		 *
		 * @public
		 */
		NI: "ni",
		/**
		 * if one of the references in set points to the given URL
		 *
		 * @public
		 */
		RE: "re"
	};

	// merge the UI5 FilterOperator object into the FHIRFilterOperator
	return Object.assign(FHIRFilterOperator, FilterOperator);
});