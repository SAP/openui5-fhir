/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.FHIRUrl
sap.ui.define([], function() {

	"use strict";

	/**
	 * Constructor for a new FHIRUrl
     *
	 * @param {string} sUrl The url e.g. http://example.com/fhir/Patient/1234?gender=unknown
	 * @param {string} sServiceUrl The root URL of the FHIR server to request data from, e.g. http://example.com/fhir
	 * @alias sap.fhir.model.r4.lib.FHIRUrl
	 * @author SAP SE
	 * @private
	 * @constructs {FHIRUrl}
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRUrl = function (sUrl, sServiceUrl) {
		this._sServiceUrl = sServiceUrl;
		if (sServiceUrl.indexOf("http") == 0 || sServiceUrl.indexOf("https") == 0) {
			sServiceUrl = sServiceUrl.replace(/^https?\:\/\//i, "");
		}
		var iStartOfServiceBaseUrl = sUrl.indexOf(sServiceUrl);
		sUrl = (iStartOfServiceBaseUrl > -1 ? sUrl.substring(iStartOfServiceBaseUrl + sServiceUrl.length) : sUrl);
		sUrl = sUrl && sUrl.charAt(0) !== "/" && sUrl.charAt(0) !== "?" ? "/" + sUrl : sUrl;
		if (sUrl.indexOf("?") > -1) {
			this._sRelativeUrlWithQueryParameters = sUrl;
			this._sRelativeUrlWithoutQueryParameters = sUrl.substring(0, sUrl.indexOf("?"));
		} else {
			this._sRelativeUrlWithQueryParameters = sUrl;
			this._sRelativeUrlWithoutQueryParameters = sUrl;
		}
		var aRelativeUrlWithoutQueryParameter = this._sRelativeUrlWithoutQueryParameters ? this._sRelativeUrlWithoutQueryParameters.split("/") : undefined;
		this._sResourceType = aRelativeUrlWithoutQueryParameter ? aRelativeUrlWithoutQueryParameter[1] : undefined;
		this._sResourceId = aRelativeUrlWithoutQueryParameter && aRelativeUrlWithoutQueryParameter.length >= 3 && !aRelativeUrlWithoutQueryParameter[2].includes("$") ? aRelativeUrlWithoutQueryParameter[2] : undefined;
		this._sHistoryVersion = aRelativeUrlWithoutQueryParameter && aRelativeUrlWithoutQueryParameter.indexOf("_history") > -1 ? aRelativeUrlWithoutQueryParameter[aRelativeUrlWithoutQueryParameter.indexOf("_history") + 1] : undefined;
		this._mQueryParameter = FHIRUrl.getQueryParametersByUrl(this._sRelativeUrlWithQueryParameters);
		this._sCustomOperation = this._sRelativeUrlWithoutQueryParameters && this._sRelativeUrlWithoutQueryParameters.indexOf("$") > -1 ? this._sRelativeUrlWithoutQueryParameters.substring(this._sRelativeUrlWithoutQueryParameters.indexOf("$"), this._sRelativeUrlWithoutQueryParameters.length) : undefined;
	};

	/**
	 * Determines the part of the url which is relative to the service url, e.g. /Patient/1234
	 *
	 * @returns {string} The relative url without the query parameters
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getRelativeUrlWithoutQueryParameters = function(){
		return this._sRelativeUrlWithoutQueryParameters;
	};

	/**
	 * Determines the part of the url which is relative to the service url, e.g. /Patient/1234?gender=unknown (Direct Request)
	 *
	 * @returns {string} The relative url with the query parameters
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getRelativeUrlWithQueryParameters = function(){
		return this._sRelativeUrlWithQueryParameters;
	};


	/**
	 * Determines the FHIR resource type of the configured url, e.g. Patient
	 *
	 * @returns {string} The FHIR resource type
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getResourceType = function(){
		return this._sResourceType;
	};

	/**
	 * Determines the FHIR resource id of the configured url, e.g. 1234
	 *
	 * @returns {string} The FHIR resource id
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getResourceId = function(){
		return this._sResourceId;
	};

	/**
	 * Determines the query parameters of the configured url, e.g. {gender: "unknown"}
	 *
	 * @returns {object} The map of query paramaters
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getQueryParameters = function(){
		return this._mQueryParameter;
	};

	/**
	 * Determines the FHIR history version of the configured url, e.g. 1
	 *
	 * @returns {string} The history version
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getHistoryVersion = function(){
		return this._sHistoryVersion;
	};

	/**
	 * Determines the FHIR full url based on the given absolute url, e.g. http://example.com/fhir/Patient/1234/_history/1 -> http://example.com/fhir/Patient/123
	 * or on the configured url based on the service url, if the service url is not absolute and no absolute is given undefined is returned
	 *
	 * @param {string} sAbsoluteUrl The absolute url
	 * @returns {string} The full url
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.prototype.getFullUrl = function(sAbsoluteUrl){
		if (sAbsoluteUrl && sAbsoluteUrl.substring(0, 4) === "http"){
			var iStartOfParameter = sAbsoluteUrl.indexOf("?");
			return sAbsoluteUrl.substring(0, (iStartOfParameter > -1 ? iStartOfParameter : undefined));
		} else if (this._sServiceUrl.charAt(0) !== "/" && this._sResourceType && this._sResourceId){
			return this._sServiceUrl + "/" + this._sResourceType + "/" + this._sResourceId;
		} else {
			return undefined;
		}
	};

	/**
	 * Determines the query parameters from the given url
	 *
	 * @param {string} sUrl The url
	 * @returns {object} The map containing all query parameters as {key: value}
	 * @protected
	 * @since 1.0.0
	 */
	FHIRUrl.getQueryParametersByUrl = function(sUrl){
		if (sUrl){
			var iStartOfQueryParameter = sUrl.indexOf("?");
			if (iStartOfQueryParameter > -1) {
				var aParameter = sUrl.substring(iStartOfQueryParameter + 1).split("&");
				var mParameter = {};
				var aKeyValue;
				for (var i = 0; i < aParameter.length; i++) {
					aKeyValue = aParameter[i].split("=");
					mParameter[aKeyValue[0]] = aKeyValue[1];
				}
				return mParameter;
			}
		}
		return undefined;
	};

	/**
	 * Determines the FHIR custom operation value of the configured url, e.g. /Patient/$test
	 *
	 * @returns {string} The custom operation value e.g $test
	 * @protected
	 * @since 2.2.0
	 */
	FHIRUrl.prototype.getCustomOperation = function () {
		return this._sCustomOperation;
	};

	/**
	 * Determines if its search at base level, e.g /Patient
	 *
	 * @returns {boolean} True if its search
	 * @protected
	 * @since 2.2.0
	 */
	FHIRUrl.prototype.isSearchAtBaseLevel = function () {
		return !this._sResourceId && !this._sHistoryVersion && !this._sCustomOperation;
	};

	return FHIRUrl;
});