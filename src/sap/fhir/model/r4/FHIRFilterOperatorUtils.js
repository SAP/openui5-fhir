/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRFilterOperatorUtils
sap.ui.define([
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilterType",
	"sap/fhir/model/r4/FHIRFilterComplexOperator"
], function (FHIRFilterOperator, FHIRFilterType, FHIRFilterComplexOperator) {

	"use strict";

	/**
	 * Constructor for a new FHIRFilterOperatorUtils
	 *
	 * @class
	 * @classdesc Implementation of filter operator functions which can be reused in context of the FHIR standard
	 * @alias sap.fhir.model.r4.FHIRFilterOperatorUtils
	 * @author SAP SE
	 * @protected
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRFilterOperatorUtils = {};

	/**
	 * Transforms the UI5 filter operator to an FHIR valid search modifier based on the given UI5 <code>oFilter</code>
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter
	 * @returns {string} The FHIR filter operator
	 * @protected
	 * @since 1.0.0
	 */
	FHIRFilterOperatorUtils.getFHIRSearchParameterModifier = function (oFilter) {
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
	 * @since 1.0.0
	 */
	FHIRFilterOperatorUtils.isSearchParameterModifiable = function (oFilter) {
		return oFilter.sValueType !== FHIRFilterType.date && oFilter.sValueType !== FHIRFilterType.number && (typeof oFilter.oValue1 === "string" || Array.isArray(oFilter.oValue1));
	};

	/**
	 * Determines if the given <code>oValue</code> is prefixable
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter.
	 * @returns {boolean} True if the given filter is prefixable.
	 * @public
	 * @since 1.0.0
	 */
	FHIRFilterOperatorUtils.isSearchParameterPrefixable = function (oFilter) {
		return !(typeof oFilter.oValue1 === "string" || Array.isArray(oFilter.oValue1)) || oFilter.sValueType === FHIRFilterType.date || !isNaN(oFilter.oValue1);
	};

	/**
	 * Parses the JS filter value to a FHIR filter value
	 *
	 * @param {any} oValue The value of a filter object
	 * @returns {string} Formatted FHIR filter value
	 * @public
	 * @since 1.0.0
	 */
	FHIRFilterOperatorUtils.getFilterValue = function (oValue) {
		var sValue = oValue;
		if (oValue instanceof Date) {
			sValue = oValue.toISOString();
		}
		return sValue;
	};

	/**
	 * Transforms the UI5 filter operator to a FHIR valid search prefix based on the given UI5 <code>oFilter</code>
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter
	 * @returns {string} The date FHIR search prefix
	 * @protected
	 * @since 1.0.0
	 */
	FHIRFilterOperatorUtils.getFHIRSearchPrefix = function (oFilter) {
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

	/**
	 * Transforms the UI5 filter operator to a FHIR valid filter prefix based on the given UI5 <code>oFilter</code>
	 *
	 * @param {sap.ui.model.Filter} oFilter The given filter
	 * @returns {string} The FHIR filter prefix
	 * @protected
	 * @since 2.1.0
	 */
	FHIRFilterOperatorUtils.getFHIRFilterPrefix = function (oFilter) {
		var sFHIRFilterPrefix;
		switch (oFilter.sOperator) {
			case FHIRFilterComplexOperator.EQ:
				sFHIRFilterPrefix = "eq";
				break;
			case FHIRFilterComplexOperator.NE:
				sFHIRFilterPrefix = "ne";
				break;
			case FHIRFilterComplexOperator.GT:
				sFHIRFilterPrefix = "gt";
				break;
			case FHIRFilterComplexOperator.GE:
				sFHIRFilterPrefix = "ge";
				break;
			case FHIRFilterComplexOperator.LT:
				sFHIRFilterPrefix = "lt";
				break;
			case FHIRFilterComplexOperator.LE:
				sFHIRFilterPrefix = "le";
				break;
			case FHIRFilterComplexOperator.SA:
				sFHIRFilterPrefix = "sa";
				break;
			case FHIRFilterComplexOperator.EB:
				sFHIRFilterPrefix = "eb";
				break;
			case FHIRFilterComplexOperator.AP:
				sFHIRFilterPrefix = "ap";
				break;
			case FHIRFilterComplexOperator.StartsWith:
				sFHIRFilterPrefix = "sw";
				break;
			case FHIRFilterComplexOperator.EndsWith:
				sFHIRFilterPrefix = "ew";
				break;
			case FHIRFilterComplexOperator.Contains:
				sFHIRFilterPrefix = "co";
				break;
			case FHIRFilterComplexOperator.PR:
				sFHIRFilterPrefix = "pr";
				break;
			case FHIRFilterComplexOperator.PO:
				sFHIRFilterPrefix = "po";
				break;
			case FHIRFilterComplexOperator.SS:
				sFHIRFilterPrefix = "ss";
				break;
			case FHIRFilterComplexOperator.SB:
				sFHIRFilterPrefix = "sb";
				break;
			case FHIRFilterComplexOperator.IN:
				sFHIRFilterPrefix = "in";
				break;
			case FHIRFilterComplexOperator.NI:
				sFHIRFilterPrefix = "ni";
				break;
			case FHIRFilterComplexOperator.RE:
				sFHIRFilterPrefix = "re";
				break;
			default:
				break;
		}
		return sFHIRFilterPrefix;
	};

	/**
	 * Parses the JS filter value to a FHIR filter value
	 *
	 * @param {string} sFilterType The value type of a filter object
	 * @param {any} vFilterValue The value of a filter object
	 * @returns {string} Formatted FHIR filter value
	 * @public
	 * @since 2.1.0
	 */
	FHIRFilterOperatorUtils.getFilterValueForComplexFilter = function (sFilterType, vFilterValue) {
		var sValue;
		if (this.isFilterValueEncodable(sFilterType, vFilterValue)) {
			sValue = "\"" + vFilterValue + "\"";
		} else {
			sValue = vFilterValue;
		}
		return sValue;
	};

	/**
	 * Determines if the value should be encoded or not
	 *
	 * @param {string} sFilterType The value type of a filter object
	 * @param {any} vFilterValue The value of a filter object
	 * @returns {boolean} true if the value needs to be encoded
	 * @private
	 * @since 2.2.7
	 */
	FHIRFilterOperatorUtils.isFilterValueEncodable = function (sFilterType, vFilterValue) {
		var sRegex = "[ \r\n\t\S]+";
		return (sFilterType && sFilterType === FHIRFilterType.string) || (typeof vFilterValue === "string" && (vFilterValue.match(sRegex) != null || this.isValidDate(vFilterValue)));
	};

	/**
	 * Determines if the given vValue can be parsed to a valid date object
	 *
	 * @param {any} vFilterValue The value of a filter object
	 * @returns {boolean} true if the value is not valid date
	 * @private
	 * @since 2.2.7
	 */
	FHIRFilterOperatorUtils.isValidDate = function (vFilterValue) {
		return isNaN(new Date(vFilterValue).getTime());
	};

	return FHIRFilterOperatorUtils;
});