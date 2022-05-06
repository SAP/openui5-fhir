/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.FHIRRequestor
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/fhir/model/r4/SubmitMode",
	"sap/fhir/model/r4/lib/FHIRBundle",
	"sap/fhir/model/r4/lib/FHIRBundleEntry",
	"sap/fhir/model/r4/lib/FHIRBundleRequest",
	"sap/fhir/model/r4/lib/FHIRBundleType",
	"sap/fhir/model/r4/lib/RequestHandle",
	"sap/fhir/model/r4/lib/HTTPMethod",
	"sap/fhir/model/r4/lib/FHIRUrl",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/fhir/model/r4/lib/FHIROperationOutcome"
], function(jQuery, FHIRUtils, SubmitMode, FHIRBundle,
	FHIRBundleEntry, FHIRBundleRequest, FHIRBundleType, RequestHandle, HTTPMethod, FHIRUrl, each, merge, FHIROperationOutcome) {
	"use strict";

	/**
	 * Constructor for a new FHIRRequestor
	 *
	 * @param {string} sServiceUrl The root URL of the FHIR server to request data from, e.g. http://example.com/fhir
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The FHIRModel
	 * @param {boolean} [bCSRF=false] If the FHIR service supports the csrf token
	 * @param {string} sPrefer In which kind the FHIR service shall return the responses described here https://www.hl7.org/fhir/http.html#2.21.0.5.2
	 * @param {object} oDefaultQueryParams The default query parameters to be passed on resource type specific requests and not resource instance specific requests (e.g /Patient?_total:accurate&_format:json). It should be of type key:value pairs. e.g. {'_total':'accurate'} -> http://hl7.org/fhir/http.html#parameters
	 * @alias sap.fhir.model.r4.lib.FHIRRequestor
	 * @author SAP SE
	 * @constructs {FHIRRequestor} Provides the implementation of the FHIR Requestor to send and retrieve content from a FHIR server
	 * @protected
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRRequestor = function(sServiceUrl, oModel, bCSRF, sPrefer, oDefaultQueryParams) {
		this._mBundleQueue = {};
		this.oModel = oModel;
		this._sServiceUrl = sServiceUrl;
		this._aPendingRequestHandles = [];
		this.bCSRF = !!bCSRF;
		this.sPrefer = sPrefer ?  "return=minimal" : sPrefer;
		this.oDefaultQueryParams = oDefaultQueryParams;
		this._oRegex = {
			rAmpersand : /&/g,
			rEquals : /\=/g,
			rHash : /#/g,
			rPlus : /\+/g
		};
	};

	/**
	 * @typedef {object} sap.fhir.model.r4.RequestEventParameters
	 * @prop {sap.fhir.model.r4.lib.RequestHandle} requestHandle
	 * @public
	 * @since 1.0.0
	 */

	/**
	 * Submits a FHIR bundle request call with all entries associated with the given <code>sGroupId</code>
	 *
	 * @param {string} sGroupId The group id
	 * @param {function} fnSuccessPromise The callback function which gets invoked once the submit is successful
	 * @param {function} fnErrorPromise The callback function which gets invoked when the submit fails
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} oRequesthandle
	 * @protected
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype.submitBundle = function (sGroupId, fnSuccessPromise, fnErrorPromise) {
		var oFHIRBundle = this._mBundleQueue[sGroupId];
		return this._sendBundle(oFHIRBundle, fnSuccessPromise, fnErrorPromise);
	};

	/**
	 * Requests a resource, if the request is marked as a bundle the bundle is returned, if not the request will be submitted immediately and the request handle is returned
	 *
	 * @param {string} sMethod The HTTP Method
	 * @param {string} sPath The path of the resource which will be requested, relative to the root URL of the FHIR server
	 * @param {boolean} [bForceDirectCall] The switch if the request should be directly called anyway
	 * @param {object} [mParameters] The URL parameters which are send by the request e.g. _count, _summary
	 * @param {string} [sGroupId] The group id which shall be updated via submit changes
	 * @param {object} [mHeaders] The HTTP headers which were send by the request e.g. if-match, etc.
	 * @param {object} [oPayload] The data which will be send in the request header
	 * @param {function} [fnSuccess] The callback which will be executed when the request was successful
	 * @param {function} [fnError] The callback which will be executed when the request failed
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @param {boolean} [bManualSubmit] The switch if a bundle will be manually submitted
	 * @returns {sap.fhir.model.r4.lib.FHIRBundle | sap.fhir.model.r4.lib.RequestHandle} A request handle or a bundle.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._request = function(sMethod, sPath, bForceDirectCall, mParameters, sGroupId, mHeaders, oPayload, fnSuccess, fnError, oBinding, bManualSubmit) {
		if (!FHIRUtils.isRequestable(sPath) && !bForceDirectCall){
			return undefined;
		}
		var oRequestHandle;
		// it's a bundle (Batch or Transaction)
		if (!bForceDirectCall && this._getGroupSubmitMode(sGroupId) !== SubmitMode.Direct) {
			var oFHIRBundle = this._getBundleByGroup(sGroupId);
			var oUri = this._getGroupUri(sGroupId);
			var oFHIRBundleEntry = this._createBundleEntry(sMethod, sPath, mParameters, oPayload, fnSuccess, fnError, oBinding, oUri);
			oFHIRBundle.addBundleEntry(oFHIRBundleEntry);
			if (bManualSubmit){
				this._mBundleQueue[sGroupId] = oFHIRBundle;
				return oFHIRBundle;
			} else {
				oRequestHandle = this._mBundleQueue[sGroupId];
				if (oRequestHandle && oRequestHandle instanceof RequestHandle){
					oRequestHandle.getRequest().abort();
				}
				oRequestHandle = this._sendBundle(oFHIRBundle);
				this._mBundleQueue[sGroupId] = oRequestHandle;
				return oRequestHandle;
			}
		}

		// it's a direct call
		oRequestHandle = this._sendRequest(sMethod, sPath, mParameters, mHeaders, sMethod === HTTPMethod.PUT || sMethod == HTTPMethod.POST ? oPayload : undefined, fnSuccess, fnError, oBinding);
		return oRequestHandle;
	};

	/**
	 * Creates a new bundle entry
	 *
	 * @param {string} sMethod The HTTP Method
	 * @param {string} sResourcePath The path of the resource which will be requested, relative to the root URL of the FHIR server
	 * @param {object} [mParameters] The URL parameters which are send by the request e.g. _count, _summary
	 * @param {object} [oResource] The FHIR valid bundle entry resource
	 * @param {function} [fnSuccess] The callback which will be executed when the request was successful
	 * @param {function} [fnError] The callback which will be executed when the request failed
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @param {sap.fhir.model.r4.type.Uri} oUri The fullUrl instance format to be used in bundle entries
	 * @returns {sap.fhir.model.r4.lib.FHIRBundleEntry} A FHIRBundleEntry instance.
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._createBundleEntry = function(sMethod, sResourcePath, mParameters, oResource, fnSuccess, fnError, oBinding, oUri) {
		// remove possible slash at the beginning
		if (sResourcePath && sResourcePath.charAt(0) === "/") {
			sResourcePath = sResourcePath.slice(1);
		}
		var oBindingInfo = sMethod === HTTPMethod.POST ? this.oModel.getBindingInfo("/" + sResourcePath, undefined, false, oResource) : this.oModel.getBindingInfo("/" + sResourcePath);
		var sRequestUrl = sResourcePath + (HTTPMethod.GET === sMethod ? this._buildQueryParameters(mParameters, oBindingInfo, sMethod) : "");
		var sFullUrl;
		var sETag;
		if (HTTPMethod.GET !== sMethod) {
			sFullUrl = FHIRUtils.generateFullUrl(oUri, oBindingInfo.getResourceServerPath(), oBindingInfo.getResourceId(), this._sServiceUrl);
			sETag = oBindingInfo.getETag();
		}
		var oFHIRBundleRequest = new FHIRBundleRequest(oBinding, sMethod, sRequestUrl, fnSuccess, fnError, sETag);
		var oFHIRBundleEntry;
		if (sMethod == HTTPMethod.POST || sMethod == HTTPMethod.PUT) {
			oFHIRBundleEntry = new FHIRBundleEntry(sFullUrl, oResource, oFHIRBundleRequest);
		} else {
			oFHIRBundleEntry = new FHIRBundleEntry(sFullUrl, undefined, oFHIRBundleRequest);
		}
		return oFHIRBundleEntry;
	};

	/**
	 * Sends the given <code>oFHIRBundle</code>
	 *
	 * @param {sap.fhir.model.r4.lib.FHIRBundle} oFHIRBundle The bundle to send
	 * @param {function} fnSubmitSuccessBundle The callback function which gets invoked once the submit is successful
	 * @param {function} fnSubmitErrorBundle The callback function which gets invoked when the submit fails
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} A request handle.
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._sendBundle = function(oFHIRBundle, fnSubmitSuccessBundle, fnSubmitErrorBundle) {
		var fnSuccess = function (oGivenFHIRBundle, oRequestHandle) {
			var aSuccessResource = [];
			var aOperationOutcome = [];
			this._deleteBundleFromQueue(oFHIRBundle.getGroupId());
			for (var i = 0; i < oGivenFHIRBundle.getNumberOfBundleEntries(); i++) {
				var oFHIRBundleEntry = oGivenFHIRBundle.getBundlyEntry(i);
				var oResponse = oRequestHandle.getRequest().responseJSON.entry[i];
				if (oResponse && oResponse.response.status.startsWith("2")) {
					if (oResponse.resource) {
						aSuccessResource.push(oResponse.resource);
					} else if (oFHIRBundleEntry.getResource()) {
						aSuccessResource.push(oFHIRBundleEntry.getResource());
					}
					oFHIRBundleEntry.getRequest().executeSuccessCallback(oRequestHandle, oResponse, oFHIRBundleEntry);
				} else {
					if (oResponse && oResponse.response.outcome) {
						aOperationOutcome.push(new FHIROperationOutcome(oResponse.response.outcome));
					}
					oFHIRBundleEntry.getRequest().executeErrorCallback(oRequestHandle, oResponse, oFHIRBundleEntry);
				}
			}
			if (fnSubmitErrorBundle && aOperationOutcome.length > 0) {
				fnSubmitErrorBundle(oRequestHandle, aSuccessResource, aOperationOutcome);
			} else if (fnSubmitSuccessBundle) {
				fnSubmitSuccessBundle(aSuccessResource);
			}
		}.bind(this, oFHIRBundle);

		var fnError = function (oGivenFHIRBundle, oRequestHandle) {
			this._deleteBundleFromQueue(oFHIRBundle.getGroupId());
			for (var i = 0; i < oGivenFHIRBundle.getNumberOfBundleEntries(); i++) {
				var oFHIRBundleEntry = oGivenFHIRBundle.getBundlyEntry(i);
				oFHIRBundleEntry.getRequest().executeErrorCallback(oRequestHandle);
			}
			if (fnSubmitErrorBundle) {
				fnSubmitErrorBundle(oRequestHandle);
			}
		}.bind(this, oFHIRBundle);

		var oRequestHandle = this._sendRequest(HTTPMethod.POST, "", {}, {}, oFHIRBundle.getBundleData(), fnSuccess, fnError);
		oRequestHandle.setBundle(oFHIRBundle);
		return oRequestHandle;
	};

	/**
	 * Sends the request
	 *
	 * @param {string} sMethod HTTP method, e.g. HTTPMethod.GET
	 * @param {string} sPath A resource path relative to the service URL for which this requestor has been created
	 * @param {object} [mParameters] The URL parameters which are send by the request e.g. _count, _summary
	 * @param {object} [mHeaders] The HTTP headers which were send by the request e.g. if-match, etc.
	 * @param {object} [oPayload] The data to be sent to the server
	 * @param {function} [fnSuccess] The callback which will be executed when the request was successful
	 * @param {function} [fnError] The callback which will be executed when the request failed
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} A request handle.
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._sendRequest = function(sMethod, sPath, mParameters, mHeaders, oPayload, fnSuccess, fnError, oBinding) {
		var oRequestHandle = new RequestHandle(oBinding);
		var oFHIRUrl = new FHIRUrl(sPath, this._sServiceUrl);
		var sRequestUrl;
		var sContentType = "application/json";
		var oBindingInfo = this.oModel.getBindingInfo(oFHIRUrl.getRelativeUrlWithoutQueryParameters());
		if (this._isRequestTransformable(sMethod, oFHIRUrl)) {
			sMethod = HTTPMethod.POST;
			oPayload = this._getFormData(mParameters, oBindingInfo, oFHIRUrl.getQueryParameters());
			sRequestUrl = this._sServiceUrl + "/" + oFHIRUrl.getResourceType() + "/_search";
			// for secure search the content type should be url form encoded
			sContentType = "application/x-www-form-urlencoded";
		} else {
			var sQueryParameter = oFHIRUrl.getQueryParameters() ? "" : this._buildQueryParameters(mParameters, oBindingInfo, sMethod);
			sRequestUrl = sPath.startsWith("http") ? sPath : this._sServiceUrl + oFHIRUrl.getRelativeUrlWithQueryParameters() + sQueryParameter;
		}
		mHeaders = mHeaders ? mHeaders : {};
		mHeaders["Accept-Language"] = sap.ui.getCore().getConfiguration().getLanguageTag();
		mHeaders["cache-control"] = "no-cache";

		mHeaders.Prefer = this.sPrefer;

		var fnTriggerRequest = function () {
			return this._ajax(oRequestHandle, {
				url: sRequestUrl,
				data: sContentType == "application/json" ? JSON.stringify(oPayload) : oPayload,
				beforeSend: function (jqXHR, settings) {
					oRequestHandle.setUrl(settings.url);
					oRequestHandle.setData(settings.data);
					oRequestHandle.setRequest(jqXHR);
					oRequestHandle.setHeaders(settings.headers);
					var aPendingRequestHandles = [];
					if (settings.url !== this._sServiceUrl) {
						aPendingRequestHandles = FHIRUtils.filterArray(this._aPendingRequestHandles, undefined, undefined, function (oRequestHandle) { return oRequestHandle.getUrl() === settings.url; });
					}
					if (aPendingRequestHandles.length > 0) {
						this._add(aPendingRequestHandles[0], fnSuccess, fnError);
						jqXHR.abort();
					} else {
						this.oModel.fireRequestSent(this._createEventParameters(oRequestHandle));
					}
				}.bind(this),
				headers: mHeaders,
				type: sMethod,
				contentType: sContentType,
				traditional: true
			}, fnSuccess, fnError);
		}.bind(this);

		if (this._isCsrfTokenRequest()) {
			mHeaders["x-csrf-token"] = "fetch";
			var tmpFnSuccess = FHIRUtils.deepClone(fnSuccess);
			var tmpFnError = FHIRUtils.deepClone(fnError);
			fnSuccess = this._callBackForXcsrfToken.bind(this, tmpFnSuccess);
			fnError = function (oRequestHandle, oData) {
				tmpFnError(oRequestHandle, oData);
			};
			return fnTriggerRequest();
		} else if (this.bCSRF && this.sToken) {
			mHeaders["x-csrf-token"] = this.sToken;
			return fnTriggerRequest();
		} else {
			return fnTriggerRequest();
		}
	};

	/**
	 * Sets the x-csrf token and executes the callback
	 *
	 * @param {function} [fnOriginSuccess] The original success callback which will be executed when the request was successful
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object to identify the executed request
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._callBackForXcsrfToken = function(fnOriginSuccess, oRequestHandle){
		this.sToken = this.getResponseHeaders(oRequestHandle.getRequest())["x-csrf-token"];
		fnOriginSuccess(oRequestHandle);
	};

	/**
	 * Executes the ajax call with the given <code>mParameters</code>
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object to identify the executed request
	 * @param {object} [mParameters] The parameters {@link sap.ui.thirdparty.jquery#ajax}
	 * @param {function} [fnSuccess] The callback which will be executed when the request was successful
	 * @param {function} [fnError] The callback which will be executed when the request failed
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} The request handle object to identify the executed request
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._ajax = function(oRequestHandle, mParameters, fnSuccess, fnError) {
		var jqXHR = jQuery.ajax(mParameters);
		if (!oRequestHandle.isAborted()) {
			jqXHR.complete(function (oGivenRequestHandle) {
				this.oModel.fireRequestCompleted(this._createEventParameters(oGivenRequestHandle));
			}.bind(this, oRequestHandle));
			this._add(oRequestHandle, fnSuccess, fnError);
			this._aPendingRequestHandles.push(oRequestHandle);
		}
		return oRequestHandle;
	};

	/**
	 * Adds the success and error callback function to the request
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object to identify the executed request
	 * @param {function} fnSuccess The callback which will be executed when the request was successful
	 * @param {function} fnError The callback which will be executed when the request failed
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._add = function(oRequestHandle, fnSuccess, fnError) {
		var jqXHR = oRequestHandle.getRequest();
		jqXHR.done(function(oGivenRequestHandle){
			this._deleteRequestHandle(oGivenRequestHandle);
			fnSuccess(oGivenRequestHandle);
		}.bind(this, oRequestHandle));
		jqXHR.fail(function(oGivenRequestHandle) {
			this._deleteRequestHandle(oGivenRequestHandle);
			fnError(oGivenRequestHandle);
			if (!oGivenRequestHandle.isAborted()) {
				this.oModel.fireRequestFailed(this._createEventParameters(oGivenRequestHandle));
			}
		}.bind(this, oRequestHandle));
	};

	/**
	 * Defines the event parameters object
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object to identify the executed request
	 * @returns {sap.fhir.model.r4.RequestEventParameters} The event parameters object
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._createEventParameters = function(oRequestHandle){
		return {requestHandle: oRequestHandle};
	};

	/**
	 * Returns the submit mode for the given group Id.
	 *
	 * @param {string} sGroupId The group id
	 * @returns {sap.fhir.model.r4.SubmitMode} The submit mode.
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._getGroupSubmitMode = function(sGroupId) {
		return this.oModel.getGroupProperty(sGroupId, "submit");
	};

	/**
	 * Returns the fullUrl type  for the given group Id.
	 *
	 * @param {string} sGroupId The group id
	 * @returns {sap.fhir.model.r4.type.URI} FHIR URI type for batch/transaction entries.
	 * @private
	 * @since 1.1.0
	 */
	FHIRRequestor.prototype._getGroupUri = function(sGroupId) {
		return this.oModel.getGroupProperty(sGroupId, "uri");
	};

	/**
	 * Determines the existing bundle in the bundle queue identified by given <code>sGroupId</code> or creates a new bundle in the bundle queue
	 *
	 * @param {string} sGroupId The group id
	 * @returns {sap.fhir.model.r4.lib.FHIRBundle} Returns an existing bundle or a newly created bundle for the given group id.
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._getBundleByGroup = function(sGroupId) {
		var oFHIRBundle = this._mBundleQueue[sGroupId];
		if (!oFHIRBundle) {
			oFHIRBundle = new FHIRBundle(this._getBundleTypeBySubmitMode(this._getGroupSubmitMode(sGroupId)), sGroupId);
		} else if (oFHIRBundle instanceof RequestHandle){
			oFHIRBundle = oFHIRBundle.getBundle();
		}
		return oFHIRBundle;
	};

	/**
	 * Determines the bundle type by the given <code>sSubmitMode</code>
	 *
	 * @param {sap.fhir.model.r4.SubmitMode} sSubmitMode The given submit mode
	 * @returns {sap.fhir.model.r4.lib.FHIRBundleType} The type for the given submit mode.
	 * @throws {Error} if an unsupported submit mode is used
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._getBundleTypeBySubmitMode = function(sSubmitMode) {
		switch (sSubmitMode) {
			case SubmitMode.Batch:
				return FHIRBundleType.Batch;
			case SubmitMode.Transaction:
				return FHIRBundleType.Transaction;
			default:
				throw new Error("Unsupported SubmitMode: " + sSubmitMode);
		}
	};

	/**
	 * Deletes the bundle specified by the given <code>sGroupId</code> from the bundle queue
	 *
	 * @param {string} sGroupId The group id
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._deleteBundleFromQueue = function(sGroupId) {
		delete this._mBundleQueue[sGroupId];
	};

	/**
	 * Transforms the given <code>mParameters</code> to a valid URL parameter string representation
	 *
	 * @param {object} [mParameters] A map of key-value pairs representing the query string, the value in this pair has to be a string or an array of strings; if it is an array, the resulting query
	 *            string repeats the key for each array value, Examples: buildQuery({name:contains : "Peter", "_count" : 1}) results in the query string "?name:contains=Peter&_count=1,"
	 *            buildQuery({name:contains : ["Peter", "Maier"]}) results in the query string "?name:contains=Peter&name:contains=Maier"
	 * @param {sap.fhir.model.r4.lib.BindingInfo} oBindingInfo The binding info containing path and context
	 * @param {sap.fhir.model.r4.HTTPMethod} [sMethod=HTTPMethod.GET] HTTP method, e.g. HTTPMethod.GET
	 * @returns {string} The query string, it is empty if there are no parameters
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._buildQueryParameters = function(mParameters, oBindingInfo, sMethod) {
		var aQuery;
		sMethod = sMethod ? sMethod : HTTPMethod.GET;
		mParameters = mParameters ? mParameters : {};

		if (!oBindingInfo){
			// what should happen with next link
			return "";
		}

		if (!oBindingInfo.getResourceId() && sMethod === HTTPMethod.GET) {
			mParameters = merge(mParameters, this.oDefaultQueryParams);
		}

		if (!this._isFormatSupported(mParameters._format)) {
			mParameters._format = "json";
		}

		aQuery = [];

		each(mParameters, function(sKey, vValue) {
			if (vValue && Array.isArray(vValue)) {
				vValue.forEach(function(sItem) {
					aQuery.push(this._encodePair(sKey, sItem));
				}.bind(this));
			} else if (vValue) {
				aQuery.push(this._encodePair(sKey, vValue));
			}
		}.bind(this));

		return "?" + aQuery.join("&");
	};

	/**
	 * Encodes a key-value pair
	 *
	 * @param {string} sKey The key
	 * @param {string} sValue The sValue
	 * @returns {string} The encoded key-value pair in the form "key=value"
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._encodePair = function(sKey, sValue) {
		return this._encode(sKey, true) + "=" + this._encode(sValue, false);
	};

	/**
	 * Encodes a query part, either a key or a value
	 *
	 * @param {string} sPart The query part
	 * @param {boolean} bEncodeEquals If true, "=" is encoded, too
	 * @returns {string} The encoded query part
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._encode = function(sPart, bEncodeEquals) {
		var sEncoded = encodeURI(sPart).replace(this._oRegex.rAmpersand, "%26").replace(this._oRegex.rHash, "%23").replace(this._oRegex.rPlus, "%2B");
		if (bEncodeEquals) {
			sEncoded = sEncoded.replace(this._oRegex.rEquals, "%3D");
		}
		return sEncoded;
	};

	/**
	 * Deletes the given <code>oRequestHandle</code> from the <code>_aPendingRequestHandles</code>
	 *
	 * @param {sap.fhir.model.r4.lib.RequestHandle} oRequestHandle The request handle object to identify the executed request
	 * @private
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype._deleteRequestHandle = function(oRequestHandle) {
		var iIndex = FHIRUtils.getIndexOfValueInArray(oRequestHandle, this._aPendingRequestHandles);
		this._aPendingRequestHandles.splice(iIndex, 1);
	};

	/**
	 * Destroys the FHIRRequestor object and all children
	 *
	 * @protected
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype.destroy = function() {
		this._mBundleQueue = {};
		for (var i = 0; i < this._aPendingRequestHandles.length; i += 0){
			this._aPendingRequestHandles[i].abort();
		}
	};

	/**
	 * Determines all response headers of the given <code>jqXHR</code> request
	 *
	 * @param {object} jqXHR The request object
	 * @returns {object} Response headers for the given code.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRRequestor.prototype.getResponseHeaders = function(jqXHR) {
		var mResponseHeaders = {};
		var sResponseHeaders = jqXHR.getAllResponseHeaders().trim();
		var aResponseHeaders = sResponseHeaders.split("\n");
		for (var i = 0; i < aResponseHeaders.length; i++) {
			var sHeader = aResponseHeaders[i];
			var aKeyValue = sHeader.split(":");
			mResponseHeaders[aKeyValue[0]] = jqXHR.getResponseHeader(aKeyValue[0]);
		}
		return mResponseHeaders;
	};

	/**
	 * Checks if the _format is part of supported types (according to fhir all these kinds shall be intrepreted as json)
	 *
	 * @param {string} sFormat The format in a particular request
	 * @returns {boolean} Whether its supported or not
	 * @private
	 * @since 1.1.2
	 */
	FHIRRequestor.prototype._isFormatSupported = function(sFormat) {
		var aSupportedFormats = [
			"json",
			"application/json",
			"application/fhir+json"
		];
		return aSupportedFormats.indexOf(sFormat) >= 0;
	};

	/**
	 * Transforms the given <code>mParameters</code> to form object
	 *
	 * @param {object} [mParameters] A map of key-value pairs representing the query string, the value in this pair has to be a string or an array of strings; if it is an array, the resulting query
	 *           string repeats the key for each array value
	 * @param {sap.fhir.model.r4.lib.BindingInfo} oBindingInfo The binding info containing path and context
	 * @param {object} [mQueryParameters] The query parameters from the url
	 * @returns {object} The form data for the secure call
	 * @private
	 * @since 2.2.0
	 */
	FHIRRequestor.prototype._getFormData = function (mParameters, oBindingInfo, mQueryParameters) {
		mParameters = mParameters ? mParameters : {};
		if (mQueryParameters) {
			mParameters = merge(mParameters, mQueryParameters);
		}
		if (!this._isFormatSupported(mParameters._format)) {
			mParameters._format = "json";
		}
		if (!oBindingInfo) {
			return mParameters;
		}

		if (!oBindingInfo.getResourceId()) {
			mParameters = merge(mParameters, this.oDefaultQueryParams);
		}
		return mParameters;
	};

	/**
	 * Checks if given request is to fetch csrf token
	 *
	 * @returns {boolean} True if the request is to fetch csrf token
	 * @private
	 * @since 2.2.0
	 */
	FHIRRequestor.prototype._isCsrfTokenRequest = function () {
		return this.bCSRF ? !this.sToken : false;
	};

	/**
	 * Checks if given request needs to be transformed to POST
	 *
	 * @param {string} sMethod The HTTP method which was used by the request e.g. GET, HTTPMethod.POST, etc.
	 * @param {sap.fhir.model.r4.lib.FHIRUrl} oFHIRUrl The request url object
	 * @returns {boolean} True if the criteria matches
	 * @private
	 * @since 2.2.0
	 */
	FHIRRequestor.prototype._isRequestTransformable = function (sMethod, oFHIRUrl) {
		// if the method is GET, secure search is enabled
		// convert the path to _search and all the url paramters will be converted to POST form data
		// except ValueSet/$expand or specific operations  like Patient/53/_history
		return sMethod == HTTPMethod.GET && this.oModel.isSecureSearchModeEnabled() && oFHIRUrl.isSearchAtBaseLevel() && !this._isCsrfTokenRequest();
	};

	return FHIRRequestor;
});