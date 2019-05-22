/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilterOperatorUtils
sap.ui.define([
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilterType",
	"sap/fhir/model/r4/FHIRUtils"
], function(FHIRFilterOperator, FHIRFilterType, FHIRUtils) {

	"use strict";

	/**
	 * Constructor for a new FHIRFilterOperatorUtils
	 *
	 * @class
	 * @classdesc Implementation of filter operator functions which can be reused in context of the FHIR standard
	 * @alias sap.fhir.model.r4.FHIRFilterOperatorUtils
	 * @author SAP SE
	 * @protected
	 * @since 0.0.2
	 * @version ${version}
	 */
	var FHIRFilterOperatorUtils = {};

	/**
	 * Transforms the UI5 filter operator to an FHIR valid search modifier based on the given UI5 <code>oFilter</code>
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter
	 * @returns {string} The FHIR filter operator
	 * @protected
	 * @since 0.0.1
	 */
	FHIRFilterOperatorUtils.getFHIRSearchParameterModifier = function(oFilter) {
		var sFHIRSearchModifier = "";
		if (this.isSearchParameterModifiable(oFilter) || FHIRFilterOperator.Missing === oFilter.sOperator) {
			switch (oFilter.sOperator) {
				case FHIRFilterOperator.Contains:
					sFHIRSearchModifier = ":contains";
					break;
				case FHIRFilterOperator.StartsWith:
					sFHIRSearchModifier = "";
					break;
				case FHIRFilterOperator.EQ:
					sFHIRSearchModifier = ":exact";
					break;
				case FHIRFilterOperator.Missing:
					sFHIRSearchModifier = ":missing";
					break;
				default:
					break;
			}
		}
		return sFHIRSearchModifier;
	};

	/**
	 * Determines if the given <code>oValue</code> is modifiable
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter.
	 * @returns {boolean} true if the given filter is modifiable.
	 * @public
	 * @since 0.0.2
	 */
	FHIRFilterOperatorUtils.isSearchParameterModifiable = function(oFilter) {
		return oFilter.sValueType !== FHIRFilterType.date && oFilter.sValueType !== FHIRFilterType.number && (typeof oFilter.oValue1 === "string" || Array.isArray(oFilter.oValue1));
	};

	/**
	 * Determines if the given <code>oValue</code> is prefixable
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter.
	 * @returns {boolean} True if the given filter is prefixable.
	 * @public
	 * @since 0.0.2
	 */
	FHIRFilterOperatorUtils.isSearchParameterPrefixable = function(oFilter) {
		return !(typeof oFilter.oValue1 === "string" || Array.isArray(oFilter.oValue1)) || oFilter.sValueType === FHIRFilterType.date || !isNaN(oFilter.oValue1);
	};

	/**
	 * Parses the JS filter value to an FHIR filter value
	 *
	 * @param {any} oValue The value of a filter object
	 * @returns {string} Formatted FHIR filter value
	 * @public
	 * @since 0.0.1
	 */
	FHIRFilterOperatorUtils.getFilterValue = function(oValue) {
		var sValue = oValue;
		if (oValue instanceof Date) {
			sValue = oValue.toISOString();
		}
		return sValue;
	};

	/**
	 * Transforms the UI5 filter operator to an FHIR valid search prefix based on the given UI5 <code>oFilter</code>
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter
	 * @returns {string} The date FHIR search prefix
	 * @protected
	 * @since 0.0.1
	 */
	FHIRFilterOperatorUtils.getFHIRSearchPrefix = function(oFilter) {
		var sFHIRSearchPrefix;
		if (this.isSearchParameterPrefixable(oFilter)) {
			switch (oFilter.sOperator) {
				case FHIRFilterOperator.EQ:
					sFHIRSearchPrefix = "eq";
					break;
				case FHIRFilterOperator.NE:
					sFHIRSearchPrefix = "ne";
					break;
				case FHIRFilterOperator.GT:
					sFHIRSearchPrefix = "gt";
					break;
				case FHIRFilterOperator.GE:
					sFHIRSearchPrefix = "ge";
					break;
				case FHIRFilterOperator.LT:
					sFHIRSearchPrefix = "lt";
					break;
				case FHIRFilterOperator.LE:
					sFHIRSearchPrefix = "le";
					break;
				case FHIRFilterOperator.SA:
					sFHIRSearchPrefix = "sa";
					break;
				case FHIRFilterOperator.EB:
					sFHIRSearchPrefix = "eb";
					break;
				case FHIRFilterOperator.AP:
					sFHIRSearchPrefix = "ap";
					break;
				default:
					break;
			}
		}
		return sFHIRSearchPrefix;
	};

	return FHIRFilterOperatorUtils;
});