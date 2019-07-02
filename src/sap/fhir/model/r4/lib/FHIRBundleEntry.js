/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.FHIRBundleEntry
sap.ui.define([], function() {

	"use strict";

	/**
	 * Constructor for a new FHIRBundleEntry
	 *
	 * @param {string} sFullUrl The fullUrl of the bundly entry
	 * @param {object} oResource The FHIR resource
	 * @param {sap.fhir.model.r4.lib.FHIRBundlRequest} oRequest The request of the bundle entry
	 * @alias sap.fhir.model.r4.lib.FHIRBundleEntry
	 * @constructs {FHIRBundleEntry} Provides the implementation of a FHIR bundle entry
	 * @author SAP SE
	 * @protected
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRBundleEntry = function(sFullUrl, oResource, oRequest) {
		this._sFullUrl = sFullUrl;
		this._oResource = oResource;
		this._oRequest = oRequest;
	};

	/**
	 * Creates a FHIR valid bundle entry representation
	 *
	 * @returns {object} FHIR bundle entry
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleEntry.prototype.getBundleEntryData = function() {
		var oBundleEntry = {};
		oBundleEntry.fullUrl = this._sFullUrl ? this._sFullUrl : undefined;
		oBundleEntry.resource = this._oResource ? this._oResource : undefined;
		oBundleEntry.request = this._oRequest.getBundleRequestData();
		return oBundleEntry;
	};

	/**
	 * Determines the FHIR Bundle request of the FHIR bundle entry
	 *
	 * @returns {sap.fhir.model.r4.lib.FHIRBundleRequest} The bundle request of the entry.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleEntry.prototype.getRequest = function() {
		return this._oRequest;
	};

	/**
	 * Determines the FHIR Bundle resource of the FHIR bundle entry
	 *
	 * @returns {object} oFHIRResource
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleEntry.prototype.getResource = function() {
		return this._oResource;
	};

	/**
	 * Determines the full url of the FHIR bundle entry
	 *
	 * @returns {string} sFullUrl
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundleEntry.prototype.getFullUrl = function() {
		return this._sFullUrl;
	};

	return FHIRBundleEntry;
});