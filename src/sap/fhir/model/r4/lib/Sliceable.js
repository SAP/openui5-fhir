/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.Sliceable
sap.ui.define([
	"sap/fhir/model/r4/FHIRUtils",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/ui/model/Filter"
], function(FHIRUtils, FHIRFilterOperator, Filter) {

	"use strict";

	/**
	 * Constructor for a new Sliceable. Provides the implementation of a sliceable object. Do not use this constructor! Use factory method.
	 * @see Sliceable.getSliceables
	 * @alias sap.fhir.model.r4.lib.Sliceable
	 * @author SAP SE
	 * @private
	 * @constructs {Sliceable}
	 * @since 1.0.0
	 * @version ${version}
	 */
	var Sliceable = {};

	function normalizeValue(vValue) {
		vValue = vValue.trim();
		return vValue === 0 || vValue === null || vValue ? vValue : undefined;
	}

	/**
	 * The map with the sliceable objects.
	 * Example FHIR Address: '[use=home, type=postal]'
	 * --> { use=home : sap.ui.model.Filter, type=postal : sap.ui.model.Filter }
	 * or '[reference StartsWith Organization && type=Organization]'
	 * --> { reference StartsWith Organization && type=Organization : sap.ui.model.Filter }
	 *
	 * @typedef {Object.<string, sap.ui.model.Filter>} sap.fhir.model.r4.lib.SliceableMap
	 *
	 */

	/**
	 * Transforms the given <code>sExpression</code> to a map of sliceable objects
	 *
	 * @param {string} sExpression The expression containing one ore more sliceable objects
	 * @returns {sap.fhir.model.r4.lib.SliceableMap} The map containing one ore more sliceable objects
	 * @protected
	 * @since 1.0.0
	 */
	Sliceable.getSliceables = function(sExpression) {
		var mSliceables;
		var sXmlAndEncoding = "&amp;&amp;";
		if (!sExpression) {
			throw new Error("Invalid Sliceable: Expression is empty.");
		} else if (!sExpression.startsWith("[") || !sExpression.endsWith("]")){
			throw new Error("Invalid Sliceable: \"" + sExpression + "\" doesn't start or end with a square bracket.");
		} else {
			var sWithoutBrackets = sExpression.substring(1, sExpression.length - 1);
			var aExpressions = sWithoutBrackets.split(",");
			mSliceables = {};
			for (var i = 0; i < aExpressions.length; i++) {
				var aConditions;
				if (aExpressions[i].indexOf(sXmlAndEncoding) > -1){
					aConditions = aExpressions[i].split(sXmlAndEncoding);
				} else {
					aConditions = aExpressions[i].split("&&");
				}
				var sSliceableKey;
				var sSliceableValue;
				var sSliceableOperator;
				for (var j = 0; j < aConditions.length; j++){
					if (aConditions[j].indexOf("=") === -1){
						for (var sKey in FHIRFilterOperator){
							var iIndex = aConditions[j].indexOf(sKey);
							if (iIndex > -1){
								var sOperatorLength = sKey.length;
								sSliceableKey = aConditions[j].substring(0, iIndex).trim();
								sSliceableValue = aConditions[j].substring(iIndex + sOperatorLength).trim();
								sSliceableOperator = sKey;
								break;
							}
						}
					} else {
						var aSliceAble = aConditions[j].split("=");
						sSliceableKey = aSliceAble[0].trim();
						sSliceableValue = normalizeValue(aSliceAble[1]);
						sSliceableOperator = FHIRFilterOperator.EQ;
					}

					if (sSliceableKey){
						var oFilter = new Filter({
							path : sSliceableKey,
							value1: normalizeValue(sSliceableValue),
							operator: sSliceableOperator
						});
						if (aConditions.length === 1){
							mSliceables[aExpressions[i]] = oFilter;
						} else {
							if (!mSliceables[aExpressions[i]]){
								mSliceables[aExpressions[i]] = [];
							}
							mSliceables[aExpressions[i]].push(oFilter);
							if (j === aConditions.length - 1){
								mSliceables[aExpressions[i]] = new Filter({filters : mSliceables[aExpressions[i]], and : true});
							}
						}
					} else {
						throw new Error("Invalid Sliceable: \"" + sExpression + "\". Key can't be determined.");
					}
				}
			}
		}
		return mSliceables;
	};

	/**
	 * Determines if the given <code>sExpression</code> includes 1 or more sliceable objects. Example: /Patient/1234/gender -> false or /Patient/1234/name/[use=official]/given -> true
	 *
	 * @param {string} sExpression The expression containing 0 or more sliceable objects, e.g. /Patient/1234/gender
	 * @returns {boolean} True, if the expression contains at least one sliceable object.
	 * @protected
	 * @since 1.0.0
	 */
	Sliceable.containsSliceable = function(sExpression) {
		// checks if expression contains '[', '=' and 0 or more characters, ']' and allow any whitespace characters between all characters
		return FHIRUtils.checkRegularExpression(sExpression, /(\s)*(\[)+(.*)(\])+(\s)*/g);
	};

	return Sliceable;
});