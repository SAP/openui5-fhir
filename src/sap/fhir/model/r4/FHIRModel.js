/*!
 * ${copyright}
 */

/**
 * Model and related classes like bindings for FHIR® Release 4 (R4).
 *
 * @name sap.fhir.model.r4
 * @namespace
 * @public
 * @since 1.0.0
 */

// Provides class sap.fhir.model.r4.FHIRModel
sap.ui.define([
	"sap/ui/model/Model",
	"sap/fhir/model/r4/FHIRListBinding",
	"sap/fhir/model/r4/FHIRPropertyBinding",
	"sap/fhir/model/r4/FHIRContextBinding",
	"sap/fhir/model/r4/FHIRTreeBinding",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/fhir/model/r4/OperationMode",
	"sap/ui/thirdparty/URI",
	"sap/fhir/model/r4/lib/BindingInfo",
	"sap/fhir/model/r4/lib/Sliceable",
	"sap/fhir/model/r4/SubmitMode",
	"sap/fhir/model/r4/lib/FHIRRequestor",
	"sap/fhir/model/r4/lib/HTTPMethod",
	"sap/fhir/model/r4/lib/FHIRBundle",
	"sap/ui/model/ChangeReason",
	"sap/fhir/model/r4/lib/FHIRUrl",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/fhir/model/r4/Context",
	"sap/ui/core/message/Message",
	"sap/ui/core/library",
	"sap/fhir/model/r4/FHIRFilterProcessor",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/type/Url",
	"sap/fhir/model/r4/type/Uuid"
], function(Model, FHIRListBinding, FHIRPropertyBinding,
	FHIRContextBinding, FHIRTreeBinding, FHIRUtils, OperationMode, URI, BindingInfo, Sliceable, SubmitMode, FHIRRequestor, HTTPMethod, FHIRBundle, ChangeReason, FHIRUrl, Log, deepEqual, each, Context, Message, coreLibrary, FHIRFilterProcessor, FHIRFilterOperator, Url, Uuid) {

	"use strict";

	var MessageType = coreLibrary.MessageType;

	/**
	 * Constructor for a new FHIRModel. Model implementation for FHIR R4.
	 *
	 * @class
	 * @classdesc The implementation of the FHIRModel
	 * @alias sap.fhir.model.r4.FHIRModel
	 * @param {string} sServiceUrl The root URL of the FHIR server to request data from e.g. http://example.com/fhir
	 * @param {object} mParameters The parameters
	 * @param {string} [mParameters.baseProfileUrl] The URL of the base profiles for all resource types. If no one is given, the model will use the FHIR default profiles located at
	 *            http://hl7.org/fhir/StructureDefinition/ The base profile of a resource type is used to load the structure definition of a requested resource type, if no profile is maintained
	 *            (oResource.meta.profile[0]) at the requested resource
	 * @param {string} [mParameters.defaultSubmitMode] The default SubmitMode for all bindings which are associated with this model
	 * @param {string} [mParameters.defaultFullUrlType='uuid'] The default FullUrlType if the default submit mode is either batch or transaction
	 * @param {object} [mParameters.defaultQueryParameters={}] The default query parameters to be passed on resource type specific requests and not resource instance specific requests (e.g /Patient?_total:accurate&_format:json). It should be of type key:value pairs. e.g. {'_total':'accurate'} -> http://hl7.org/fhir/http.html#parameters
	 * @param {string} [mParameters.Prefer='return=minimal'] The FHIR server won't return the changed resource by an POST/PUT request -> https://www.hl7.org/fhir/http.html#2.21.0.5.2
	 * @param {boolean} [mParameters.x-csrf-token=false] The model handles the csrf token between the browser and the FHIR server
	 * @param {object} [mParameters.filtering={}] The filtering options
	 * @param {boolean} [mParameters.filtering.complex=false] The default filtering type. If <code>true</code>, all search parameters would be modelled via {@link https://www.hl7.org/fhir/search_filter.html _filter}
	 * @param {boolean} [mParameters.search={}] The search options
	 * @param {boolean} [mParameters.search.secure=false] To enable RESTful search via {@link https://www.hl7.org/fhir/http.html#search POST}
	 * @throws {Error} If no service URL is given, if the given service URL does not end with a forward slash
	 * @author SAP SE
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRModel = Model.extend("sap.fhir.model.r4.FHIRModel", {

		constructor : function(sServiceUrl, mParameters) {
			Model.apply(this);
			if (!sServiceUrl) {
				throw new Error("Missing service root URL");
			}
			sServiceUrl = sServiceUrl.slice(-1) === "/" ?  sServiceUrl.slice(0, -1) : sServiceUrl;
			this.oServiceUrl = new URI(sServiceUrl);
			this.sServiceUrl = this.oServiceUrl.query("").toString();
			this._setupData();
			this.aCallAfterUpdate = [];
			this.sDefaultOperationMode = OperationMode.Server;
			this.sBaseProfileUrl = mParameters && mParameters.baseProfileUrl ? mParameters.baseProfileUrl : "http://hl7.org/fhir/StructureDefinition/";
			this._buildGroupProperties(mParameters);
			this.oDefaultQueryParameters = mParameters && mParameters.defaultQueryParameters && mParameters.defaultQueryParameters instanceof Object ? mParameters.defaultQueryParameters : {};
			this.bSecureSearch = mParameters && mParameters.search && mParameters.search.secure ? mParameters.search.secure : false;
			this.oRequestor = new FHIRRequestor(sServiceUrl, this, mParameters && mParameters["x-csrf-token"], mParameters && mParameters.Prefer, this.oDefaultQueryParameters);
			this.sDefaultSubmitMode = (mParameters && mParameters.defaultSubmitMode) ? mParameters.defaultSubmitMode : SubmitMode.Direct;
			this.sDefaultFullUrlType = (mParameters && mParameters.defaultSubmitMode && mParameters.defaultSubmitMode !== SubmitMode.Direct && mParameters.defaultFullUrlType) ? mParameters.defaultFullUrlType : "uuid";
			this.oDefaultUri = this.sDefaultFullUrlType === "url" ? new Url() : new Uuid();
			this.iSizeLimit = 10;
			if (mParameters && mParameters.filtering && mParameters.filtering.complex === true){
				this.iSupportedFilterDepth = undefined;
			} else {
				this.iSupportedFilterDepth = 2;
			}
		},

		metadata : {
			publicMethods : []
		}

	});

	/**
	 * @typedef {object} sap.fhir.model.r4.RequestParameters
	 * @prop {object} [urlParameters] The parameters that will be passed as query strings
	 * @prop {function} [successBeforeMapping] The callback function which is executed if the request was successful, in particular before the map process starts
	 * @prop {function} [success] The callback function which is executed if the request was successful, in particular after the map process has been finished
	 * @prop {function} [error] The callback function which is executed if the request failed
	 * @prop {object} [headers] Additional HTTP Headers which should be added to the request
	 * @prop {string} [groupId] Identifier for the creation of a bundle which contains several requests
	 * @public
	 * @since 1.0.0
	 */

	/**
	 * @typedef {sap.fhir.model.r4.RequestParameters} sap.fhir.model.r4.RequestParametersIntern
	 * @prop {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @prop {boolean} [bManualSubmit] The switch if a bundle will be manually submitted
	 * @prop {boolean} [forceDirectCall] Flag that the request is send directly and not in a bundle with other requests
	 * @private
	 * @since 1.0.0
	 */

	/**
	 * @typedef {object} sap.fhir.model.r4.RequestInfo
	 * @prop {sap.fhir.model.r4.HTTPMethod} method e.g. POST, PUT, DELETE, GET
	 * @prop {string} url The request goes to
	 * @private
	 * @since 1.0.0
	 */

	/**
	 * Fired, when a request was sent to the FHIR Server
	 *
	 * @event sap.fhir.model.r4.FHIRModel#requestSent
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oEvent.getParameters.requestHandle Wrapper for the jqXHR request object, binding which potentially triggered the request and the request URL
	 * @public
	 * @since 1.0.0
	 */

	/**
	 * Fired, when a request is completed
	 *
	 * @event sap.fhir.model.r4.FHIRModel#requestCompleted
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oEvent.getParameters.requestHandle Wrapper for the jqXHR request object, binding which potentially triggered the request and the request URL
	 * @public
	 * @since 1.0.0
	 */

	/**
	 * Fired, when a request failed
	 *
	 * @event sap.fhir.model.r4.FHIRModel#requestFailed
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oEvent.getParameters.requestHandle Wrapper for the jqXHR request object, binding which potentially triggered the request and the request URL
	 * @public
	 * @since 1.0.0
	 */


	/**
	 * Setups the data , server state and client changes
	 *
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._setupData = function(){
		this.oData = {};
		this.oDataServerState = {};
		this.mChangedResources = {};
		this.mOrderResources = {};
		this.mResourceGroupId = {};
		this.mContexts = {};
		this.mMessages = {};
		this.mRemovedResources = {};
	};

	/**
	 * Determines the URL of the base profiles for all resource types
	 *
	 * @public
	 * @returns {string} The base profile URL
	 * @since 1.0.0
	 */
	FHIRModel.prototype.getBaseProfileUrl = function() {
		return this.sBaseProfileUrl;
	};

	/**
	 * Determines the root URL of the FHIR server
	 *
	 * @public
	 * @returns {string} The service URL
	 * @since 1.0.0
	 */
	FHIRModel.prototype.getServiceUrl = function() {
		return this.sServiceUrl;
	};

	/**
	 * Creates a new list binding for the given <code>sPath</code> and optional <code>oContext</code>
	 *
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} [oContext] The context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter[]} [aSorters] The sorters to be used initially
	 * @param {sap.ui.model.Filter[]} [aFilters] The filters to be used initially
	 * @param {object} [mParameters] Map of binding parameters which can be FHIR specific parameters or binding-specific parameters as specified below.
	 * @param {sap.fhir.model.r4.OperationMode} [mParameters.operationMode] The operation mode for sorting and filtering {@link sap.fhir.model.r4.OperationMode.Server} is supported. All other
	 *            operation modes including <code>undefined</code> lead to an error if 'aSorters', 'aFilters' are given or if {@link sap.fhir.model.r4.FHIRListBinding#sort} or
	 *            {@link sap.fhir.model.r4.FHIRListBinding#filter} are called.
	 * @param {string} [mParameters.url] If the list binding contains a hard coded set of entities which is identified by the given URL
	 * @returns {sap.fhir.model.r4.FHIRListBinding} The list binding
	 * @throws {Error} if an unsupported operation mode is used
	 * @public
	 * @see sap.ui.model.Model#bindList
	 * @since 1.0.0
	 */
	FHIRModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new FHIRListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	/**
	 * Creates a new property binding for the given <code>sPath</code>
	 *
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} [oContext] The context which is required as base for a relative path
	 * @param {object} [mParameters] Map of binding parameters Note: Currently no FHIR specific binding parameters are used
	 * @returns {sap.fhir.model.r4.FHIRPropertyBinding} The property binding
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @since 1.0.0
	 */
	FHIRModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new FHIRPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Creates a new tree binding for the given <code>sPath</code> and optional <code>oContext</code>
	 *
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} [oContext] The context which is required as base for a relative path
	 * @param {sap.ui.model.Filter[]} [aFilters] The filters to be used initially
	 * @param {object} [mParameters] Map of binding parameters which can be FHIR specific parameters
	 * @param {sap.ui.model.Sorter[]} [aSorters] The sorters to be used initially
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} The tree binding
	 * @throws {Error} if an unsupported operation mode is used
	 * @public
	 * @see sap.ui.model.Model#bindTree
	 * @since 1.0.0
	 */
	FHIRModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters, aSorters) {
		var oBinding = new FHIRTreeBinding(this, sPath, oContext, aFilters, mParameters, aSorters);
		return oBinding;
	};

	/**
	 * Creates a new context binding for the given <code>sPath</code>, <code>oContext</code> and <code>mParameters</code>
	 *
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} [oContext] The context which is required as base for a relative path
	 * @param {object} [mParameters] Map of binding parameters Note: Currently no FHIR specific binding parameters are used
	 * @returns {sap.fhir.model.r4.FHIRContextBinding} The context binding
	 * @public
	 * @see sap.ui.model.Model#bindContext
	 * @since 1.0.0
	 */
	FHIRModel.prototype.bindContext = function(sPath, oContext, mParameters) {
		var oBinding = new FHIRContextBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Transforms the retrieved data from the FHIR service to the model structure
	 *
	 * @param {object} oData The FHIR response send by the FHIR Service
	 * @param {object} mResponseHeaders The HTTP headers which were sent by the server e.g. etag, etc.
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} oBundleEntry The request object which identifies the executed request, either the request handle or the bundle entry
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @param {string} sGroupId The group which triggered the mapping of response
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._mapFHIRResponse = function(oData, mResponseHeaders, oBundleEntry, oBinding, sGroupId) {
		if (oData.entry && oData.resourceType === "Bundle") {
			for (var i = 0; i < oData.entry.length; i++) {
				var oResource = oData.entry[i].resource;
				if (oResource && oResource.resourceType === "Bundle") {
					this._mapFHIRResponse(oResource, mResponseHeaders, oBundleEntry, sGroupId);
				} else if (!oResource && oData.entry[i].response) {
					this._updateResourceFromFHIRResponse(oData.entry[i].response, oData.entry[i].fullUrl, oBundleEntry);
				} else {
					this._storeResourceInModel(oResource, oBinding, sGroupId);
				}
			}
		} else if (oData.resourceType !== "Bundle") {
			this._storeResourceInModel(oData, oBinding, sGroupId);
		}
	};

	/**
	 * Stores the retrieved FHIR resource in the model depending if it is a ValueSet or another resource
	 *
	 * @param {object} oResource The FHIR resource
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @param {string} sGroupId The group which triggered the mapping of response
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._storeResourceInModel = function(oResource, oBinding, sGroupId) {
		var aResourcePath;
		if (oResource.resourceType === "ValueSet" && oResource.expansion && oResource.expansion.identifier) {
			aResourcePath = [oResource.resourceType, "§" + oResource.expansion.identifier + "§"];
			oResource = oResource.expansion.contains;
		} else {
			// generate a uuid id in case resource id is not present in the response
			if (!oResource.id) {
				oResource.id = FHIRUtils.uuidv4();
			}
			aResourcePath = [oResource.resourceType, oResource.id];
			var aHistoryResourcePath = [
				"$_history",
				oResource.resourceType,
				oResource.id
			];
			if (oResource.meta && oResource.meta.versionId){
				aHistoryResourcePath.push(oResource.meta.versionId);
			}
			if (oBinding){
				var oBindingInfo = this.getBindingInfo(oBinding.sPath, oBinding.oContext, oBinding.mParameters && oBinding.mParameters.unique, oResource);
				aResourcePath = oBindingInfo.getBinding();
			}
			this._setProperty(this.mResourceGroupId, FHIRUtils.deepClone(aResourcePath), sGroupId, true);
			this._setProperty(this.oData, aHistoryResourcePath, oResource, true);
		}
		this._setProperty(this.oData, aResourcePath, oResource, true);
	};

	/**
	 * Transforms the retrieved data from the FHIR service to FHIR resource
	 *
	 * @param {object} mResponseHeaders The HTTP headers which were sent by the server e.g. etag, etc.
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} oFHIRBundleEntry FHIR Bundle entry object
	 * @returns {object} FHIR resource object
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._getUpdatedResourceFromFHIRResponse = function(mResponseHeaders, oFHIRBundleEntry){
		// remove possible slash at the beginning
		if (mResponseHeaders.location && mResponseHeaders.location.charAt(0) === "/") {
			mResponseHeaders.location = mResponseHeaders.location.slice(1);
		}
		var oBindingInfo = this.getBindingInfo("/" + mResponseHeaders.location);
		var oRes;
		if (oFHIRBundleEntry){
			oRes = oFHIRBundleEntry.getResource();
		} else {
			oRes = this._getProperty(this.oData, [oBindingInfo.getResourceType(), oBindingInfo.getResourceId()]);
		}
		oRes.id = oBindingInfo.getResourceId();
		return oRes;
	};

	/**
	 * Updates the FHIR resource from the retrieved data of the FHIR service
	 *
	 * @param {object} mResponseHeaders The HTTP headers which were sent by the server e.g. etag, etc.
	 * @param {string} sRequestUrl The requested FHIR resource
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} oFHIRBundleEntry FHIR Bundle entry object
	 * @returns {object} FHIR resource object
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._updateResourceFromFHIRResponse = function(mResponseHeaders, sRequestUrl, oFHIRBundleEntry){
		var oRes = this._getUpdatedResourceFromFHIRResponse(mResponseHeaders, oFHIRBundleEntry);
		this._setProperty(oRes, ["meta", "versionId"], mResponseHeaders.etag);
		this._setProperty(oRes, ["meta", "lastUpdated"], mResponseHeaders.lastModified);
		return oRes;
	};

	/**
	 * Maps a given set of <code>aBundleEntries</code> to a map of resources
	 *
	 * @param {array} aBundleEntries The set of bundle arrays
	 * @returns {object} The map of resources
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._mapBundleEntriesToResourceMap = function(aBundleEntries) {
		var mResources = {};
		for (var i = 0; i < aBundleEntries.length; i++) {
			var oResource;
			if (!aBundleEntries[i]) {
				throw new Error("No response from the FHIR Service available");
			}
			if (!aBundleEntries[i].resource && aBundleEntries[i].response) {
				oResource = this._getUpdatedResourceFromFHIRResponse(aBundleEntries[i].response);
			} else {
				oResource = aBundleEntries[i].resource;
			}
			if (oResource && oResource.resourceType == "Bundle" && oResource.entry) {
				mResources = this._mapBundleEntriesToResourceMap(oResource.entry);
			} else if (oResource && oResource.resourceType && oResource.id) {
				this._setProperty(mResources, [oResource.resourceType, oResource.id], oResource, true);
			} else {
				throw new Error("No resource could be found for bundle entry: " + aBundleEntries[i]);
			}
		}
		return mResources;
	};

	/**
	 * Maps a given FHIR resource to a map of resources
	 *
	 * @param {object} oData The FHIR resource
	 * @returns {object} The map of resources
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._mapResourceToResourceMap = function(oData) {
		var mResources = {};
		if (oData && oData.resourceType === "ValueSet" && oData.expansion && oData.expansion.identifier) {
			this._setProperty(mResources, ["ValueSet", "§" + oData.expansion.identifier + "§"], oData.expansion.contains, true);
		} else if (oData && oData.resourceType && oData.id && oData.resourceType !== "Bundle") {
			this._setProperty(mResources, [oData.resourceType, oData.id], oData, true);
		} else if (!oData){
			 throw new Error("No data could be found which should be mapped as updated resource");
		}
		return mResources;
	};

	/**
	 * Processes the response of the requested FHIR service. Fills the model with the retrieved data and updates all effected bindings and fires the event
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request object which identifies the executed request
	 * @param {object} [oResponse] The FHIR response send by the FHIR Service
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} [oBundleEntry] The bundle entry of a bundle request
	 * @param {function} fnSuccessCallbackBeforeMapping The callback function which is executed before the map process starts
	 * @param {function} fnSuccessCallbackAfterMapping The callback function which is executed after the map process finished
	 * @param {sap.fhir.model.r4.HTTPMethod} sMethod The HTTP method which was used by the request e.g. GET, HTTPMethod.POST, etc.
	 * @param {object} mParameters The URL parameters which are send by the request e.g. _count, _summary
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._onSuccessfulRequest = function(oRequestHandle, oResponse, oBundleEntry, fnSuccessCallbackBeforeMapping, fnSuccessCallbackAfterMapping, sMethod, mParameters) {
		var sRequestUrl;
		var mResponseHeaders;
		var sGroupId;
		var oBinding;
		if (oBundleEntry) {
			oBinding = oBundleEntry.getRequest().getBinding();
			sRequestUrl = oBundleEntry.getRequest().getUrl();
			sGroupId = oRequestHandle.getBundle().getGroupId();
			if (oResponse.resource && HTTPMethod.GET === sMethod){
				oResponse = oResponse.resource;
			} else if (HTTPMethod.DELETE !== sMethod) {
				mResponseHeaders = oResponse.response;
				oResponse = this._updateResourceFromFHIRResponse(mResponseHeaders, oBundleEntry.getFullUrl(), oBundleEntry);
			}
		} else {
			sRequestUrl = oRequestHandle.getUrl();
			mResponseHeaders = this.oRequestor.getResponseHeaders(oRequestHandle.getRequest());
			oBinding = oRequestHandle.getBinding();
		}

		if (fnSuccessCallbackBeforeMapping) {
			fnSuccessCallbackBeforeMapping(oResponse);
		}

		if (sMethod !== HTTPMethod.HEAD){
			var oFHIRUrl;
			if (sMethod === HTTPMethod.DELETE){
				oFHIRUrl = new FHIRUrl(sRequestUrl, this.sServiceUrl);
				oResponse = FHIRUtils.deepClone(this.oData[oFHIRUrl.getResourceType()][oFHIRUrl.getResourceId()]);
				delete this.oData[oFHIRUrl.getResourceType()][oFHIRUrl.getResourceId()];
			} else if (!oResponse){ // in case it was a direct request and the prefer header is set to minimal
				oResponse = JSON.parse(oRequestHandle.getData());
				oFHIRUrl = new FHIRUrl(mResponseHeaders.location, this.sServiceUrl);
				oResponse.id = oFHIRUrl.getResourceId();
				oResponse.meta = {};
				oResponse.meta.versionId = oFHIRUrl.getHistoryVersion();
				oResponse.meta.lastUpdated = mResponseHeaders["last-modified"];
				this.oData[oResponse.resourceType][oResponse.id] = oResponse;
			} else {
				this._mapFHIRResponse(oResponse, mResponseHeaders, oBundleEntry, oBinding, sGroupId);
			}

			var mChangedResources = oResponse.entry ? this._mapBundleEntriesToResourceMap(oResponse.entry) : this._mapResourceToResourceMap(oResponse);

			this.checkUpdate(false, mChangedResources, oBinding, sMethod);
		}

		if (fnSuccessCallbackAfterMapping) {
			fnSuccessCallbackAfterMapping(oResponse);
		}
	};

	/**
	 * Tracks the error of the requested FHIR service. Logs the error and fires the event
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object which identifies the executed request
	 * @param {object} oResponse The response body of the FHIR Server
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} oBundleEntry The FHIR Bundle Entry
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @param {function} fnErrorCallback The callback function which is executed before log process starts
	 * @param {string} sMethod The HTTP method which was used by the request e.g. GET, HTTPMethod.POST, etc.
	 * @param {Error} oError stacktrace with error message which occured in a callback
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._processError = function(oRequestHandle, oResponse, oBundleEntry, oBinding, fnErrorCallback, sMethod, oError) {
		var oMessage = this._publishMessage(oRequestHandle, oResponse, oBundleEntry, oBinding, oError);
		Log.fatal(sMethod + " " + oMessage.getDescriptionUrl() + ", Statuscode: " + oMessage.getCode()  + "\nError message: " + oMessage.getMessage());
		if (fnErrorCallback) {
			fnErrorCallback(oMessage);
		}
	};


	/**
	 * Tracks the error of the requested FHIR service. Logs the error and fires the event
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object which identifies the executed request
	 * @param {object} [oResponse] The response body of the FHIR Server
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} [oBundleEntry] The FHIR Bundle Entry
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @param {Error} [oError] stacktrace with error message which occured in a callback
	 * @returns {object} oMessage The message which was created
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._publishMessage = function(oRequestHandle, oResponse, oBundleEntry, oBinding, oError){
		var mParameters;
		if (oBundleEntry && oResponse){
			var oErrorCode = parseInt(oResponse.response.status.substring(0,3), 10);
			mParameters = {
				message : oResponse.response.status.substring(4),
				description : JSON.stringify(oResponse.response),
				code : oErrorCode,
				descriptionUrl : oBundleEntry.getRequest().getUrl(),
				binding : oBinding,
				additionalText : oErrorCode
			};
		} else {
			mParameters = {
				message : oRequestHandle.getRequest().statusText,
				description : oRequestHandle.getRequest().responseText,
				code : oRequestHandle.getRequest().status,
				descriptionUrl : oRequestHandle.getUrl(),
				binding : oBinding,
				additionalText : oRequestHandle.getRequest().status
			};
		}

		mParameters.type = MessageType.Error;

		if (oError){
			mParameters.message = oError.message;
			mParameters.additionalText = oError.stack;
		}

		var oMessage = new Message(mParameters);

		if ((!this.mMessages[oMessage.descriptionUrl] || !oBinding) && oMessage.code){
			this.mMessages[oMessage.descriptionUrl] = oMessage;
			this.fireMessageChange({newMessages : oMessage});
		}

		return oMessage;
	};


	/**
	 * Loads data from a FHIR service
	 *
	 * @param {string} sPath The path of the resource which will be requested, relative to the root URL of the FHIR server
	 * @param {sap.fhir.model.r4.RequestParameters | sap.fhir.model.r4.RequestParametersIntern} [mParameters] The URL parameters which are send by the request e.g. _count, _summary
	 * @param {string} [sMethod] The HTTP method which was used by the request e.g. GET, HTTPMethod.POST, etc.
	 * @param {object} [oPayload] The data which will be send in the request header
	 * @returns {sap.fhir.model.r4.lib.FHIRBundle | sap.fhir.model.r4.lib.RequestHandle} A request handle or a bundle.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRModel.prototype.loadData =
			function(sPath, mParameters, sMethod, oPayload) {
				sMethod = sMethod || HTTPMethod.GET;
				if (!mParameters){
					mParameters = {};
				}
				var oBinding = mParameters.binding;
				var sGroupId = mParameters.groupId || (oBinding && oBinding.sGroupId);
				var fnSuccess = function(oRequestHandle, oResponse, oBundleEntry) {
					if (!oResponse){
						oResponse = oRequestHandle.getRequest().responseJSON;
					}
					try {
						this._onSuccessfulRequest(oRequestHandle, oResponse, oBundleEntry, mParameters.successBeforeMapping, mParameters.success, sMethod, mParameters.urlParameters);
						var sUrl = oBundleEntry ? oBundleEntry.getRequest().getUrl() : oRequestHandle.getUrl();
						if (this.mMessages[sUrl]){
							this.fireMessageChange({oldMessages : this.mMessages[sUrl]});
							delete this.mMessages[sUrl];
						}
					} catch (oError){
						this._processError(oRequestHandle, oResponse, oBundleEntry, oBinding, mParameters.error, sMethod, oError);
					}
				}.bind(this);

				var fnError = function(oRequestHandle, oResponse, oBundleEntry) {
					this._processError(oRequestHandle, oResponse, oBundleEntry, oBinding, mParameters.error, sMethod);
				}.bind(this);

				var oRequestHandle = this.oRequestor._request(sMethod, sPath, mParameters.forceDirectCall, mParameters.urlParameters, sGroupId, mParameters.headers, oPayload, fnSuccess, fnError, oBinding, mParameters.manualSubmit);

				return oRequestHandle;
			};

	/**
	 * Submits the client changes of the model to the FHIR service
	 *
	 * @param {string} [sGroupId] The group id to submit only a specific group, leave empty when all changes should be submitted
	 * @param {function} [fnSuccessCallback] The callback function which is executed with specific parameters after the changes are send successfully to the server<br>
	 *                                   Batch/Transaction Submit Mode fnSuccessCallback(aFHIRResources)<br>
	 *                                   Direct Mode fnSuccessCallback(oFHIRResource)
	 * @param {function} [fnErrorCallback] The callback function which is executed with specific parameters when the transport to the server failed<br>
	 *                                   Batch/Transaction Submit Mode fnErrorCallback(oMessage, aSuccessResource, aOperationOutcome)<br>
	 *                                   Direct Mode fnErrorCallback(oMessage)
	 * @returns {object} mRequestHandles contains all request groups and direct requests which where submitted, e.g. {"patientDetails": oFHIRBundle1, "direct": [oRequestHandle1, oRequestHandle2],
	 *          "patientList": oFHIRBundle2}, if there are no changes undefined is returned
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.submitChanges =
			function(sGroupId, fnSuccessCallback, fnErrorCallback) {
				if (typeof sGroupId === "function") {
					fnErrorCallback = fnSuccessCallback;
					fnSuccessCallback = FHIRUtils.deepClone(sGroupId);
					sGroupId = undefined;
				}
				var fnError = function (oParams) {
					if (fnErrorCallback) {
						fnErrorCallback(oParams);
					}
				};

				var fnSuccess = function () {
					this.resetChanges(sGroupId, true);
				}.bind(this);

				var mRequestHandles;
				var aPromises = [];
				var iTriggeredVersionRequests = 0;

				var fnSubmitBundles = function () {
					var oPromiseHandler = {};
					var fnSuccessPromise = function (aFHIRResource) {
						oPromiseHandler.resolve(aFHIRResource);
					};
					var fnErrorPromise = function (oRequestHandle, aFHIRResource, aFHIROperationOutcome) {
						var oError = {};
						// this is done since promise catch can have only one parameter
						oError.requestHandle = oRequestHandle;
						oError.resources = aFHIRResource;
						oError.operationOutcomes = aFHIROperationOutcome;
						oPromiseHandler.reject(oError);
					};
					for (var sRequestHandleKey in mRequestHandles) {
						if (sRequestHandleKey !== "direct") {
							// eslint-disable-next-line no-undef
							var oPromise = new Promise(
								function (resolve, reject) {
									oPromiseHandler.resolve = resolve;
									oPromiseHandler.reject = reject;
								}
							);
							aPromises.push(oPromise);
							oPromise.then(function (aFHIRResource) {
								fnSuccessCallback(aFHIRResource);
							}).catch(function (oError) {
								if (fnErrorCallback && oError.requestHandle) {
									var mParameters = {
										message: oError.requestHandle.getRequest().statusText,
										description: oError.requestHandle.getRequest().responseText,
										code: oError.requestHandle.getRequest().status,
										descriptionUrl: oError.requestHandle.getUrl()
									};
									var oMessage = new Message(mParameters);
									fnErrorCallback(oMessage, oError.resources, oError.operationOutcomes);
								}
							});
							mRequestHandles[sRequestHandleKey] = this.oRequestor.submitBundle(sRequestHandleKey, fnSuccessPromise, fnErrorPromise);
						}
					}
				}.bind(this);

				var oBindingInfo;
				var fnCheckSubmitChange = function(){
					var iTriggeredVersionRequestsCompleted = 0;
					var aResourcePath = oBindingInfo.getResourcePathArray();
					var oResourceNew = this._getProperty(this.oData, aResourcePath);
					var sResourceGroupId = this._getProperty(this.mResourceGroupId, aResourcePath);
					var bSubmitChanges;
					if (sGroupId && sResourceGroupId === sGroupId){
						bSubmitChanges = true;
					} else if (!sGroupId) {
						bSubmitChanges = true;
					} else {
						bSubmitChanges = false;
					}
					if (bSubmitChanges){
						var oResourceOld = this._getProperty(this.oDataServerState, aResourcePath);
						var oRequestInfo = this._getProperty(this.mChangedResources, aResourcePath);
						if (!deepEqual(oResourceNew, oResourceOld) || (oRequestInfo && oRequestInfo.method === HTTPMethod.DELETE)) {
							var mHeaders;
							var fnSubmitChange = function() {
								var mParameters = {
										 successBeforeMapping : fnSuccess,
										 success : fnSuccessCallback,
										 error : fnError,
										 headers : mHeaders,
										 groupId : sResourceGroupId,
										 manualSubmit : true
								};
								if (sGroupId && sResourceGroupId === sGroupId && this.getGroupSubmitMode(sGroupId) !== "Direct") {
									mParameters.success = function () { };
									mParameters.error = function () { };
								}
								var vRequestHandle = this.loadData(oRequestInfo.url, mParameters, oRequestInfo.method, oResourceNew);
								mRequestHandles = mRequestHandles ? mRequestHandles : {};
								if (vRequestHandle instanceof FHIRBundle && !mRequestHandles[vRequestHandle.getGroupId()]) {
									mRequestHandles[vRequestHandle.getGroupId()] = {};
								} else if (!mRequestHandles.direct) {
									mRequestHandles.direct = [];
									mRequestHandles.direct.push(vRequestHandle);
								} else {
									mRequestHandles.direct.push(vRequestHandle);
								}
							}.bind(this);


							var fnVersionReadSuccess = function(sETag){
								iTriggeredVersionRequestsCompleted++;
								mHeaders = {
									"If-Match" : sETag
								};
								fnSubmitChange();
								if (iTriggeredVersionRequests === iTriggeredVersionRequestsCompleted){
									fnSubmitBundles();
								}
							};

							if (oRequestInfo.method === HTTPMethod.PUT) {
								var sETag = oBindingInfo.getETag();
								if (!sETag){
									this.readLatestVersionOfResource(oBindingInfo.getResourceServerPath(), fnVersionReadSuccess);
									iTriggeredVersionRequests++;
								} else {
									mHeaders = {
										"If-Match" : sETag
									};
									fnSubmitChange();
								}
							} else {
								fnSubmitChange();
							}
						}
					}
				}.bind(this);

				for ( var vType in this.mChangedResources) {
					for (var vId in this.mChangedResources[vType]){
						if (vType === "$_history"){
							for (var vOriginId in this.mChangedResources[vType][vId]){
								for (var sVersion in this.mChangedResources[vType][vId][vOriginId]){
									oBindingInfo = this.getBindingInfo("/" + vType + "/" + vId + "/" + vOriginId + "/" + sVersion);
									fnCheckSubmitChange();
								}
							}
						} else {
							oBindingInfo = this.getBindingInfo("/" + vType + "/" + vId);
							fnCheckSubmitChange();
						}
					}
				}
				if (iTriggeredVersionRequests === 0){
					fnSubmitBundles();
				}
				return mRequestHandles;
			};

	/**
	 * Checks if an update for the existing bindings is necessary due to the <code>mChangedResources</code>
	 *
	 * @param {boolean} [bForceUpdate] Force update of bindings
	 * @param {object} [mChangedResources] The object containing the changed resources
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oTriggerBinding] The binding which triggered the check update
	 * @param {sap.fhir.model.r4.HTTPMethod} [sMethod] The http method which triggered the checkupdate()
	 * @protected
	 * @since 1.0.0
	 */
	FHIRModel.prototype.checkUpdate = function(bForceUpdate, mChangedResources, oTriggerBinding, sMethod) {
		var aBindings = this.aBindings.slice(0);
		each(aBindings, function(iIndex, oBinding) {
			oBinding.checkUpdate(bForceUpdate, mChangedResources, sMethod);
		});
		this._processAfterUpdate();
	};

	/**
	 * Registers a function which shall be executed after the update of the model has been performed
	 *
	 * @param {function} fnAfterUpdate The function which shall be executed after the update of the model has been performed
	 * @protected
	 * @since 1.0.0
	 */
	FHIRModel.prototype.attachAfterUpdate = function(fnAfterUpdate) {
		this.aCallAfterUpdate.push(fnAfterUpdate);
	};

	/**
	 * Executes all registered after update functions
	 *
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._processAfterUpdate = function() {
		var aCallAfterUpdate = this.aCallAfterUpdate;
		this.aCallAfterUpdate = [];
		for (var i = 0; i < aCallAfterUpdate.length; i++) {
			aCallAfterUpdate[i]();
		}
	};

	/**
	 * Refreshes the model and all associated bindings
	 *
	 * @see sap.ui.model.Model#refresh
	 * @see sap.fhir.model.r4.FHIRContextBinding#refresh
	 * @see sap.fhir.model.r4.FHIRListBinding#refresh
	 * @see sap.fhir.model.r4.FHIRTreeBinding#refresh
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.refresh = function() {
		this._setupData();
		for (var i = 0; i < this.aBindings.length; i++){
			this.aBindings[i].refresh(ChangeReason.Refresh);
		}
	};

	/**
	 * Determines the value for the property in the model based on the given <code>sPath</code> and <code>oContext</code> and <code>oDataExt</code>
	 *
	 * @param {string} [sPath] The path to the desired property
	 * @param {sap.fhir.model.r4.Context} [oContext] The binding context
	 * @param {object} [oDataExt] The data object containing the desired property
	 * @returns {object} the value behind the path
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.getProperty = function(sPath, oContext, oDataExt) {
		var oData = this.oData;
		if (oDataExt) {
			oData = oDataExt;
		}
		var oBinding = this.getBindingInfo(sPath, oContext);
		if (oBinding) {
			return this._getProperty(oData, oBinding.getBinding());
		}
		return undefined;
	};

	/**
	 * Determines the value for the property in the given <code>oObject</code> based on the given <code>sPath</code>
	 *
	 * @param {object} [vObject] The data object containing the desired property
	 * @param {string[]} aPath The path to the desired property e.g ["Patient", "132627", "gender"]
	 * @returns {any} the value behind the path
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._getProperty = function(vObject, aPath) {

		// deepClone is necessary here, because the original aPath value should not be overriden by the following actions
		aPath = FHIRUtils.deepClone(aPath);

		if (!vObject) { // property not existing
			return undefined;
		}
		var aReferencePath;
		var mSliceExpressions;

		if (aPath.length === 1) {
			if (Sliceable.containsSliceable(aPath[0])){
				mSliceExpressions = Sliceable.getSliceables(aPath[0]);
				return this._findMatchingSlice(vObject, mSliceExpressions);
			} else {
				return vObject[aPath[0]];
			}
		}

		var oNextObject;
		var sNextProperty = aPath.shift();
		if (sNextProperty === "reference" && vObject.reference && typeof vObject.reference === "string") {
			aReferencePath = FHIRUtils.splitPath(vObject.reference);
			oNextObject = this.oData[aReferencePath[0]][aReferencePath[1]];
		} else if (Sliceable.containsSliceable(sNextProperty)) {
			mSliceExpressions = Sliceable.getSliceables(sNextProperty);
			oNextObject = this._findMatchingSlice(vObject, mSliceExpressions, false);
			var aKeys = oNextObject && Object.keys(oNextObject);
			if (aKeys && !isNaN(aKeys[0])){
				sNextProperty = aPath.shift();
				oNextObject = vObject[sNextProperty];
			}
		} else {
			oNextObject = vObject[sNextProperty];
		}

		return this._getProperty(oNextObject, aPath);
	};

	/**
	 * Handles the client changes info objects
	 *
	 * @param {sap.fhir.model.r4.lib.BindingInfo} oBindingInfo The binding info containing path and context
	 * @param {string} [sGroupId] The group id for the changed resource
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._handleClientChanges = function(oBindingInfo, sGroupId){
		if (!sGroupId){
			sGroupId = oBindingInfo.getGroupId();
		}
		var aResPath = oBindingInfo.getResourcePathArray();
		var vServerValue = this._getProperty(this.oDataServerState, aResPath);
		var oRequestInfo = this._getProperty(this.mChangedResources, aResPath);
		var oResource = this._getProperty(this.oData, aResPath);
		if (!oRequestInfo && oResource) {
			oRequestInfo = this._createRequestInfo(HTTPMethod.PUT, oBindingInfo.getResourceServerPath());
			this._setProperty(this.mChangedResources, FHIRUtils.deepClone(aResPath), oRequestInfo, true);
		} else if (!oRequestInfo) {
			oRequestInfo = this._createRequestInfo(HTTPMethod.POST, oBindingInfo.getResourceType());
			this._setProperty(this.mChangedResources, FHIRUtils.deepClone(aResPath), oRequestInfo, true);
		}
		if (sGroupId) {
			this._setProperty(this.mResourceGroupId, FHIRUtils.deepClone(aResPath), sGroupId, true);
		}
		if (!this._isServerStateUpToDate(vServerValue, oResource, oRequestInfo.method)) {
			this._setProperty(this.oDataServerState, aResPath, FHIRUtils.deepClone(oResource), true);
		}
	};

	/**
	 * Sets a new value for the property on the the given <code>sPath</code> in the model
	 *
	 * @param {string} sPath The path of the property to set
	 * @param {any} vValue The value to set the property to
	 * @param {sap.fhir.model.r4.Context} [oContext] The context which will be used to set the property
	 * @param {sap.fhir.model.r4.PropertyBinding} oBinding That the checkupdate method doesn't run in not associated bindings less round trips
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.setProperty = function(sPath, vValue, oContext, oBinding) {
		var oBindingInfo = this.getBindingInfo(sPath, oContext);
		this._handleClientChanges(oBindingInfo);
		this._setProperty(this.oData, oBindingInfo.getBinding(), vValue, undefined, oBindingInfo.getGroupId());
		var aResPath = oBindingInfo.getResourcePathArray();
		var vServerValue = this._getProperty(this.oDataServerState, aResPath);
		var oRequestInfo = this._getProperty(this.mChangedResources, aResPath);
		var oResource = this._getProperty(this.oData, aResPath);
		// special handling when the server data and the client changed data is the same
		if (oRequestInfo && oRequestInfo.method === HTTPMethod.PUT && deepEqual(vServerValue, oResource)) {
			delete this.mChangedResources[aResPath[0]][aResPath[1]];
		} else {
			this.mChangedResources.path = { lastUpdated: oBindingInfo.getAbsolutePath() };
		}
		this.checkUpdate(false, this.mChangedResources, oBinding);
	};

	/**
	 * Sets a new value for the property on the given <code>oObject</code> on the given <code>iIndex</code> in the binding <code>aPath</code>
	 *
	 * @param {object} oObject The object which should get a new property value
	 * @param {string[]} aPath The binding path e.g. ["Patient", "123", "gender"]
	 * @param {any} vValue The new property value
	 * @param {boolean} [bForceResourceCreation] Wether it's definitely a resource object which shall be created
	 * @param {string} [sGroupId] The group id for the changed resource
	 * @param {number} [iIndex] The index of the property in the <code>aPath</code> which should get a new value
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._setProperty = function(oObject, aPath, vValue, bForceResourceCreation, sGroupId, iIndex) {
		if (iIndex === undefined){
			iIndex = 0;
		}
		var oNextObject;
		var aReferencePath;
		var sProperty = aPath[iIndex];
		var sNextProperty;
		if (sProperty === "reference" && aPath.length - 1 !== iIndex){
			aReferencePath = FHIRUtils.splitPath(oObject[sProperty]);
			var oBindingInfo = this.getBindingInfo("/" + oObject[sProperty]);
			this._handleClientChanges(oBindingInfo, sGroupId);
			oNextObject = this.oData[aReferencePath[0]][aReferencePath[1]];
		} else if (aPath.length - 1 === iIndex) {
			if (vValue) {
				oObject[sProperty] = vValue;
			} else {
				delete oObject[sProperty];
			}
			return;
		} else if (Sliceable.containsSliceable(sProperty)) {
			sNextProperty = aPath[iIndex + 1];
			if (!isNaN(sNextProperty)){
				iIndex++;
				oNextObject = oObject[sNextProperty];
			} else {
				var mSliceExpressions = Sliceable.getSliceables(sProperty);
				oNextObject = this._findMatchingSlice(oObject, mSliceExpressions);
				if (!oNextObject) {
					oNextObject = {};
					for (var sKey in mSliceExpressions) {
						var vFilter = mSliceExpressions[sKey];
						if (vFilter.aFilters){
							for (var i = 0; i < vFilter.aFilters.length; i++){
								this._setProperty(oNextObject, FHIRUtils.splitPath(vFilter.aFilters[i].sPath), vFilter.aFilters[i].oValue1);
							}
						} else {
							this._setProperty(oNextObject, FHIRUtils.splitPath(vFilter.sPath), vFilter.oValue1);
						}
					}
					oObject.push(oNextObject);
				}
			}
		} else if (!oObject.hasOwnProperty(sProperty)) {
			sNextProperty = aPath[iIndex + 1];
			if (bForceResourceCreation || (isNaN(sNextProperty) && !Sliceable.containsSliceable(sNextProperty))) {
				oObject[sProperty] = {};
			} else {
				oObject[sProperty] = [];
			}
		}
		this._setProperty(oNextObject || oObject[sProperty], aPath, vValue, bForceResourceCreation, sGroupId, iIndex + 1);
	};

	/**
	 * Sets an object in a given resource map, by default it's the changed resource map
	 *
	 * @param {sap.fhir.model.r4.HTTPMethod} sMethod e.g. POST, PUT, DELETE, GET
	 * @param {string} sUrl The request goes to
	 * @returns {sap.fhir.model.r4.RequestInfo} oRequestInfo
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._createRequestInfo = function(sMethod, sUrl) {
		return {
			method : sMethod,
			url : sUrl
		};
	};

	/**
	 * Resolves the absolute path by a given context with potential parent contexts and the path of the property
	 *
	 * @param {string} sPath The path inside the model
	 * @param {sap.fhir.model.r4.Context}[oContext] The context which resolves a relative <code>sPath</code>
	 * @returns {string} The absolute path to a model property
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._resolvePath = function(sPath, oContext){
		if (oContext && (!sPath || sPath && !sPath.startsWith("/"))){
			var sContextPath = oContext.sPath;
			var oParentContext = oContext.getBinding().getContext();
			var sRelativePath = sPath ? "/" + sPath : "";
			return this._resolvePath(sContextPath, oParentContext) + sRelativePath;
		} else if (sPath && sPath.startsWith("/")){
			return sPath;
		} else {
			return undefined;
		}
	};

	/**
	 * Creates the binding information based on the given <code>sPath</code> and <code>oContext</code>
	 *
	 * @param {string} sPath The path inside the model
	 * @param {sap.fhir.model.r4.Context}[oContext] The context which resolves a relative <code>sPath</code>
	 * @param {string} [bUnique] Other unique identifier property path than logical id of FHIR resource
	 * @param {object} [oResource] The FHIR resource
	 * @returns {sap.fhir.model.r4.lib.BindingInfo} The binding info to the given sPath and context
	 * @protected
	 * @since 1.0.0
	 */
	FHIRModel.prototype.getBindingInfo = function(sPath, oContext, bUnique, oResource) {
		var sCompletePath = this._resolvePath(sPath, oContext);
		if (sCompletePath) {
			var aSplittedPath = FHIRUtils.splitPath(sCompletePath);
			var aResPath;
			var sId;
			var sResType;
			var sResPath;
			var sRelPath;
			var sVersion;
			var sCompletePathChange;
			var sRequestablePath;
			var sResourceServerPath;
			var sETag;
			var sGroupId = oContext && oContext.sGroupId;
			var sOperation = "";
			if (sCompletePath.indexOf("_history") > -1 || bUnique){
				if (oResource){
					sResType = oResource.resourceType;
					sId = oResource.id;
					sVersion = this._getProperty(oResource, ["meta", "versionId"]);
				} else if (sCompletePath.startsWith("/$")){
					sResType = aSplittedPath[2];
					sId = aSplittedPath[3];
					sVersion = aSplittedPath[4];
				} else {
					sResType = aSplittedPath[1];
					sId = aSplittedPath[2];
					sVersion = aSplittedPath[4];
				}
				if (sVersion){
					sVersion = "/" + sVersion;
				} else {
					sVersion = "";
				}
				sRelPath = aSplittedPath.slice(5).join("/");
				sRequestablePath = "/" + sResType + "/" + sId + "/_history" + sVersion;
				sResPath = "/$_history" + "/" + sResType + "/" + sId + sVersion;
				if (sRelPath){
					sCompletePathChange = sResPath + "/" + sRelPath;
				} else {
					sCompletePathChange = sResPath;
				}
			} else if (oResource) {
				sResType = oResource.resourceType;
				sId = oResource.id;
				sResPath = "/" + sResType + "/" + sId;
				sCompletePathChange = sResPath;
			} else {
				sOperation = this.determineOperation(sCompletePath);
				sResType = aSplittedPath[1];
				if (aSplittedPath[2] && aSplittedPath[2] !== sOperation){
					sId = aSplittedPath[2];
					sResPath = "/" + aSplittedPath[1] + "/" + aSplittedPath[2];
					sRelPath = aSplittedPath.slice(3).join("/");
				}
				if (sOperation){
					sCompletePathChange = sCompletePath.replace(sOperation, "");
					sRelPath = sRelPath.replace(sOperation.substring(1) + "/", "");
				}
			}
			if (sCompletePathChange) {
				aSplittedPath = FHIRUtils.splitPath(sCompletePathChange);
				sCompletePath = sCompletePathChange;
			}
			if (!sRequestablePath){
				sRequestablePath = (sResPath || sResType || "") + sOperation;
			}
			if (sResPath){
				aResPath = FHIRUtils.splitPath(sResPath).slice(1);
			}
			if (sResType && sId){
				sResourceServerPath = "/" + sResType + "/" + sId;
				sETag = this._getProperty(this.oData, [
					sResType,
					sId,
					"meta",
					"versionId"
				]);
				if (sETag) {
					sETag = "W/\"" + sETag + "\"";
				}
			}
			return new BindingInfo(sId, sResType, sResPath, sRelPath, sCompletePath, aSplittedPath.slice(1), sGroupId, sRequestablePath, aResPath, sResourceServerPath, sETag);
		}
		return undefined;
	};

	/**
	 * Determines if there is an operation in the given string
	 *
	 * @param {string} sPath The path request path
	 * @returns {string} Empty string if no operation is found or \"$operation\"
	 * @protected
	 * @since 1.0.0
	 */
	FHIRModel.prototype.determineOperation = function(sPath){
		var sOperation = "";
		var iIndexOperation = sPath.indexOf("$");
		if (iIndexOperation > -1 && iIndexOperation !== 1){
			var sRelPath = sPath.substring(iIndexOperation);
			var iIndexNextSlash = sRelPath.indexOf("/");
			if (iIndexNextSlash > -1){
				sOperation = "/" + sRelPath.substring(0, iIndexNextSlash);
			} else {
				sOperation = "/" + sRelPath;
			}
		}
		return sOperation;
	};

	/**
	 * Determines the property which contains a sliceable object in the given <code>vObject</code> based on the given <code>mSliceables</code>
	 *
	 * @param {object} vObject Either an array or resource when revinclude is in slice
	 * @param {sap.fhir.model.r4.lib.SliceableMap} mSliceables The array of sliceable objects
	 * @param {boolean} bIsEnd If the slice is not at the end of the absolute path
	 * @returns {object} The property of the given<code>vObject</code> which contains a sliceable object
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._findMatchingSlice = function(vObject, mSliceables, bIsEnd) {
		var mEntries = {};
		var oEntry;
		var fnGetValue = function (oObject, sProperty){
			return this._getProperty(oObject, FHIRUtils.splitPath(sProperty));
		}.bind(this);
		for (var sKey in mSliceables) {
			if (mSliceables[sKey].sPath && mSliceables[sKey].sPath.startsWith("revreference/")){
				var sResourceType = mSliceables[sKey].sPath.substring(13);
				if (bIsEnd !== false){
					var aPath = FHIRUtils.splitPath(mSliceables[sKey].oValue1);
					for (var sResourceId in this.oData[sResourceType]){
						var sResource = this._getProperty(this.oData[sResourceType][sResourceId], aPath);
						if (sResource === (vObject.resourceType + "/" + vObject.id)){
							mEntries[sResourceType + "/" + sResourceId] = this.oData[sResourceType][sResourceId];
						}
					}
					return mEntries;
				} else {
					return this.oData;
				}
			} else {
				for (var i = 0; i < vObject.length; i++) {
					oEntry = vObject[i];
					if (FHIRFilterProcessor._evaluateFilter(mSliceables[sKey], oEntry, fnGetValue)){
						mEntries[i] = oEntry;
					}
				}
			}
		}
		var aKeys = Object.keys(mEntries);
		mEntries = aKeys.length === 0 ? undefined : mEntries;
		return aKeys.length === 1 ? mEntries[aKeys[0]] : mEntries;
	};

	/**
	 * Determines if there are any pending changes for the given <code>sResourceType</code>
	 *
	 * @param {string} sResourceType The FHIR resource type
	 * @returns {boolean} true there are changes for the given resource type.
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.hasResourceTypePendingChanges = function(sResourceType) {
		return this.mChangedResources[sResourceType] !== undefined && Object.keys(this.mChangedResources[sResourceType]).length > 0;
	};

	/**
	 * Destroys this model
	 *
	 * @see sap.ui.model.Model#destroy
	 * @public
	 * @override
	 * @since 1.0.0
	 */
	FHIRModel.prototype.destroy = function() {
		this.oRequestor.destroy();
		this.aCallAfterUpdate = [];
		this.mChangedResources = {};
		Model.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Returns a group property value.
	 *
	 * @param {string} sGroupId The group id
	 * @param {string} sPropertyName The group property in question
	 * @returns {any} The group property value
	 * @throws {Error} If the name of the group property is not 'submit' or 'uri'
	 * @protected
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 * @since 1.0.0
	 */
	FHIRModel.prototype.getGroupProperty = function(sGroupId, sPropertyName) {
		switch (sPropertyName) {
			case "submit":
				return this.getGroupSubmitMode(sGroupId);
			case "uri":
				return this.getGroupUri(sGroupId);
			default:
				throw new Error("Unsupported group property: " + sPropertyName);
		}
	};


	/**
	 * Determines the submit mode for the given <code>sGroupId</code>. If no submit mode is defined in the group properties or there are no group properties at all for the given
	 * <code>sGroupId</code> the default submit mode of the model is returned
	 *
	 * @param {string} sGroupId The group id
	 * @returns {sap.fhir.model.r4.SubmitMode} the mode for the given group
	 * @protected
	 * @since 1.0.0
	 */
	FHIRModel.prototype.getGroupSubmitMode = function(sGroupId) {
		return (this.mGroupProperties && this.mGroupProperties[sGroupId] && this.mGroupProperties[sGroupId].submit) || this.sDefaultSubmitMode;
	};

	/**
	 * Determines the fullUrl type mode for the given <code>sGroupId</code>. If no submit mode is defined in the group properties or there are no group properties at all for the given
	 * <code>sGroupId</code> the default URI is returned
	 *
	 * @param {string} sGroupId The group id
	 * @returns {sap.fhir.model.r4.type.Uri} the URI Object
	 * @protected
	 * @since 1.1.0
	 */
	FHIRModel.prototype.getGroupUri = function(sGroupId) {
		var oGroupUri = this.oDefaultUri;
		if (this.mGroupProperties && this.mGroupProperties[sGroupId] && this.mGroupProperties[sGroupId].fullUrlType === "url"){
			oGroupUri = new Url();
		}
		return oGroupUri;
	};

	/**
	 * Sets the group properties of the model by the given <code>mParameters</code>
	 *
	 * @param {object} mParameters The parameters
	 * @throws {Error} if parameters are not valid
	 * @private
	 * @since 1.0.0
	 */
	FHIRModel.prototype._buildGroupProperties =
			function(mParameters) {
				if (mParameters) {
					var oGroupProperties;
					for ( var sGroupId in mParameters.groupProperties) {
						oGroupProperties = mParameters.groupProperties[sGroupId];
						if (typeof oGroupProperties !== "object") {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. The properties must be of type object, found \"" + oGroupProperties + "\"");
						} else if (Object.keys(oGroupProperties).length === 2 && (!oGroupProperties.submit || !oGroupProperties.fullUrlType)) {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. Only the property \"submit\" and \"fullUrlType\" is allowed and has to be set, found \"" + JSON.stringify(oGroupProperties)
									+ "\"");
						} else if (Object.keys(oGroupProperties).length === 1 && !oGroupProperties.submit && oGroupProperties.fullUrlType) {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. The property \"fullUrlType\" is allowed only when submit property is present, found \"" + JSON.stringify(oGroupProperties)
									+ "\"");
						} else if (Object.keys(oGroupProperties).length === 1 && !oGroupProperties.submit) {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. Only the property \"submit\" is allowed and has to be set, found \"" + JSON.stringify(oGroupProperties)
									+ "\"");
						} else if (oGroupProperties.submit && !(oGroupProperties.submit in SubmitMode)) {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. The value of property \"submit\" must be of type sap.fhir.model.r4.SubmitMode, found: \""
									+ oGroupProperties.submit + "\"");
						} else if (oGroupProperties.fullUrlType && (oGroupProperties.fullUrlType !== "uuid" && oGroupProperties.fullUrlType !== "url")) {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. The value of property \"fullUrlType\" must be either uuid or url, found: \""
									+ oGroupProperties.fullUrlType + "\"");
						} else if (oGroupProperties.submit && (oGroupProperties.submit !== SubmitMode.Batch && oGroupProperties.submit !== SubmitMode.Transaction) && oGroupProperties.fullUrlType) {
							throw new Error("Group \"" + sGroupId + "\" has invalid properties. The value of property \"fullUrlType\" is applicable only for batch and transaction submit modes, found: \""
									+ oGroupProperties.submit + "\"");
						}
					}
					this.mGroupProperties = mParameters.groupProperties;
				} else {
					Log.info("no parameters are defined to build group properties");
				}
			};

	/**
	 * Triggers a <code>GET</code> request to the FHIR server that was specified in the model constructor. The data will be stored in the model
	 *
	 * @param {string} sPath A string containing the path to the data which should be retrieved. The path is concatenated to the service URL which was specified in the model constructor.
	 * @param {sap.fhir.model.r4.RequestParameters} [mParameters] The additional request parameters
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} A request handle.
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.sendGetRequest = function(sPath, mParameters) {
		return this.loadData(sPath, mParameters);
	};

	/**
	 * Triggers a <code>POST</code> request to the FHIR server that was specified in the model constructor. The data will be stored in the model
	 *
	 * @param {string} sPath A string containing the path to the data which should be retrieved. The path is concatenated to the service URL which was specified in the model constructor.
	 * @param {object} [oPayload] The request body
	 * @param {sap.fhir.model.r4.RequestParameters} [mParameters] The additional request parameters
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} A request handle.
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.sendPostRequest = function(sPath, oPayload, mParameters) {
		var bBundleType = oPayload && oPayload.type && (oPayload.type == "batch" || oPayload.type == "transaction") ? true : false;
		if (bBundleType) {
			mParameters.forceDirectCall = true;
		}
		return this.loadData(sPath, mParameters, HTTPMethod.POST, oPayload);
	};

	/**
	 * Triggers a <code>HEAD</code> request to the FHIR server that was specified in the model constructor. If HEAD isn't available it sends a GET request and updates the resource data in the model implicitly
	 *
	 * @param {string} sPath A string containing the path to the resource which should be requested.
	 * @param {function} [fnSuccess] The callback function which is executed after the version read was successfully
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.readLatestVersionOfResource = function(sPath, fnSuccess) {
		var oRequestHandle;
		var fnExtractVersion = function (oData) {
			var mHeaders = this.oRequestor.getResponseHeaders(oRequestHandle.getRequest());
			var sETagHeader = mHeaders ? mHeaders["etag"] : undefined;
			var sLocationHeader = mHeaders ? mHeaders["location"] || mHeaders["content-location"] : undefined;
			var oFHIRUrl = sLocationHeader ? new FHIRUrl(sLocationHeader, this.sServiceUrl) : undefined;
			var sETag;
			if (sETagHeader) {
				sETag = sETagHeader;
			} else if (oFHIRUrl && oFHIRUrl.getHistoryVersion()) {
				sETag = "W/\"" + oFHIRUrl.getHistoryVersion() + "\"";
			} else if (oData && oData.meta && oData.meta.versionId) {
				sETag = "W/\"" + oData.meta.versionId + "\"";
			}
			fnSuccess(sETag);
		}.bind(this);
		var mParameters = {
			success: fnExtractVersion,
			error: function () {
				oRequestHandle.getRequest().complete(function () {
					mParameters = {
						success: fnExtractVersion
					};
					oRequestHandle = this.loadData(sPath, mParameters, HTTPMethod.GET);
				}.bind(this));
			}.bind(this)
		};
		oRequestHandle = this.loadData(sPath, mParameters, HTTPMethod.HEAD);
	};


	/**
	 * Creates a new resource based on the given <code>sResourceType</code> with given <code>oData</code>. Note: The resource will be created only on the client side, to push the created resource
	 * to the server {@link sap.fhir.model.r4.FHIRModel#submitChanges} has to be called afterwards
	 *
	 * @param {string} sResourceType The resource type
	 * @param {object} [oData] The data of the resource
	 * @param {string} [sGroupId] The group where the resource should belongs to
	 * @returns {string} The uuidv4 of the created resource
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.create = function(sResourceType, oData, sGroupId) {
		var sResourceId = FHIRUtils.uuidv4();
		var sResourcePath = "/" + sResourceType + "/" + sResourceId;
		if (!this.mOrderResources[sResourceType]){
			this.mOrderResources[sResourceType] = [sResourcePath.substring(1)];
		} else {
			this.mOrderResources[sResourceType].unshift(sResourcePath.substring(1));
		}
		if (!oData){
			oData = { resourceType : sResourceType , id : sResourceId};
		} else {
			oData.resourceType = sResourceType;
			oData.id = sResourceId;
		}
		this.setProperty(sResourcePath, oData);
		if (sGroupId){
			this._setProperty(this.mResourceGroupId, [sResourceType , sResourceId], sGroupId, true);
		}
		return sResourceId;
	};

	/**
	 * Mark resources for the DELETE request which have to be submitted to the server with the submitChanges() method or delete client changes
	 *
	 * @param {string[]} aResources the resources which shall be deleted, e.g. ["/Patient/123", "/Organization/XYZ"]
	 * @param {function} [fnPreProcess] to preprocess the objects of the given aResources
	 * @param {string} [sGroupId] The group where the resource should belongs to
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.remove = function (aResources, fnPreProcess, sGroupId) {
		for (var i = 0; i < aResources.length; i++) {
			var sResourcePath = fnPreProcess ? fnPreProcess(aResources[i]) : aResources[i];
			var oBindingInfo = this.getBindingInfo(sResourcePath);
			var aResPath = oBindingInfo.getResourcePathArray();
			var oRequestInfo = this._getProperty(this.mChangedResources, aResPath);
			var sResourceGroupId = this._getProperty(this.mResourceGroupId, aResPath);
			if (oRequestInfo && oRequestInfo.method == HTTPMethod.POST) {
				this._setProperty(this.oData, FHIRUtils.deepClone(aResPath));
				this._setProperty(this.mResourceGroupId, FHIRUtils.deepClone(aResPath));
				this._setProperty(this.mChangedResources, FHIRUtils.deepClone(aResPath));
				this._removeFromOrderResources(oBindingInfo);
				this.checkUpdate(true);
			} else {
				oRequestInfo = this._createRequestInfo(HTTPMethod.DELETE, oBindingInfo.getResourceServerPath());
				this._setProperty(this.mChangedResources, FHIRUtils.deepClone(aResPath), oRequestInfo, true, sResourceGroupId && sResourceGroupId === sGroupId ? sGroupId : undefined);
				this._addToRemovedResources(oBindingInfo, sResourcePath);
				this.checkUpdate(true, this.mChangedResources, oBindingInfo, HTTPMethod.DELETE);
			}
		}
	};

	/**
	 * Adds the resource path to the removed resources map
	 *
	 * @param {sap.fhir.model.r4.lib.BindingInfo} oBindingInfo The binding info object
	 * @param {string} [sResourcePath] The resource path of the removed resource
	 * @private
	 */
	FHIRModel.prototype._addToRemovedResources = function (oBindingInfo, sResourcePath) {
		if (!this.mRemovedResources[oBindingInfo.getResourceType()]) {
			this.mRemovedResources[oBindingInfo.getResourceType()] = [sResourcePath.substring(1)];
		} else {
			this.mRemovedResources[oBindingInfo.getResourceType()].unshift(sResourcePath.substring(1));
		}
	};

	/**
	 * Resets the model to the state when the model was synchronized with the server for the last time.
	 * Resetting means newly created resources are removed and changed resources are rolled backed to the earlier state.
	 *
	 * @param {string} [sGroupId] The groupId which identifies the changes of a specific group
	 * @param {boolean} [bAvoidUpdate] If true then checkupdate() won't be called, because it will anyway get called in furthers steps
	 * @public
	 * @since 1.0.0
	 */
	FHIRModel.prototype.resetChanges = function(sGroupId, bAvoidUpdate) {
		var oBindingInfo;
		var fnResetResource = function(){
			var aResPath = oBindingInfo.getResourcePathArray();
			var sResGroupId = this._getProperty(this.mResourceGroupId, aResPath);
			var fnDoReset = function(){
				var oRequestInfo = this._getProperty(this.mChangedResources, aResPath);
				if (oRequestInfo.method === HTTPMethod.PUT){
					var oResourceServerState = this._getProperty(this.oDataServerState, aResPath);
					this._setProperty(this.oData, FHIRUtils.deepClone(aResPath), oResourceServerState);
				} else if (oRequestInfo.method === HTTPMethod.POST){
					this._setProperty(this.oData, FHIRUtils.deepClone(aResPath));
					this._setProperty(this.mResourceGroupId, FHIRUtils.deepClone(aResPath));
					this._removeFromOrderResources(oBindingInfo);
				} else if (oRequestInfo.method === HTTPMethod.DELETE){
					this._removeFromRemovedResources(oBindingInfo);
				}
				this._setProperty(this.mChangedResources, FHIRUtils.deepClone(aResPath));
			}.bind(this);
			if (sResGroupId === sGroupId){
				fnDoReset();
			} else if (!sGroupId){
				fnDoReset();
			}
		}.bind(this);
		for ( var vType in this.mChangedResources) {
			for (var vId in this.mChangedResources[vType]){
				if (vType === "$_history"){
					for (var vOriginId in this.mChangedResources[vType][vId]){
						for (var sVersion in this.mChangedResources[vType][vId][vOriginId]){
							oBindingInfo = this.getBindingInfo("/" + vType + "/" + vId + "/" + vOriginId + "/" + sVersion);
							fnResetResource();
						}
					}
				} else {
					oBindingInfo = this.getBindingInfo("/" + vType + "/" + vId);
					fnResetResource();
				}
			}
		}
		if (!bAvoidUpdate){
			this.checkUpdate(true);
		}
	};

	/**
	 * Removes a resource from the order resources map
	 *
	 * @param {sap.fhir.model.r4.lib.BindingInfo} oBindingInfo The binding info object
	 * @private
	 */
	FHIRModel.prototype._removeFromOrderResources = function(oBindingInfo){
		var sType = oBindingInfo.getResourceType();
		var sId = oBindingInfo.getResourceId();
		var iIndex = this.mOrderResources[sType].indexOf(sType + "/" + sId);
		this.mOrderResources[sType].splice(iIndex, 1);
		if (this.mOrderResources[sType].length === 0){
			delete this.mOrderResources[sType];
		}
	};

	/**
	 * Removes a resource from the removed resources map
	 *
	 * @param {sap.fhir.model.r4.lib.BindingInfo} oBindingInfo The binding info object
	 * @private
	 */
	FHIRModel.prototype._removeFromRemovedResources = function (oBindingInfo) {
		var sType = oBindingInfo.getResourceType();
		var sId = oBindingInfo.getResourceId();
		var iIndex = this.mRemovedResources[sType].indexOf(sType + "/" + sId);
		this.mRemovedResources[sType].splice(iIndex, 1);
		if (this.mRemovedResources[sType].length === 0) {
			delete this.mRemovedResources[sType];
		}
	};

	/**
	 * Cannot get a shared context for a path. Contexts are created by bindings instead and there
	 * may be multiple contexts for the same path.
	 *
	 * @throws {Error}
	 * @protected
	 * @see sap.ui.model.Model#getContext
	 * @since 1.0.0
	 * @override
	 */
	FHIRModel.prototype.getContext = function(){
		throw new Error("Unsupported operation: sap.fhir.model.r4.FHIRModel#getContext");
	};

	/**
	 * Determines the URL of the StructureDefinition of a given resource instance
	 * Default URL would be base profile URL + resource type
	 *
	 * @param {object} oResource The FHIR resource
	 * @returns {string} The structure definition for the given binding info
	 * @protected
	 * @since 1.1.6
	 */
	FHIRModel.prototype.getStructureDefinitionUrl = function (oResource){
		var sStrucDefUrl;
		if (oResource && oResource.meta && oResource.meta.profile && oResource.meta.profile.length > 0) {
			sStrucDefUrl = oResource.meta.profile[0];
		} else if (oResource && oResource.resourceType) {
			sStrucDefUrl = this.getBaseProfileUrl() + oResource.resourceType;
		}
		return sStrucDefUrl;
	};

	/**
	 * Determines whether server state variable needs an update
	 *
	 * @param {object} vServerValue Existing server state value
	 * @param {object} oResource The FHIR resource
	 * @param {sap.fhir.model.r4.HTTPMethod} sHTTPMethod HTTP Method for the resource
	 * @returns {boolean} if true then server state variable will not be updated
	 * @private
	 * @since 2.0.4
	 */
	FHIRModel.prototype._isServerStateUpToDate = function(vServerValue, oResource, sHTTPMethod){
		if (!vServerValue && sHTTPMethod === HTTPMethod.PUT) {
			return false;
		} else if (vServerValue && sHTTPMethod === HTTPMethod.PUT && deepEqual(vServerValue, oResource)) {
			// special handling when the server data and the client data before applying the change is the same (after multiple reset changes)
			// forcefully update the existing server state
			return false;
		}
		return true;
	};

	/**
	 * Determines the value of securesearch mode
	 *
	 * @returns {boolean} The value of secure search mode
	 * @protected
	 * @since 2.2.0
	 */
	FHIRModel.prototype.isSecureSearchModeEnabled = function () {
		return this.bSecureSearch;
	};

	/**
	 * @typedef {object} sap.fhir.model.r4.NextLink
	 * @prop {string} url The url to which the request should fired
	 * @prop {sap.fhir.model.r4.FHIRListBinding.Parameter | sap.fhir.model.r4.FHIRTreeBinding.Parameter} mParameters The parameters that will be passed as query strings
	 * @public
	 * @since 2.3.2
	 */

	/**
	 * Determines the next link url should be used
	 *
	 * This method might be overridden by the application to provide a customized next link processing because FHIR did not offer a standardized link structure.
	 * @param {string} sNextLinkUrl The next link url
	 * @param {string} sPath The FHIR resource path
	 * @param {sap.fhir.model.r4.FHIRListBinding.Parameter | sap.fhir.model.r4.FHIRTreeBinding.Parameter} mParameters Existing parameters
	 * @returns {sap.fhir.model.r4.NextLink} Next link object containing the url and parameters
	 * @public
	 * @since 2.3.2
	 */
	FHIRModel.prototype.getNextLink = function (sNextLinkUrl, sPath, mParameters) {
		var sQueryParams = sNextLinkUrl.substring(sNextLinkUrl.indexOf("?") + 1, sNextLinkUrl.length);
		var aParameter = sQueryParams ? sQueryParams.split("&") : [];
		var aKeyValue;
		for (var i = 0; i < aParameter.length; i++) {
			aKeyValue = aParameter[i].split("=");
			mParameters.urlParameters[aKeyValue[0]] = aKeyValue[1];
		}
		return { url: sPath, parameters: mParameters };
	};

	return FHIRModel;
});
