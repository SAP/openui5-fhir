/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.BindingInfo
sap.ui.define([], function() {

	"use strict";

	/**
	 * Constructor for a new BindingInfo
	 *
	 * @param {string} sResourceId The id of the the FHIR resource e.g. 123
	 * @param {string} sResourceType The FHIR resource type e.g. Patient
	 * @param {string} sResourcePath The resource binding path e.g. /Patient/123 or /$_history/Patient/123/1
	 * @param {string} sRelativePath The relative binding path e.g. gender
	 * @param {string} sAbsolutePath The absolute binding path e.g. /Patient/123/gender
	 * @param {string[]} aBinding The absolute path as an array e.g. ["Patient", "123", "gender"] or ["$_history", "Patient", "123", "1", "gender"]
	 * @param {string} sGroupId The group id specified in the corresponding binding
	 * @param {string} sRequestPath The request path e.g. /Patient/123 or e.g. /Patient/123/_history/1
	 * @param {string} aResourcePath The resource path as an array e.g. ["Patient", "123"] or ["$_history", "Patient", "123", "1"]
	 * @param {string} sResourceServerPath The original resource path e.g. /Patient/123
	 * @param {string} sETag The ETag of the resource
	 * @alias sap.fhir.model.r4.lib.BindingInfo
	 * @author SAP SE
	 * @constructs {BindingInfo} implementation for binding paths, resource types etc of a FHIR binding.
	 * @protected
	 * @since 1.0.0
	 * @version ${version}
	 */
	var BindingInfo = function(sResourceId, sResourceType, sResourcePath, sRelativePath, sAbsolutePath, aBinding, sGroupId, sRequestPath, aResourcePath, sResourceServerPath, sETag) {
		this._sResourceId = sResourceId;
		this._sResourceType = sResourceType;
		this._sResourcePath = sResourcePath;
		this._sRelativePath = sRelativePath;
		this._sAbsolutePath = sAbsolutePath;
		this._sGroupId = sGroupId;
		this._sRequestPath = sRequestPath;
		this._aResourcePath = aResourcePath;
		this._sResourceServerPath = sResourceServerPath;
		this._sETag = sETag;
		if (aBinding.indexOf("") > -1){
			throw new Error("Invalid property binding path");
		}
		this._aBinding = aBinding;
	};

	/**
	 * Determines the id of the FHIR resource assigned to this binding info
	 *
	 * @returns {string} The FHIR resource id e.g. 123
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getResourceId = function() {
		return this._sResourceId;
	};

	/**
	 * Determines the type of the FHIR resource assigned to this binding info
	 *
	 * @returns {string} The FHIR resource type e.g. Patient
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getResourceType = function() {
		return this._sResourceType;
	};

	/**
	 * Determines the binding path of the FHIR resource assigned to this binding info
	 *
	 * @returns {string} The resource binding path e.g. /Patient/123
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getResourcePath = function() {
		return this._sResourcePath;
	};

	/**
	 * Determines the relative binding path assigned to this binding info
	 *
	 * @returns {string} The relative binding path e.g. gender
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getRelativePath = function() {
		return this._sRelativePath;
	};

	/**
	 * Determines the absolute binding path assigned to this binding info
	 *
	 * @returns {string} The absolute binding path e.g. /Patient/123/gender
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getAbsolutePath = function() {
		return this._sAbsolutePath;
	};

	/**
	 * Determines the groupId to this binding info
	 *
	 * @returns {string} The groupId
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getGroupId = function() {
		return this._sGroupId;
	};

	/**
	 * Determines the absolute binding path as an array assigned to this binding info
	 *
	 * @returns {string[]} The absolute path as an array e.g. ["Patient", "123", "gender"] or ["$_history", "Patient", "123", "1", "gender"]
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getBinding = function() {
		return this._aBinding;
	};

	/**
	 * Determines the request path to this binding info e.g. /Patient/123 or e.g. /Patient/123/_history/1
	 *
	 * @returns {string} The request path e.g. /Patient/123 or e.g. /Patient/123/_history/1
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getRequestPath = function() {
		return this._sRequestPath;
	};

	/**
	 * Determines the resource path as an array e.g. ["Patient", "123"] or ["$_history", "Patient", "123", "1"]
	 *
	 * @returns {string} The resource path as an array e.g. ["Patient", "123"] or ["$_history", "Patient", "123", "1"]
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getResourcePathArray = function() {
		return this._aResourcePath;
	};

	/**
	 * Determines the original resource path
	 *
	 * @returns {string} The original resource path e.g. /Patient/123
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getResourceServerPath = function() {
		return this._sResourceServerPath;
	};

	/**
	 * Determines the ETag of the resource
	 *
	 * @returns {string} The ETag of the resource
	 * @protected
	 * @since 1.0.0
	 */
	BindingInfo.prototype.getETag = function() {
		return this._sETag;
	};

	return BindingInfo;
});