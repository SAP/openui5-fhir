/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilter
sap.ui.define(["sap/ui/model/Filter"],
	function(Filter) {
		"use strict";

		/**
	 * Constructor for Filter.
	 *
	 * @class
	 * Filter for the items binding.
	 *
	 * @param {object|string|sap.ui.model.Filter[]} vFilterInfo Filter info object or a path or an array of filters
	 * @param {sap.fhir.model.r4.FHIRFilterType} vFilterInfo.valueType Binding path for this filter
	 * @param {sap.ui.model.FilterOperator|function|boolean} [vOperator] Either a filter operator or a custom filter function or a Boolean flag that defines how to combine multiple filters
	 * @param {any} [vValue1] First value to use with the given filter operator
	 * @param {any} [vValue2] Second value to use with the given filter operator (only for some operators)
	 * @public
	 * @alias sap.fhir.model.r4.FHIRFilter
	 * @extends sap.ui.model.Filter
	 */
		var FHIRFilter = Filter.extend("sap.fhir.model.r4.FHIRFilter", /** @lends sap.ui.model.Filter.prototype */ {
			constructor : function(vFilterInfo, vOperator, vValue1, vValue2){
				Filter.call(this, vFilterInfo, vOperator, vValue1, vValue2);
				this.sValueType = vFilterInfo ? vFilterInfo.valueType : undefined;
			}
		});

		return FHIRFilter;

	});