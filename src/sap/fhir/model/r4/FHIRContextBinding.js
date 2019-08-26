/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRContextBinding
sap.ui.define([
	"sap/ui/model/ContextBinding",
	"sap/ui/model/ChangeReason",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/fhir/model/r4/Context",
	"sap/base/Log"
], function(ContextBinding, ChangeReason, FHIRUtils, Context, Log) {
	"use strict";

	/**
	 * Constructor for a new FHIRContextBinding
	 *
	 * @class
	 * @classdesc Context binding implementation for the FHIRModel
	 * @alias sap.fhir.model.r4.FHIRContextBinding
	 * @param {sap.ui.model.Model} oModel The assigned FHIR Model
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} oContext The context which is required as base for a relative path
	 * @param {object} [mParameters] The map which contains additional parameters for the binding
	 * @param {string} [mParameters.groupId] The group id
	 * @param {object} [mParameters.request] The parameters which will be passed with the request as url parameters, Note: any additional url parameters can be mentioned here also
	 * @param {string} [mParameters.request._include] The _include parameter, e.g. in a list which is bind to '/Patient' it's possible to include 'Coverage:payor'
	 * @param {string} [mParameters.request._revinclude] The _revinclude parameter, e.g. in a list which is bind to '/Practitioner' it's possible to reverse include 'PractitionerRole:practitioner'
	 * @param {number} [mParameters.request._count] The number of resources which should be requested from the server
	 * @author SAP SE
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRContextBinding = ContextBinding.extend("sap.fhir.model.r4.FHIRContextBinding", {

		constructor : function(oModel, sPath, oContext, mParameters) {
			ContextBinding.call(this, oModel, sPath, oContext, mParameters);
			this.mParameters = mParameters;
			this.sId = FHIRUtils.uuidv4();
			this.sGroupId = mParameters && mParameters.groupId || oContext && oContext.sGroupId;
			this.bUnique = mParameters && mParameters.unique;
			this.oElementContext = Context.create(this.oModel, this, this.sPath, this.sGroupId);
			var sChangeReason = FHIRUtils.getNumberOfLevelsByPath(this.sPath) === 1 ? ChangeReason.Refresh : undefined;
			this.oElementContext._loadContext(sChangeReason);
		}
	});

	/**
	 * Checks if the context binding needs to be updated.
	 *
	 * @param {boolean} bForceUpdate To force the update of the binding
	 * @protected
	 * @since 1.0.0
	 */
	FHIRContextBinding.prototype.checkUpdate = function(bForceUpdate) {
		if (this.isRelative() || this.bIsCreatedResource || this.bIsLoaded){
			this.oElementContext._markAsReady(this.oElementContext.iTotal);
		}
	};

	/**
	 * Refreshes all depending bindings
	 *
	 * @param {sap.ui.model.ChangeReason} sChangeReason The reason for refreshing the binding
	 * @public
	 * @since 1.0.0
	 */
	FHIRContextBinding.prototype.refresh = function(sChangeReason) {
		this.oElementContext.refresh(sChangeReason);
	};

	/**
	 * Return the bound context.
	 *
	 * @returns {sap.fhir.model.r4.Context} Context object used by this context binding or <code>null</code>
	 * @protected
	 * @since 1.0.0
	 */
	FHIRContextBinding.prototype.getBoundContext = function() {
		return this.oElementContext;
	};

	/**
	 * Sets the context to the given <code>oContext</code>
	 *
	 * @param {sap.fhir.model.r4.Context} oContext the new context object
	 * @protected
	 * @since 1.0.0
	 */
	FHIRContextBinding.prototype.setContext = function(oContext) {
		this.oContext = oContext;
		this._fireChange({
			reason : ChangeReason.Context
		});
	};


	return FHIRContextBinding;

});
