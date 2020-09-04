/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.lib.FHIROperationOutcome
sap.ui.define([], function () {
	"use strict";

	/**
	 * Constructor for a new FHIROperationOutcome.
	 * @see [FHIR Specification]{@link https://www.hl7.org/fhir/operationoutcome.html}
	 *
	 * @param {object} oResource The FHIR resource
	 * @constructs {sap.fhir.model.r4.lib.FHIROperationOutcome} Provides the implementation of a FHIR OperationOutcome
	 * @alias sap.fhir.model.r4.lib.FHIROperationOutcome
	 * @author SAP SE
	 * @public
	 * @since 2.0.0
	 * @version ${version}
	 */
	var FHIROperationOutcome = function (oResource) {
		this._sResourceType = oResource.resourceType;
		this._aIssue = oResource.issue ? oResource.issue : [];
	};

	/**
	* Get All Issues
	*
	* @returns {array} aIssues All the issues in the given instance
	* @public
	* @since 2.0.0
	*/
	FHIROperationOutcome.prototype.getIssues = function () {
		return this._aIssue;
	};

	/**
	 * Get Issue based on severity
	 *
	 * @param {string} sSeverity Issue severity(fatal | error | warning | information)
	 * @returns {object} oIssue
	 * @public
	 * @since 2.0.0
	 */
	FHIROperationOutcome.prototype.getIssueBySeverity = function (sSeverity) {
		return this._aIssue.find(function (oIssue) {
			return oIssue.severity === sSeverity;
		});
	};

	/**
	 * Get Issue based on code
	 *
	 * @param {string} sCode Error or warning code
	 * @returns {object} oIssue
	 * @public
	 * @since 2.0.0
	 */
	FHIROperationOutcome.prototype.getIssueByCode = function (sCode) {
		return this._aIssue.find(function (oIssue) {
			return oIssue.code === sCode;
		});
	};

	/**
	 * Get details text based on severity
	 *
	 * @param {string} sSeverity Issue severity(fatal | error | warning | information)
	 * @returns {string} sText
	 * @public
	 * @since 2.0.0
	 */
	FHIROperationOutcome.prototype.getDetailsTextBySeverity = function (sSeverity) {
		var oIssue = this._aIssue.find(function (oIssue) {
			return oIssue.severity === sSeverity;
		});
		return oIssue && oIssue.details && oIssue.details.text ? oIssue.details.text : "";
	};

	/**
	 * Get diagnostics based on severity
	 *
	 * @param {string} sSeverity Issue severity(fatal | error | warning | information)
	 * @returns {string} sDiagnostics
	 * @public
	 * @since 2.0.0
	 */
	FHIROperationOutcome.prototype.getDiagnosticsBySeverity = function (sSeverity) {
		var oIssue = this._aIssue.find(function (oIssue) {
			return oIssue.severity === sSeverity;
		});
		return oIssue && oIssue.diagnostics ? oIssue.diagnostics : "";
	};

	/**
	 * Get error details
	 *
	 * @returns {string} sText
	 * @public
	 * @since 2.0.0
	 */
	FHIROperationOutcome.prototype.getErrorText = function () {
		return this.getDetailsTextBySeverity("error");
	};

	/**
	 * Get error diagnostics
	 *
	 * @returns {string} sText
	 * @public
	 * @since 2.0.0
	 */
	FHIROperationOutcome.prototype.getErrorDiagnostics = function () {
		return this.getDiagnosticsBySeverity("error");
	};

	return FHIROperationOutcome;
});