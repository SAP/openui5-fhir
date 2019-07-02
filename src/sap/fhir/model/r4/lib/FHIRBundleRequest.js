/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.FHIRBundleRequest
sap.ui.define([], function() {

	"use strict";

	/**
	 * Constructor for a new FHIRBundleRequest
	 *
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} oBinding The binding which triggered the request
	 * @param {sap.fhir.model.r4.HTTPMethod} sMethod The HTTP method of the bundle request entry e.g. HTTPMethod.GET, HTTPMethod.POST, etc.
	 * @param {string} sUrl The url of the request
	 * @param {function} fnSuccess The function which is executed when the bundle entry request succeeded
	 * @param {function} fnError The function which is executed when the bundle entry request failed
	 * @param {string} sIfMatch The version on which the resource of the bundle is based, succeeds if the ETag of the resource on the server is equal to the given, e.g. 'W/\"2\"'
	 * @param {string} sIfNoneMatch The version on which the resource of the bundle is based, succeeds if the ETag of the resource on the server is different to the given, e.g. 'W/\"2\"'
	 * @param {string} sIfNoneExist The path to identify a specific resource, only performs the create of the resource in the bundle entry if the specified resource does not exists, e.g.
	 *            'identifier=234234'
	 * @param {string} sIfModifiedSince The last updated time (Last-Modified) on which the resource of the bundle is based, succeeds if the Last-Modified date of the resource on the server is more
	 *            recent than the one given, e.g. '2015-08-31T08:14:33+10:00'
	 * @alias sap.fhir.model.r4.lib.FHIRBundleRequest
	 * @constructs {FHIRBundleRequest} Provides the implementation of a FHIR bundle request
	 * @author SAP SE
	 * @protected
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRBundleRequest = function(oBinding, sMethod, sUrl, fnSuccess, fnError, sIfMatch, sIfNoneMatch, sIfNoneExist, sIfModifiedSince) {
		this._sMethod = sMethod;
		this._sUrl = sUrl;
		this._sIfMatch = sIfMatch;
		this._sIfNoneMatch = sIfNoneMatch;
		this._sIfNoneExist = sIfNoneExist;
		this._sIfModifiedSince = sIfModifiedSince;
		this._fnSuccess = fnSuccess;
		this._fnError = fnError;
		this._oBinding = oBinding;
	};

	/**
	 * Creates a FHIR valid bundle entry request representation
	 *
	 * @returns {object} FHIR bundle entry request
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleRequest.prototype.getBundleRequestData = function() {
		var oBundleRequestData = {};
		oBundleRequestData.method = this._sMethod;
		oBundleRequestData.url = this._sUrl;
		oBundleRequestData.ifMatch = this._sIfMatch ? this._sIfMatch : undefined;
		oBundleRequestData.ifNoneMatch = this._sIfNoneMatch ? this._sIfNoneMatch : undefined;
		oBundleRequestData.ifNoneExist = this._sIfNoneExist ? this._sIfNoneExist : undefined;
		oBundleRequestData.ifModifiedSince = this._sIfModifiedSince ? this._sIfModifiedSince : undefined;
		return oBundleRequestData;
	};

	/**
	 * Determines the binding, which is associated with this FHIR bundle entry request
	 *
	 * @returns {sap.fhir.model.r4ContextBinding | sap.fhir.model.r4ListBinding | sap.fhir.model.r4TreeBinding} Binding associated with this FHIR bundle.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleRequest.prototype.getBinding = function() {
		return this._oBinding;
	};

	/**
	 * Determines the url, which is associated with this FHIR bundle entry request
	 *
	 * @returns {string} The requested URL
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleRequest.prototype.getUrl = function() {
		return this._sUrl;
	};

	/**
	 * Executes the defined success callback for this FHIR bundle entry request
	 *
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleRequest.prototype.executeSuccessCallback = function() {
		this._fnSuccess.apply(undefined, arguments);
	};

	/**
	 * Executes the defined error callback for this FHIR bundle entry request
	 *
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleRequest.prototype.executeErrorCallback = function() {
		this._fnError.apply(undefined, arguments);
	};

	return FHIRBundleRequest;
});