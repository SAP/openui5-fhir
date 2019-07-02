/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.FHIRBundle
sap.ui.define([ "sap/fhir/model/r4/FHIRUtils" ], function(FHIRUtils) {
	"use strict";

	/**
	 * Constructor for a new FHIRBundle. [FHIR Specification]{@link https://www.hl7.org/fhir/bundle.html}
	 *
	 * @param {sap.fhir.model.r4.lib.FHIRBundleType} sBundleType The type of the bundle
	 * @param {string} sGroupId The group id which collects all requests for this bundle
	 * @constructs {sap.fhir.model.r4.lib.FHIRBundle} Provides the implementation of a FHIR bundle
	 * @alias sap.fhir.model.r4.lib.FHIRBundle
	 * @author SAP SE
	 * @protected
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRBundle = function(sBundleType, sGroupId) {
		this._sId = FHIRUtils.uuidv4();
		this._sBundleType = sBundleType;
		this._aBundleEntries = [];
		this._sGroupId = sGroupId;
	};

	/**
	 * Creates a FHIR valid bundle representation
	 *
	 * @returns {object} FHIR bundle
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getBundleData = function() {
		var oBundle = {};
		oBundle.id = this._sId;
		oBundle.type = this._sBundleType;
		oBundle.resourceType = "Bundle";
		oBundle.entry = this.getBundleEntriesData();
		return oBundle;
	};

	/**
	 * Determines an array containing all bundle entries in a FHIR valid representation
	 *
	 * @returns {array} FHIR bundle entry array
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getBundleEntriesData = function() {
		var aBundleEntriesData = [];
		for (var i = 0; i < this._aBundleEntries.length; i++) {
			aBundleEntriesData.push(this._aBundleEntries[i].getBundleEntryData());
		}
		return aBundleEntriesData;
	};

	/**
	 * Returns the bundle entry on given <code>iIndex</code> in the bundle
	 *
	 * @param {number} iIndex The index of the desired bundle entry
	 * @returns {object} FHIR bundle
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getBundlyEntry = function(iIndex) {
		return this._aBundleEntries[iIndex];
	};

	/**
	 * Adds the given <code>oBundlyEntry</code> to the bundle
	 *
	 * @param {sap.fhir.model.r4.lib.FHIRBundleEntry} oBundleEntry The FHIR Bundle Entry
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.addBundleEntry = function(oBundleEntry) {
		this._aBundleEntries.push(oBundleEntry);
	};

	/**
	 * Determines the id of the bundle
	 *
	 * @returns {string} The bundle id.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getId = function() {
		return this._sId;
	};

	/**
	 * Determines the bundle type of the bundle
	 *
	 * @returns {string} The bundle type.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getBundleType = function() {
		return this._sBundleType;
	};

	/**
	 * Determines all bundle entries
	 *
	 * @returns {sap.fhir.model.r4.lib.FHIRBundleEntry[]} All bundle entries.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getBundleEntries = function() {
		return this._aBundleEntries;
	};

	/**
	 * Determines the number of bundle entries
	 *
	 * @returns {number} Number of bundle entries.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getNumberOfBundleEntries = function() {
		return this._aBundleEntries.length;
	};

	/**
	 * Determines the groupId which is assigned to the FHIR bundle
	 *
	 * @returns {string} Group Id which is assigned to the FHIR bundle.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRBundle.prototype.getGroupId = function() {
		return this._sGroupId;
	};

	return FHIRBundle;
});