/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.RequestHandle
sap.ui.define([ "sap/fhir/model/r4/FHIRUtils" ], function(FHIRUtils) {

	"use strict";

	/**
	 * Constructor for a new RequestHandle
	 *
	 * @class
	 * @classdesc The implementation of the RequestHandle
	 * @alias sap.fhir.model.r4.lib.RequestHandle
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} [oBinding] The binding which triggered the request
	 * @author SAP SE
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var RequestHandle = function(oBinding) {
		this._sId = FHIRUtils.uuidv4();
		this.setBinding(oBinding);
	};

	/**
	 * Sets the binding of the request handle
	 *
	 * @param {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} oBinding The binding which is associated with this request
	 *            handle
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.setBinding = function(oBinding) {
		this._oBinding = oBinding;
	};

	/**
	 * Sets the FHIR bundle of the request handle
	 *
	 * @param {sap.fhir.model.r4.lib.FHIRBundle} oBundle The bundle which triggered the request
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.setBundle = function(oBundle) {
		this._oBundle = oBundle;
	};

	/**
	 * Sets the url of the request handle
	 *
	 * @param {string} sUrl The url of the request
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.setUrl = function(sUrl) {
		this._sUrl = sUrl;
	};

	/**
	 * Sets the request of the request handle
	 *
	 * @param {object} jqXHR The request object
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.setRequest = function(jqXHR) {
		this._jqRequest = jqXHR;
	};

	/**
	 * Sets the data which was send by the request
	 *
	 * @param {string} sData The sent data
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.setData = function(sData) {
		this._sData = sData;
	};

	/**
	 * Sets the headers which were send by the request
	 *
	 * @param {object} mHeaders The HTTP headers
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.setHeaders = function(mHeaders) {
		this._mHeaders = mHeaders;
	};

	/**
	 * Determines the binding which is associated with this request handle
	 *
	 * @returns {sap.fhir.model.r4.FHIRContextBinding | sap.fhir.model.r4.FHIRListBinding | sap.fhir.model.r4.FHIRTreeBinding} Binding associated with this request handle
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getBinding = function() {
		return this._oBinding;
	};

	/**
	 * Determines the bundle which triggered the request
	 *
	 * @returns {sap.fhir.model.r4.lib.FHIRBundle} Bundle which triggered the request
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getBundle = function() {
		return this._oBundle;
	};

	/**
	 * Determines the url of the request which is associated with this request handle
	 *
	 * @returns {string} Url of the request which is associated with this request handle
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getUrl = function() {
		return this._sUrl;
	};

	/**
	 * Determines the request object(jqXHR) of the request handle
	 *
	 * @returns {object} Request object(jqXHR) of the request handle
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getRequest = function() {
		return this._jqRequest;
	};

	/**
	 * Determines the data which was send by the request
	 *
	 * @returns {string} Data which was send by the request
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getData = function() {
		return this._sData;
	};

	/**
	 * Determines the headers which were send by the request
	 *
	 * @returns {object} The HTTP headers
	 * @protected
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getHeaders = function() {
		return this._mHeaders;
	};

	/**
	 * Determines the id of the request handle
	 *
	 * @returns {string} Id of the request handle
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.getId = function() {
		return this._sId;
	};

	/**
	 * Aborts the request
	 *
	 * @public
	 * @since 1.0.0
	 */
	RequestHandle.prototype.abort = function() {
		this.getRequest().abort();
	};


	/**
	 * Checks if the request is aborted or canceled
	 *
	 * @returns {boolean} true if the request is aborted or canceled
	 * @protected
	 * @since 2.0.1
	 */
	RequestHandle.prototype.isAborted = function () {
		return this.getRequest().statusText === "abort" || this.getRequest().statusText === "canceled";
	};

	return RequestHandle;
});