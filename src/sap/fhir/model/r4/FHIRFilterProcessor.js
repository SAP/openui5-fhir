/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilterProcessor
sap.ui.define([
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Filter",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/base/Log"
], function(FilterProcessor, Filter, FHIRFilterOperator, Log) {
	"use strict";

	/**
	 * Constructor for the FHIRFilterProcessor
	 *
	 * @class
	 * @classdesc Helper class for processing of filter objects
	 * @author SAP SE
	 * @alias sap.fhir.model.r4.FHIRFilterProcessor
	 * @private
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRFilterProcessor = {};

	/**
	 * Evaluates the result of a single filter by calling the corresponding
	 * filter function and returning the result.
	 *
	 * @param {sap.ui.model.Filter} oFilter The filter object
	 * @param {object} vRef The reference to the list entry
	 * @param {function} fnGetValue The function to get the value from the list entry
	 * @returns {boolean} Whether the filter matches or not
	 * @protected
	 * @since 1.0.0
	 */
	FHIRFilterProcessor._evaluateFilter = function(oFilter, vRef, fnGetValue){
		var oValue, fnTest;

		FilterProcessor._normalizeCache = { "true": {}, "false": {}};

		if (oFilter.aFilters) {
			return this._evaluateMultiFilter(oFilter, vRef, fnGetValue);
		}
		oValue = fnGetValue(vRef, oFilter.sPath);
		fnTest = this.getFilterFunction(oFilter);

		if (!oFilter.fnCompare || oFilter.bCaseSensitive !== undefined) {
			oValue = FilterProcessor.normalizeFilterValue(oValue, oFilter.bCaseSensitive);
		}

		return fnTest(oValue);
	};

	/**
	 * Provides a JS filter function for the given filter
	 *
	 * @param {sap.ui.model.Filter} oFilter The filter object
	 * @returns {function} JS filter function For the given filter
	 * @protected
	 * @since 1.0.0
	 */
	FHIRFilterProcessor.getFilterFunction = function(oFilter) {
		 if (oFilter.sOperator === FHIRFilterOperator.Missing){
			return function(oValue, oCompare){
				return oValue === oCompare;
			};
		} else {
			return FilterProcessor.getFilterFunction(oFilter);
		}
	 };

	 /**
	  * Evaluates the result of a multi filter, by evaluating contained
	  * filters. Depending on the type (AND/OR) not all contained filters need
	  * to be evaluated.
	  *
	  * @param {sap.ui.model.Filter} oMultiFilter the filter object
	  * @param {object} vRef the reference to the list entry
	  * @param {function} fnGetValue the function to get the value from the list entry
	  * @return {boolean} whether the filter matches or not
	  * @protected
	  * @since 1.0.0
	  */
	 FHIRFilterProcessor._evaluateMultiFilter = function(oMultiFilter, vRef, fnGetValue){
		var that = this,
			bAnd = !!oMultiFilter.bAnd,
			aFilters = oMultiFilter.aFilters,
			oFilter,
			bMatch,
			bResult = bAnd;

		for (var i = 0; i < aFilters.length; i++) {
			oFilter = aFilters[i];
			bMatch = that._evaluateFilter(oFilter, vRef, fnGetValue);
			if (bAnd) {
				// if operator is AND, first non matching filter breaks
				if (!bMatch) {
					bResult = false;
					break;
				}
			} else if (bMatch) {
				bResult = true;
				break;
			}
		}
		return bResult;
	};

	return FHIRFilterProcessor;

});
