/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRListBinding
sap.ui.define([
	"sap/ui/model/ListBinding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/SorterProcessor",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/fhir/model/r4/OperationMode",
	"sap/ui/model/Filter",
	"sap/fhir/model/r4/lib/HTTPMethod",
	"sap/base/Log",
	"sap/base/util/each",
	"sap/fhir/model/r4/Context"
], function(ListBinding, ChangeReason, Sorter, FilterProcessor, SorterProcessor, FHIRUtils, OperationMode, Filter, HTTPMethod, Log, each, Context) {
	"use strict";

	/**
	 * Constructor for a new FHIRListBinding
	 *
	 * @class
	 * @classdesc List binding implementation for the FHIRModel
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The FHIRModel
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} [oContext] The parent context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [aSorters] The dynamic sorters to be used initially (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [aFilters] The dynamic application filters to be used initially (can be either a filter or an array of filters)
	 * @param {object} [mParameters] The map which contains additional parameters for the binding
	 * @param {string} [mParameters.groupId] The group id
	 * @param {sap.fhir.model.r4.OperationMode} [mParameters.operationMode] The operation mode, how to handle operations like filtering and sorting
	 * @param {string} [mParameters.valueSetLookupInStructureDefinition=true]  If the list binding should trigger an automatic call of the structuredefinition to get the valueset behind the property
	 * @param {string} [mParameters.request] The parameters which will be passed with the request as url parameters, Note: any additional url parameters can be mentioned as new key/value pairs
	 * @param {string} [mParameters.request._include] The _include parameter, e.g. in a list which is bind to '/Patient' it's possible to include 'Coverage:payor'
	 * @param {string} [mParameters.request._revinclude] The _revinclude parameter, e.g. in a list which is bind to '/Practitioner' it's possible to reverse include 'PractitionerRole:practitioner'
	 * @param {string} [mParameters.request.url] The url parameter, adds the given url as a search parameter to the request
	 * @alias sap.fhir.model.r4.FHIRListBinding
	 * @author SAP SE
	 *
	 * @extends sap.ui.model.ListBinding
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRListBinding = ListBinding.extend("sap.fhir.model.r4.FHIRListBinding", {

		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters) {
			ListBinding.apply(this, arguments);
			this.aFilters = aFilters instanceof Filter ? [aFilters] : aFilters;
			this.aSorters = aSorters instanceof Sorter ? [aSorters] : aSorters;
			this.mParameters = mParameters;
			this.sOperationMode = (mParameters && mParameters.operationMode) || this.oModel.sDefaultOperationMode;
			if (this.sOperationMode !== OperationMode.Server) {
				throw new Error("Unsupported OperationMode: " + this.sOperationMode + ". Only sap.fhir.model.r4.OperationMode.Server is supported.");
			}
			this.sGroupId = mParameters && mParameters.groupId || oContext && oContext.sGroupId;
			this.bUnique = mParameters && mParameters.unique;
			if (mParameters) {
				this.bValueSetLookupInStructureDefinition = mParameters.valueSetLookupInStructureDefinition === undefined ? true : mParameters.valueSetLookupInStructureDefinition;
			} else {
				this.bValueSetLookupInStructureDefinition = true;
			}
			this.sId = FHIRUtils.uuidv4();
			this._resetData();
		},

		initialize: function () {
			// List doesn't get invalidated when context length is 0
			// as per suggestion Server-side bindings (e.g. ODataListBinding) are expected to start with a "refresh" event
			// overwrite the ListBindings "initialize" + fire refresh-event (although not defined in the metadata)
			this.fireEvent("refresh", { reason: ChangeReason.Refresh });
			return this;
		}

	});

	/**
	 * @typedef {object} sap.fhir.model.r4.FHIRListBinding.Parameter
	 * @prop {object} [urlParameters] The parameters that will be passed as query strings
	 * @public
	 * @since 1.0.0
	 */

	/**
					 * Creates the parameters for the FHIR request based on the configured filters and sorters
					 *
					 * @param {number} [iLength] The number of contexts to retrieve beginning from the start index
					 * @returns {sap.fhir.model.r4.FHIRListBinding.Parameter} The map of parameters
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._buildParameters = function(iLength) {
		var mParameters = {
			urlParameters : {
				_sort : FHIRUtils.createSortParams(this.aSorters),
				_count : iLength
			}
		};
		FHIRUtils.addRequestQueryParameters(this, mParameters);
		FHIRUtils.filterBuilder(this.aFilters, mParameters.urlParameters, this.oModel.iSupportedFilterDepth, this._isValueSet());
		return mParameters;
	};

	/**
					 * Returns already created binding contexts for all entities in this list binding for the range determined by the given start index <code>iStart</code> and <code>iLength</code>.
					 * Resource profiles which are mentioned in the context but aren't loaded already, are requested
					 *
					 * @param {number} [iStartIndex] The index where to start the retrieval of contexts
					 * @param {number} [iLength] The number of contexts to retrieve beginning from the start index
					 * @returns {sap.fhir.model.r4.Context[]} The array of all binding contexts
					 * @protected
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.getContexts = function(iStartIndex, iLength) {
		if (!this.iLength && iLength !== undefined){
			this.iLength = iLength > this.oModel.iSizeLimit ? this.oModel.iSizeLimit : iLength;
		} else if (!this.iLength) {
			this.iLength = this.oModel.iSizeLimit;
		}

		var mParameters = this._buildParameters(this.iLength);
		var fnSuccess = function(oData) {
			if (oData.total === undefined){
				throw new Error("FHIR Server error: The \"total\" property is missing in the response for the requested FHIR resource " + this.sPath);
			}
			this.bDirectCallPending = false;
			iStartIndex = this.aKeys.length;
			if (oData.entry && oData.entry.length){
				var oResource;
				var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext, this.bUnique);
				var sBindingResType = oBindingInfo.getResourceType();
				for (var i = 0; i < oData.entry.length; i++) {
					oResource = oData.entry[i].resource;
					oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext, this.bUnique, oResource);
					if (oResource.resourceType === sBindingResType){
						this.aKeys[iStartIndex + i] = oBindingInfo.getAbsolutePath().substring(1);
					}
				}
			}
			this._markSuccessRequest(oData, oData.total);
		}.bind(this);

		var fnSuccessValueSet = function(oData) {
			var iTotal = oData.expansion.total || (oData.expansion.contains && oData.expansion.contains.length) || 0;
			this._buildKeys("ValueSet/" + "§" + oData.expansion.identifier + "§", oData.expansion.contains, iTotal);
			this._markSuccessRequest(oData, iTotal);
		}.bind(this);

		var fnLoadResources = function() {
			var sValueSetUri = this._getValueSetUriFromStructureDefinition();
			if (sValueSetUri) {
				this._submitRequest("/ValueSet/$expand", {
					urlParameters : {
						url : sValueSetUri,
						displayLanguage: sap.ui.getCore().getConfiguration().getLanguage()
					}
				}, fnSuccessValueSet);
			} else {
				this._loadResources(iLength);
			}
		}.bind(this);

		var fnSuccessStructDef = function(oData) {
			this.bDirectCallPending = false;
			if (oData && oData.entry) {
				this.oStructureDefinition = oData.entry[0].resource;
				fnLoadResources();
			} else {
				this.bPendingRequest = false;
				this.bInitial = false;
				var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext, this.bUnique);
				var oResource = this.oModel.getProperty(oBindingInfo.getResourcePath()) || {};
				oResource.resourceType = oResource.resourceType || oBindingInfo.getResourceType();
				var sStrucDefUrl = this.oModel.getStructureDefinitionUrl(oResource);
				throw new Error("The structuredefinition " + sStrucDefUrl + " could not be loaded from the server for binding with path " + oBindingInfo.getRelativePath());
			}
		}.bind(this);

		if (!this.bPendingRequest && !this.bResourceNotAvailable) {
			if (this._isValueSetHardCoded() && this.iTotalLength === undefined) { // load hardcoded valueset
				mParameters.urlParameters.displayLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				this._submitRequest("/ValueSet/$expand", mParameters, fnSuccessValueSet);
			} else if (!this.aSortersCache && !this.aFilterCache && this.sNextLink && iLength > this.iLastLength) {
				this.iLastLength += this.iLength;
				// the direct next links will not be used by default to send the request
				// instead its converted into the necessary parameters and path before sending
				// this is to address the if the service url is relative
				if (this.sNextLink && this.sNextLink.indexOf("?") > -1) {
					var oNextLink = this.oModel.getNextLink(this.sNextLink, this.sPath, mParameters);
					this._submitRequest(oNextLink.url, oNextLink.parameters, fnSuccess, true);
				} else {
					this._submitRequest(this.sNextLink, undefined, fnSuccess, true);
				}
			} else if (this.iTotalLength === undefined){ // load context based resources
				this.iLastLength = this.iLength;
				this._loadProfile(fnSuccessStructDef, fnLoadResources, fnSuccess, mParameters, iLength);
			} else if (!this._isValueSet()){
				if (iLength > this.iLastLength){
					this.iLastLength += this.iLength;
				}
				if (!this.iLastLength){
					this.iLastLength = this.iLength;
				}
				this._loadResources(this.iLastLength);
			}
		}

		this._buildContexts(iLength);
		return this.aContexts;
	};

	/**
			 * Loads the FHIR resources based on the configured <code>oContext</code> and <code>sPath</code>
			 *
			 * @param {number} iLength The requested length of data
			 * @private
			 * @since 1.0.0
			 */
	FHIRListBinding.prototype._loadResources = function(iLength) {
		var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext, this.bUnique);
		var vValue = this.oModel.getProperty(this.sPath, this.oContext);
		var iValuesLength = 0;
		if (oBindingInfo && oBindingInfo.getAbsolutePath().endsWith("]")){
			iValuesLength = vValue && Object.keys(vValue).length;
			this._buildKeys(oBindingInfo.getAbsolutePath().substring(1), vValue, iValuesLength);
		} else if (Array.isArray(vValue)){
			var vValueOld = this.oModel.getProperty(this.sPath, this.oContext, this.oModel.oDataServerState);
			var iValuesLengthOld = vValueOld ? Object.keys(vValueOld).length : 0;
			iValuesLength = Object.keys(vValue).length;
			this.iClientChanges = iValuesLength - iValuesLengthOld;
			this._buildKeys(oBindingInfo.getAbsolutePath().substring(1), vValue, iLength || iValuesLength);
			iValuesLength -= this.iClientChanges;
		} else if (vValue && typeof vValue === "object") {
			var aClientChanges = this.oModel.mOrderResources[oBindingInfo.getResourceType()];
			this.iClientChanges = aClientChanges && aClientChanges.length || 0;
			if (this.iClientChanges > 0){
				this.aKeys = aClientChanges.concat(this.aKeysServerState);
			} else {
				this.aKeys = FHIRUtils.deepClone(this.aKeysServerState);
			}
			iValuesLength = this.aKeys.length - this.iClientChanges;
			var aClientRemovedResources = this.oModel.mRemovedResources[oBindingInfo.getResourceType()];
			if (aClientRemovedResources){
				this.aKeys = this.aKeys.filter(function (sResPath) {
					return !aClientRemovedResources.includes(sResPath);
				});
				this.iTotalLength = this.aKeys.length;
			}
		} else {
			this.iClientChanges = 0;
			this.aKeys = this.aKeysServerState;
		}
		if (this.iTotalLength === undefined){
			this._markSuccessRequest(vValue, iValuesLength);
		}
	};

	/**
					 * Builds the binding context array for the list
					 *
					 * @param {number} iLength the current requested length of the paging
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._buildContexts = function(iLength) {
		if (!this.aContexts) {
			this.aContexts = [];
		}
		if (this.aKeys) {
			if (iLength === undefined || iLength > this.aKeys.length || isNaN(iLength)){
				iLength = this.aKeys.length;
			}
			this.aContexts = [];
			for (var j = 0; j < iLength; j++) {
				this.aContexts.push(Context.create(this.oModel, this, "/" + this.aKeys[j], this.sGroupId));
			}
		}
	};

	/**
					 * Executes an ajax call with given <code>sPath</code>, <code>mParameters</code>. Additionally, it's possible to assign the given function <code>fnSuccessCallback</code> as
					 * a callback function which is executed when the ajax call was executed successfully
					 *
					 * @param {string} sPath The path of the resource which will be requested, relative to the root URL of the FHIR server
					 * @param {object} mParameters The URL parameters which are send by the request e.g. _count, _summary
					 * @param {function} fnSuccessCallback The callback function which is executed if the request was successful
					 * @param {boolean} [bForceDirectCall] Determines if this binding should avoid the bundle request
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._submitRequest = function(sPath, mParameters, fnSuccessCallback, bForceDirectCall) {
		var fnErrorCallback = function(oData) {
			if (oData.message !== "abort"){
				this.bPendingRequest = false;
				this.bResourceNotAvailable = true;
				this.fireDataReceived({
					data : oData
				});
			}
		}.bind(this);
		this.bDirectCallPending = bForceDirectCall;
		if (!mParameters){
			mParameters = {};
		}
		mParameters.binding = this;
		mParameters.forceDirectCall = bForceDirectCall;
		mParameters.successBeforeMapping = fnSuccessCallback;
		mParameters.error = fnErrorCallback;
		this.oModel.loadData(sPath, mParameters);
		this.bPendingRequest = true;
	};

	/**
					 * Writes the aKeys based on the given <code>sUri</code> and <code>iNumberOfKeys</code> and <code>oValues</code>
					 *
					 * @param {string} sUri The URI for the keys, e.g. Patient/1234/gender
					 * @param {any} vValues The data of the whole list
					 * @param {number} iNumberOfKeys The number of keys which will be created
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._buildKeys = function(sUri, vValues, iNumberOfKeys) {
		this.aKeys = [];
		var j = 0;
		for (var sKey in vValues) {
			var sPathForKey = sUri + "/" + sKey;
			if (j < iNumberOfKeys){
				this.aKeys[j] = sPathForKey;
				j++;
			}

		}
	};

	/**
					 * Mark the pending request as successful and attach a new data received callback
					 *
					 * @param {object} oData The data retrieved from the server
					 * @param {number} iTotalLength The number of resources retrieved from the server
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._markSuccessRequest = function(oData, iTotalLength) {
		if (oData && oData.hasOwnProperty("link")) {
			this.sNextLink = FHIRUtils.getLinkUrl(oData.link, "next");
			this.sPrevLink = FHIRUtils.getLinkUrl(oData.link, "previous");
		}
		this.aKeysServerState = FHIRUtils.deepClone(this.aKeys);
		this.iTotalLength = iTotalLength;
		this.bPendingRequest = false;
		this.bInitial = false;
		this.oModel.attachAfterUpdate(function() {
			this.fireDataReceived({
				data : oData
			});
		}.bind(this));
	};

	/**
					 * Loads the resource profile based on the given <code>mParameters</code> or if a binding exits by the configured <code>sPath</code> and <code>oContext</code>
					 *
					 * @param {function} fnSuccessCallbackStructureDefintion The callback which is executed when the StructureDefinition is loaded successfully
					 * @param {function} fnLoadResources The function which loads the desired resources
					 * @param {function} fnSuccessCallback The callback which is executed if no binding is found and the profile is loaded by the given <code>mParameters</code>
					 * @param {object} mParameters The URL parameters which are send by the request, e.g. _count, _summary
					 * @param {number} iLength The requested data length for this list binding
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._loadProfile = function(fnSuccessCallbackStructureDefintion, fnLoadResources, fnSuccessCallback, mParameters, iLength) {
		if (!this.isRelative()) {
			this._submitRequest(this.sPath, mParameters, fnSuccessCallback);
		} else if (this.oContext && this.bValueSetLookupInStructureDefinition) {
			var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext, this.bUnique);
			var oResource = this.oModel.getProperty(oBindingInfo.getResourcePath()) || {};
			oResource.resourceType = oResource.resourceType || oBindingInfo.getResourceType();
			var sStrucDefUrl = this.oModel.getStructureDefinitionUrl(oResource);
			var aStructDefs = [];
			FHIRUtils.filterObject(this.oModel.oData.StructureDefinition, "url", sStrucDefUrl, 1, aStructDefs);
			if (aStructDefs.length > 0) {
				this.oStructureDefinition = aStructDefs[0];
				fnLoadResources();
			} else {
				this._submitRequest("/StructureDefinition", { urlParameters : {url : sStrucDefUrl}}, fnSuccessCallbackStructureDefintion, true);
			}
		} else {
			this._loadResources(iLength);
		}
	};

	/**
			 * Check whether this binding would provide new values and in case it changed, inform interested parties about this
			 *
			 * @param {boolean} [bForceUpdate] Force update of binding
			 * @param {object} [mChangedEntities] The map of changed entities
			 * @param {string} [sMethod] The URL request method
			 * @protected
			 * @since 1.0.0
			 */
	FHIRListBinding.prototype.checkUpdate = function(bForceUpdate, mChangedEntities, sMethod) {
		var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext, this.bUnique);
		var mResources = oBindingInfo && mChangedEntities && mChangedEntities[oBindingInfo.getResourceType()];
		if (mResources && sMethod && sMethod !== HTTPMethod.GET) {
			var sResType = oBindingInfo.getResourceType();
			for (var sId in mResources) {
				var sResPath = sResType + "/" + sId;
				if (!this.isRelative()) {
					if (sMethod === HTTPMethod.DELETE) {
						// check for context
						if (this.oModel.mRemovedResources[sResType] && this.oModel.mRemovedResources[sResType].indexOf(sResPath) > -1) {
							// client changes (not yet submitted to server)
							this.aKeys.splice(this.aKeys.indexOf(oBindingInfo.getResourceType() + "/" + sId), 1);
						} else {
							// server changes (response from server after submitted the removed resources directly)
							this.aKeysServerState.splice(this.aKeysServerState.indexOf(oBindingInfo.getResourceType() + "/" + sId), 1);
						}
					} else if (sMethod === HTTPMethod.POST) {
						this.iTotalLength++;
						this.aKeysServerState.unshift(oBindingInfo.getResourceType() + "/" + sId);
					} else if (sMethod === HTTPMethod.PUT && oBindingInfo.getBinding().length === 3) { // in case of history entry update
						this.iTotalLength++;
						this.aKeysServerState.unshift(oBindingInfo.getAbsolutePath().substring(1) + "/" + mResources[sId].meta.versionId);
					}
				} else if (sMethod === HTTPMethod.PUT) {
					this.iTotalLength = undefined;
				}
			}
		}
		var sPath = this.oModel._getProperty(mChangedEntities, ["path", "lastUpdated"]);
		if (oBindingInfo && (sPath && FHIRUtils.getNumberOfLevelsByPath(sPath) < 3 && sPath.indexOf(oBindingInfo.getResourceType()) > -1 || sPath === oBindingInfo.getAbsolutePath()) || bForceUpdate === true || sMethod) {
			this._fireChange({
				reason: ChangeReason.Change
			});
		}
	};

	/**
			 * Determines if the value set configured by <code>mParameters</code> is hard coded or came by a reference
			 *
			 * @returns {boolean} if this binding has a hard coded value set url
			 * @private
			 * @since 1.0.0
			 */
	FHIRListBinding.prototype._isValueSetHardCoded = function() {
		return this.mParameters && this.mParameters.request && this.mParameters.request.hasOwnProperty("url");
	};

	/**
			 * Determines the URI of an value set from the configured <code>oStructureDefinition</code>
			 *
			 * @returns {string} The URI of an ValueSet
			 * @private
			 * @since 1.0.0
			 */
	FHIRListBinding.prototype._getValueSetUriFromStructureDefinition = function() {
		var aElement = this.oModel._getProperty(this.oStructureDefinition, ["snapshot", "element"]);
		if (aElement && aElement.length > 0) {
			var aType = this.oModel._getProperty(this.oStructureDefinition, [
				"snapshot",
				"element",
				"[id=" + aElement[0].id + "." + this.sPath + "]",
				"type"
			]);
			if (aType && (aType[0].code === "code" || aType[0].code === "CodeableConcept")){
				return this.oModel._getProperty(this.oStructureDefinition, [
					"snapshot",
					"element",
					"[id=" + aElement[0].id + "." + this.sPath + "]",
					"binding",
					"valueSet"
				]);
			}
		}
		return undefined;
	};

	/**
			 * Determines if the current binding underlies an value set
			 *
			 * @returns {boolean} if this binding is binded to a valueset
			 * @private
			 * @since 1.0.0
			 */
	FHIRListBinding.prototype._isValueSet = function() {
		if (this.aKeys && this.aKeys.length > 0) {
			return this.aKeys[0].indexOf("ValueSet") > -1;
		} else if (this.sPath.indexOf("ValueSet") > -1 || this._isValueSetHardCoded() || this._getValueSetUriFromStructureDefinition()) {
			return true;
		}
		return false;
	};

	/**
					 * Determines the number of entities contained by the actual list binding
					 *
					 * @returns {number} The number of entities contained by the current list binding
					 * @public
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.getLength = function() {
		if ( this.iTotalLength !== undefined ){
			return this.iTotalLength + this.iClientChanges;
		} else {
			return undefined;
		}
	};

	/**
			 * Filters the actual list binding depending on the given <code>aFilters</code>
			 *
			 * @param {sap.ui.model.Filter[]} [aFilters] The filters defined for the list binding
			 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
			 * @public
			 * @since 1.0.0
			 */
	FHIRListBinding.prototype.filter = function (aFilters, sFilterType) {
		FHIRUtils.filter(aFilters, this, sFilterType);
	};

	/**
					 * Sorts the actual list binding based on the given <code>aSorters</code>
					 *
					 * @param {sap.ui.model.Sorter[]} aSorters The sorters defined for the list binding
					 * @param {boolean} bRefresh If the binding should directly send a call or wait for the filters, for p13ndialog
					 * @public
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.sort = function(aSorters, bRefresh) {
		FHIRUtils.sort(aSorters, this, bRefresh);
	};

	/**
					 * Sets the context of the list binding and refreshes the binding
					 *
					 * @param {sap.fhir.model.r4.Context} oContext The context object
					 * @protected
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.setContext = function(oContext) {
		if (this.oContext !== oContext && this.isRelative()){
			this.oContext = oContext;
			this.refresh(ChangeReason.Context);
		}
	};

	/**
					 * Refreshes the list binding
					 *
					 * @param {sap.ui.model.ChangeReason} sChangeReason The reason for refreshing the binding
					 * @public
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.refresh = function(sChangeReason) {
		this._resetData();
		this._fireChange({
			reason : sChangeReason
		});
	};

	/**
					 * Resets the data of the list binding
					 *
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._resetData = function() {
		this.aKeys = [];
		this.aKeysServerState = [];
		this.bResourceNotAvailable = false;
		this.aContexts = undefined;
		this.iTotalLength = undefined;
		this.bInitial = true;
		this.sNextLink = undefined;
		this.sPrevLink = undefined;
		this.iLastLength = undefined;
		this.aFilterCache = undefined;
		this.aSortersCache = undefined;
		this.iClientChanges = 0;
	};

	/**
					 * Determines if the list binding is configured in client mode
					 *
					 * @returns {boolean} if the model is initialized with the client mode
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._isClientMode = function() {
		return this.sOperationMode === OperationMode.Client;
	};

	/**
					 * Determines if the list binding is configured in server mode
					 *
					 * @returns {boolean} if the model is initialized with the server mode
					 * @private
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype._isServerMode = function() {
		return this.sOperationMode === OperationMode.Server;
	};

	/**
					 * Determines the actual filters of the list binding
					 *
					 * @returns {sap.ui.model.Filter[]} The array containing the actual filters
					 * @public
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.getFilters = function() {
		return this.aFilters;
	};

	/**
					 * Determines the actual sorters of the list binding
					 *
					 * @returns {sap.ui.model.Sorter[]} The array containing the actual sorters
					 * @public
					 * @since 1.0.0
					 */
	FHIRListBinding.prototype.getSorters = function() {
		return this.aSorters;
	};

	return FHIRListBinding;

});
