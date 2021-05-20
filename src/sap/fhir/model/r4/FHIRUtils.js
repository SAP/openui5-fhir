/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRUtils
sap.ui.define([
	"sap/fhir/model/r4/FHIRFilterOperatorUtils",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilterComplexOperator",
	"sap/ui/model/ChangeReason",
	"sap/base/util/merge",
	"sap/base/util/deepEqual",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType"
], function (FHIRFilterOperatorUtils, FHIRFilterOperator, FHIRFilterComplexOperator, ChangeReason, merge, deepEqual, Filter, Sorter, FilterProcessor, FilterType) {

	"use strict";

	/**
	 * Constructor for a new FHIRUtils
	 *
	 * @alias sap.fhir.model.r4.FHIRUtils
	 * @author SAP SE
	 * @class
	 * @classdesc Implementation of functions which can be reused in context of the FHIR standard
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRUtils = {};

	/**
	 * Creates the part of the URL which contains the given <code>aSorters</code> parameters for a FHIR request
	 *
	 * @param {sap.ui.model.Sorter[]} aSorters The given sorting parameters
	 * @returns {string} The part of the FHIR request URL containing the sorting parameters
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.createSortParams = function (aSorters) {
		var sSorterURLPart;
		if (aSorters && Array.isArray(aSorters) && aSorters.length > 0) {
			sSorterURLPart = "";
			for (var i = 0; i < aSorters.length; i++) {
				var oSorter = aSorters[i];

				if (oSorter.bDescending) {
					sSorterURLPart += "-";
				}
				sSorterURLPart += oSorter.sPath;

				if (i !== aSorters.length - 1) {
					sSorterURLPart += ",";
				}
			}
		}
		return sSorterURLPart;
	};

	/**
	 * Adds query parameters to the request parameter object
	 *
	 * @param {sap.fhir.model.r4.FHIRContextBinding|sap.fhir.model.r4.FHIRTreeBinding|sap.fhir.model.r4.FHIRListBinding} oBinding That potentially contains request query parameters
	 * @param {object} mParametersRequest The request parameter object
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.addRequestQueryParameters = function (oBinding, mParametersRequest) {
		if (oBinding.mParameters && oBinding.mParameters.hasOwnProperty("request")) {
			if (!mParametersRequest.urlParameters) {
				mParametersRequest.urlParameters = {};
			}
			for (var sKey in oBinding.mParameters.request) {
				mParametersRequest.urlParameters[sKey] = oBinding.mParameters.request[sKey];
			}
		}
	};

	/**
	 * Inserts an array into another array at the given position
	 *
	 * @param {object[]} aArray The main array
	 * @param {object[]} aSubArray The array which should be inserted into the main array <code>aArray</code>
	 * @param {number} iPos The position where the <code>aSubArray</code> should be inserted
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.insertArrayIntoArray = function (aArray, aSubArray, iPos) {
		Array.prototype.splice.apply(aArray, [iPos, 0].concat(aSubArray));
	};

	/**
	 * Removes an array from another array at the given position
	 *
	 * @param {object[]} aArray The main array
	 * @param {object[]} aSubArray The array which should be removed from the main array <code>aArray</code>
	 * @returns {object[]} Array without the elements contained in aSubArray.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.removeArrayFromArray = function (aArray, aSubArray) {
		return aArray.filter(function (x) {
			return aSubArray.indexOf(x) < 0;
		});
	};

	/**
	 * Determines if the index of the first occurrence of <code>vValue</code> in the given <code>aValue</code>
	 *
	 * @param {any} vValue The value to be checked
	 * @param {any[]} aValue The array might contains the <code>vValue</code>
	 * @returns {number} The index of the first occurrence of <code>vValue</code> in the <code>aValue</code>
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.getIndexOfValueInArray = function (vValue, aValue) {
		if (aValue && Array.isArray(aValue)) {
			for (var i = 0; i < aValue.length; i++) {
				var oEntry = aValue[i];
				if (deepEqual(oEntry, vValue)) {
					return i;
				}
			}
			return -1;
		}
		return -1;
	};


	/**
	 * Determines if the given <code>aSubCollection</code> is part of the given <code>aCollection</code> (ordering is not considered)
	 *
	 * @param {string[] | number[]} aSubCollection The array which might be part of <code>aCollection</code>
	 * @param {string[] | number[]} aCollection The array which might include the <code>aSubCollection</code>
	 * @returns {boolean} True if the <code>aSubCollection</code> is part of the <code>aCollection</code>
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.isSubset = function (aSubCollection, aCollection) {
		return aSubCollection.every(function (vValue) {
			return aCollection.indexOf(vValue) >= 0;
		});
	};

	/**
	 * Determines if the given <code>vValue</code> is a FHIR quantity --- currently not implemented
	 *
	 * @param {any} vValue The value to be checked as a FHIR quantity
	 * @returns {boolean} false
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.isQuantity = function (vValue) {
		return false;
	};

	/**
	 * Determines if the given <code>vValue</code> is a string
	 *
	 * @param {any} vValue The value to be checked as a string
	 * @returns {boolean} True if the value is a string.
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.isString = function (vValue) {
		return typeof vValue === "string";
	};

	/**
	 * Determines if the given <code>vValue</code> is an object (object, array, date, etc.)
	 *
	 * @param {any} vValue The value to be checked as an object
	 * @returns {boolean} True if the value is an object.
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.isObject = function (vValue) {
		return typeof vValue === "object";
	};

	/**
	 * Determines if the given <code>vValue</code> is an number
	 *
	 * @param {any} vValue The value to be checked as an number
	 * @returns {boolean} True if the value is an number.
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.isNumber = function (vValue) {
		return typeof vValue === "number";
	};

	/**
	 * Determines if the given <code>oObject</code> is empty (has no keys)
	 * IMPORTANT: copied and modifed from sap.ui.thirdparty.jquery.js#isEmptyObject
	 *
	 * @param {object} oObject The object to be checked as empty
	 * @returns {boolean} True if the <code>oObject</code> is empty, false if not.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.isEmptyObject = function (oObject) {
		for (var sName in oObject) {
			return false;
		}
		return true;
	};

	/**
	 * @callback FilterCallback
	 * @param {any} An element of the given array.
	 * @returns {boolean} The result of the test.
	 */

	/**
	 * Filters the given <code>aArray</code> by the given <code>sAttribute</code> with the given <code>sFilterValue</code>
	 *
	 * @param {object[]} aArray The given array
	 * @param {string} sAttribute The attribute on which the filtering should be executed
	 * @param {string} sFilterValue The value which should be assigned to the <code>sAttribute</code> to fulfill the filter criterion
	 * @param {FilterCallback=} fnCallback The custom filter test.
	 * @returns {object[]} The filtered array
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.filterArray = function (aArray, sAttribute, sFilterValue, fnCallback) {
		return aArray.filter(function (oArrayAttribute) {
			if (fnCallback) {
				return fnCallback(oArrayAttribute);
			} else {
				return oArrayAttribute[sAttribute] === sFilterValue;
			}
		});
	};

	/**
	 * Filters the given <code>oObject</code> by the given <code>sAttribute</code> with the given <code>sFilterValue</code>
	 *
	 * @param {object} oObject The given object
	 * @param {string} sAttribute The attribute on which the filtering should be executed
	 * @param {string} sFilterValue The value which should be assigned to the <code>sAttribute</code> to fulfill the filter criterion
	 * @param {number} iLevel The level of the object structure on which the filtering should be executed	 *
	 * @param {object[]} aObjects The objects which fulfill the filter criterion
	 * @param {function} fnPreprocessResult If the result objects should be preprocessed
	 *
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.filterObject = function (oObject, sAttribute, sFilterValue, iLevel, aObjects, fnPreprocessResult) {
		if (iLevel > 0) {
			for (var sKey in oObject) {
				this.filterObject(oObject[sKey], sAttribute, sFilterValue, iLevel - 1, aObjects, fnPreprocessResult);
			}
		}
		if (iLevel === 0 && oObject[sAttribute] === sFilterValue) {
			if (fnPreprocessResult) {
				aObjects.push(fnPreprocessResult(oObject));
			} else {
				aObjects.push(oObject);
			}

		}
	};

	/**
	 * Creates a full copy of the given <code>oObject</code>
	 *
	 * @param {object} oObject The object to be cloned
	 * @returns {object} The cloned object
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.deepClone = function (oObject) {
		if (oObject && typeof oObject === "object") {
			if (Array.isArray(oObject)) {
				return merge([], oObject);
			} else if (oObject instanceof Date) {
				return new Date(oObject.getTime());
			} else {
				return merge({}, oObject);
			}
		} else if (oObject) {
			return oObject;
		}
		return undefined;
	};

	/**
	 * Generates an Universally Unique Identifier Version 4 (UUID V4)
	 *
	 * @returns {string} The generated Universally Unique Identifier Version 4 (UUID V4)
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.uuidv4 = function () {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.floor(Math.random() * 16), v = c === "x" ? r : r % 4 + 8;
			return v.toString(16);
		});
	};

	/**
	 * Determines the URL of the link based on the given <code>sRelation</code> and <code>aLinks</code>
	 *
	 * @param {object[]} aLinks The array containing self, next, previous
	 * @param {string} sRelation The relation self, next, previous
	 * @returns {string} The URL of the link
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.getLinkUrl = function (aLinks, sRelation) {
		var oLink = this.filterArray(aLinks, "relation", sRelation)[0];
		return oLink && oLink.url ? oLink.url : undefined;
	};

	/**
	 * Determines the number of levels defined by the given <code>sPath</code>. Example:
	 *
	 * @param {string} sPath The sPath
	 * @returns {number} Number of levels defined by the given path.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.getNumberOfLevelsByPath = function (sPath) {
		return this.countOccurrence(sPath, "/");
	};

	/**
	 * Determines the number of occurrences of the given <code>sSearch</code> in the given <code>sBase</code>. Example: sBase = 'Test:String:Cool', sSearch = ':' -> 2
	 *
	 * @param {string} sBase The base string
	 * @param {string} sSearch The search string
	 * @returns {number} Number of occurrences of <code>sSearch</code> in <code>sBase</code>
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.countOccurrence = function (sBase, sSearch) {
		var iCount = -1;

		if (sBase === undefined) {
			throw new Error("sBase is undefined");
		}

		if (!this.isString(sBase)) {
			throw new Error("sBase is not a string");
		}

		for (var iIndex = -2; iIndex !== -1; iCount++) {
			iIndex = sBase.indexOf(sSearch, iIndex + 1);
		}

		return iCount;
	};

	/**
	 * Checks if the given <code>sParameter</code> is a valid string parameter inside the given <code>mParameters</code>
	 *
	 * @param {object} mParameters The object containing all parameters
	 * @param {string} sParameter The given parameter
	 * @throws {Error} if <code>sParameter</code> is not valid
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.checkStringParameter = function (mParameters, sParameter) {
		if (!mParameters.hasOwnProperty(sParameter)) {
			throw new Error("Missing parameter: '" + sParameter + "'.");
		} else if (!FHIRUtils.isString(mParameters[sParameter])) {
			throw new Error("Unsupported parameter type: '" + sParameter + "'. Parameter has to be of type string.");
		}
	};

	/**
	 * Checks if the given <code>sParameter</code> is a valid path parameter inside the given <code>mParameters</code>
	 *
	 * @param {object} mParameters The object containing all parameters
	 * @param {string} sParameter The given parameter
	 * @throws {Error} if <code>sParameter</code> is not valid
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.checkPathParameter = function (mParameters, sParameter) {
		this.checkStringParameter(mParameters, sParameter);
		if (mParameters[sParameter].startsWith("/")) {
			throw new Error("Unsupported parameter: '" + sParameter + "'. Parameter must not start with a '/'.");
		} else if (mParameters[sParameter].endsWith("/")) {
			throw new Error("Unsupported parameter: '" + sParameter + "'. Parameter must not end with a '/'.");
		}
	};

	/**
	 * Checks if the given <code>sParameter</code> is a valid FHIR search parameter inside the given <code>mParameters</code>
	 *
	 * @param {object} mParameters The object containing all parameters
	 * @param {string} sParameter The given parameter
	 * @throws {Error} if <code>sParameter</code> is not valid
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.checkFHIRSearchParameter = function (mParameters, sParameter) {
		this.checkStringParameter(mParameters, sParameter);
	};

	/**
	 * Determines if the given <code>sText</code> matches the given <code>rRegExp</code>
	 *
	 * @param {string} sText The text to analyze
	 * @param {RegExp} rRegExp The regular expression
	 * @returns {boolean} True if the given text matches the regular expression.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.checkRegularExpression = function (sText, rRegExp) {
		if (!sText) {
			throw new Error("Empty string. Can not check the regular expression: " + rRegExp + " for an undefined text.");
		}
		if (!rRegExp) {
			throw new Error("Empty regular expression");
		}
		return sText.match(rRegExp) ? true : false;
	};

	/**
	 * Creates an array representing the <code>sPath</code> inside a model
	 *
	 * @param {string} sPath The path inside the model
	 * @returns {string[]} The array representing the path inside a model e.g. ["Patient","123","gender"]
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.splitPath = function (sPath) {
		var rSliceableExpression = /((\s*(\[|§)(.*?)(\]|§)\s*)+)/g;
		var aMatches = sPath.match(rSliceableExpression);
		var sPathWithoutSlices = sPath.replace(rSliceableExpression, "");
		var aPaths = sPathWithoutSlices.split("/");
		for (var i = 1; i < aPaths.length; i++) {
			if (!aPaths[i] && aMatches) {
				aPaths[i] = aMatches.shift();
			}
		}
		return aPaths;
	};

	/**
	 * Creates an array representing the <code>sPath</code> inside a model
	 *
	 * @param {object[]} aFilters The filters which should be added to the parameters
	 * @param {object} mParameters The parameters which should be passed to the request
	 * @param {number} iSupportedFilterDepth defines the simple filtering depth
	 * @param {boolean} bIsValueSet If it's a value set for that the parameters should be build
	 * @param {number} iLvl The depth of the allowed grouping level
	 * @param {boolean} bLogicalConnection If it's an indicated group
	 * @param {boolean} bLogicalOperator If the group is grouped by an "and" or "or" operator
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.filterBuilder = function (aFilters, mParameters, iSupportedFilterDepth, bIsValueSet, iLvl, bLogicalConnection, bLogicalOperator) {
		if (iLvl === undefined) {
			iLvl = 0;
		}
		if (aFilters) {
			for (var i = 0; i < aFilters.length; i++) {
				var oFilter = aFilters[i];
				if (!iSupportedFilterDepth) {
					if (!mParameters._filter) {
						mParameters._filter = "";
					}
					this._complexFilterBuilder(oFilter, mParameters);
				} else if (oFilter._bMultiFilter && iLvl <= iSupportedFilterDepth) {
					this.filterBuilder(oFilter.aFilters, mParameters, iSupportedFilterDepth, bIsValueSet, iLvl + 1, oFilter._bMultiFilter, oFilter.bAnd);
				} else if (iLvl > iSupportedFilterDepth) {
					throw new Error("A depth of " + iLvl + " is not supported for simple filtering, please reduce it to a maximum of 2");
				} else {
					this._filterBuilder(oFilter, mParameters, bIsValueSet, bLogicalConnection, bLogicalOperator);
				}
			}
		}
	};

	/**
	 * Creates an array representing the <code>sPath</code> inside a model
	 * 	 *
	 * @param {object} oFilter The filter which should be added to the parameters
	 * @param {object} mParameters The parameters which should be passed to the request
	 * @param {boolean} bIsValueSet If it's a value set for that the parameters should be build
	 * @param {boolean} bLogicalConnection If it's an indicated group
	 * @param {boolean} bLogicalOperator If the group is grouped by an "and" or "or" operator
	 * @private
	 * @since 1.0.0
	 */
	FHIRUtils._filterBuilder = function (oFilter, mParameters, bIsValueSet, bLogicalConnection, bLogicalOperator) {
		var sPath = oFilter.sPath;
		var sFhirSearchModifier = FHIRFilterOperatorUtils.getFHIRSearchParameterModifier(oFilter);
		var oValue1 = FHIRFilterOperatorUtils.getFilterValue(oFilter.oValue1);
		var sSearchPrefix = FHIRFilterOperatorUtils.getFHIRSearchPrefix(oFilter);
		var vValue;
		if (sSearchPrefix) {
			vValue = sSearchPrefix + oValue1;
		} else {
			vValue = oValue1;
		}
		if (bIsValueSet) {
			mParameters.filter = oFilter.oValue1;
		} else if (oFilter.sOperator === FHIRFilterOperator.BT) {
			var oValue2 = FHIRFilterOperatorUtils.getFilterValue(oFilter.oValue2);
			mParameters[sPath + sFhirSearchModifier] = [FHIRFilterOperator.GE.toLowerCase() + oValue1, FHIRFilterOperator.LE.toLowerCase() + oValue2];
		} else if (bLogicalConnection && !bLogicalOperator) {
			if (mParameters[sPath + sFhirSearchModifier]) {
				mParameters[sPath + sFhirSearchModifier].push(vValue);
			} else {
				mParameters[sPath + sFhirSearchModifier] = [vValue];
			}
		} else {
			mParameters[sPath + sFhirSearchModifier] = vValue;
		}
	};

	/**
	 * Creates a complex filter
	 *
	 * @param {sap.ui.model.Filter} oFilter The filter which should be added to the parameters
	 * @param {object} mParameters The parameters which should be passed to the request
	 * @private
	 * @since 2.1.0
	 */
	FHIRUtils._complexFilterBuilder = function (oFilter, mParameters) {
		var sLogicalConnection;
		if (oFilter instanceof Filter) {
			if (oFilter._bMultiFilter) {
				// recursive
				sLogicalConnection = oFilter.bAnd && oFilter.bAnd == true ? "and" : "or";
				if (oFilter.aFilters) {
					mParameters._filter = mParameters._filter + "( ";
					// for the first filter the logical connection shouldnt be appended
					this._complexFilterBuilder(oFilter.aFilters[0], mParameters);
					for (var i = 1; i < oFilter.aFilters.length; i++) {
						if (sLogicalConnection) {
							mParameters._filter = mParameters._filter + " " + sLogicalConnection + " ";
						}
						this._complexFilterBuilder(oFilter.aFilters[i], mParameters);
					}
					mParameters._filter = mParameters._filter + " )";
				}
			} else {
				// validate the filter operator
				// if BT operator use 'and' to generate the filter value
				var sPath = oFilter.sPath;
				var sFilterOperator = FHIRFilterOperatorUtils.getFHIRFilterPrefix(oFilter);
				var oValue1 = FHIRFilterOperatorUtils.getFilterValueForComplexFilter(oFilter.sValueType, oFilter.oValue1);
				var oValue2;
				var sFilter;
				if (oFilter.sOperator === FHIRFilterComplexOperator.BT) {
					oValue2 = FHIRFilterOperatorUtils.getFilterValueForComplexFilter(oFilter.sValueType, oFilter.oValue2);
					sFilter = "( " + sPath + " " + FHIRFilterComplexOperator.GE.toLowerCase() + " " + oValue1 + " and " + sPath + " " + FHIRFilterComplexOperator.LE.toLowerCase() + " " + oValue2 + " )";
				} else {
					sFilter = sPath + " " + sFilterOperator + " " + oValue1;
				}
				mParameters._filter = mParameters._filter + sFilter;
			}
		}
	};

	/**
	 * Filters the actual binding depending on the given <code>aFilters</code>
	 *
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [aFilters] The filters defined for the list binding (can be either a filter or an array of filters)
	 * @param {sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} oBinding The binding which triggered the filter
	 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.filter = function (aFilters, oBinding, sFilterType) {
		if (!aFilters) {
			aFilters = [];
		}
		if (aFilters instanceof Filter) {
			aFilters = [aFilters];
		}

		if (sFilterType == FilterType.Application) {
			oBinding.aApplicationFilters = aFilters;
		}

		//if no application-filters are present, or they are not in array form/empty array, init the filters with []
		if (!oBinding.aApplicationFilters || !Array.isArray(oBinding.aApplicationFilters) || oBinding.aApplicationFilters.length === 0) {
			oBinding.aApplicationFilters = [];
		}
		oBinding.oCombinedFilter = FilterProcessor.combineFilters(oBinding.aFilters, oBinding.aApplicationFilters);

		if (oBinding.bPendingRequest) {
			var fnQueryLastFilters = function () {
				if (!oBinding.bPendingRequest) {
					oBinding.detachDataReceived(fnQueryLastFilters);
					oBinding.bIsDataReceivedAttached = false;
					oBinding.aFilters = oBinding.aFilterCache;
					oBinding.refresh(ChangeReason.Filter);
				}
			};
			if (!oBinding.bIsDataReceivedAttached) {
				oBinding.bIsDataReceivedAttached = true;
				oBinding.attachDataReceived(fnQueryLastFilters);
			}
			oBinding.aFilterCache = aFilters;
		} else {
			oBinding.aFilters = aFilters;
			oBinding.refresh(ChangeReason.Filter);
		}
	};

	/**
	 * Sorts the actual list binding based on the given <code>aSorters</code>
	 *
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} aSorters The sorters defined for the list binding (can be either a sorter or an array of sorters)
	 * @param {sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} oBinding The binding which triggered the sort
	 * @param {boolean} bRefresh If the binding should directly send a call or wait for the filters, for p13ndialog
	 * @public
	 * @since 1.0.0
	 */
	FHIRUtils.sort = function (aSorters, oBinding, bRefresh) {
		if (!aSorters) {
			aSorters = [];
		}
		if (aSorters instanceof Sorter) {
			aSorters = [aSorters];
		}
		if (oBinding.bPendingRequest) {
			var fnQueryLastSorters = function () {
				if (!oBinding.bPendingRequest) {
					oBinding.detachDataReceived(fnQueryLastSorters);
					oBinding.bIsDataReceivedAttached = false;
					oBinding.aSorters = oBinding.aSortersCache;
					if (bRefresh) {
						oBinding.refresh(ChangeReason.Sort);
					}
				}
			};
			if (!oBinding.bIsDataReceivedAttached) {
				oBinding.bIsDataReceivedAttached = true;
				oBinding.attachDataReceived(fnQueryLastSorters);
			}
			oBinding.aSortersCache = aSorters;
		} else {
			oBinding.aSorters = aSorters;
			if (bRefresh) {
				oBinding.refresh(ChangeReason.Sort);
			}
		}
	};

	/**
	 * Determines if the absolute path can be requested from the FHIR service
	 *
	 * @param {string} sPath The FHIR resource which should be requested
	 * @returns {boolean} true if the absolute path can be requested
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.isRequestable = function (sPath) {
		return sPath && (sPath.indexOf("$") > -1 || (sPath.match(/\//g) || []).length <= 2 || sPath.indexOf("_history") > -1);
	};

	/**
	 * Checks if the given binding is of type FHIRContextBinding
	 *
	 * @param {sap.ui.base.ManagedObject} oContext FHIR Context
	 * @returns {boolean} true if it's a FHIR context
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.isContextBinding = function (oContext) {
		return oContext && oContext.getMetadata().getName() === "sap.fhir.model.r4.FHIRContextBinding";
	};

	/**
	 * Checks if the given binding is of type FHIRPropertyBinding
	 *
	 * @param {sap.ui.base.ManagedObject} oBinding FHIR Binding
	 * @returns {boolean} true if it's a property binding
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUtils.isPropertyBinding = function (oBinding) {
		return oBinding && oBinding.getMetadata().getName() === "sap.fhir.model.r4.FHIRPropertyBinding";
	};

	/**
	 * Generate FullUrl based on the type and id
	 *
	 * @param {sap.fhir.model.r4.model.type.Uri} oUri FHIR URI Instance
	 * @param {string} sResourceServerPath The original resource path e.g. '/Patient/123'
	 * @param {string} sResourceId The id of the the FHIR resource e.g. '123'
	 * @param {string} sServiceUrl The root URL of the FHIR server to request data e.g. http://example.com/fhir
	 * @returns {string} sFullUrl
	 * @protected
	 * @since 1.1.0
	 */
	FHIRUtils.generateFullUrl = function (oUri, sResourceServerPath, sResourceId, sServiceUrl) {
		var sFullUrl;
		if (oUri) {
			switch (oUri.getName()) {
				case "sap.fhir.model.r4.type.Uuid":
					sFullUrl = "urn:" + oUri.toString() + ":";
					if (sResourceId && oUri.validateValue(sResourceId)) {
						sFullUrl += sResourceId;
					} else {
						sFullUrl += this.uuidv4();
					}
					break;
				case "sap.fhir.model.r4.type.Url":
					sFullUrl = sServiceUrl + sResourceServerPath;
					break;
				default:
					break;
			}
		}
		return sFullUrl;
	};

	return FHIRUtils;

});