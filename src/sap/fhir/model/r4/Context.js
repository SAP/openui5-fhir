/*!
 * ${copyright}
 */

//Provides class sap.fhir.model.r4.Context
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/ui/model/Context"
], function (Log, ChangeReason, FHIRUtils, BaseContext) {
	"use strict";

	/**
	 * Constructor for a new Context, should not be used, use the static Context.create function
	 *
	 * @class
	 * @classdesc Context implementation for the FHIRModel
	 * @alias sap.fhir.model.r4.Context
	 * @param {sap.fhir.model.r4.FHIRModel} oModel
	 *   The model
	 * @param {sap.fhir.model.r4.FHIRContextBinding|sap.fhir.model.r4.FHIRListBinding|sap.fhir.model.r4.FHIRTreeBinding} oBinding
	 *   A binding that belongs to the model
	 * @param {string} sPath
	 *   An absolute path without trailing slash
	 * @param {string} [sGroupId]
	 *   The group where the context belongs to
	 * @author SAP SE
	 * @extends sap.ui.model.Context
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 *
	 * @see sap.fhir.model.r4.Context.create
	 */
	var Context = BaseContext.extend("sap.fhir.model.r4.Context", {
		constructor : function (oModel, oBinding, sPath, sGroupId) {
			BaseContext.call(this, oModel, sPath);
			this.oBinding = oBinding;
			this.sGroupId = sGroupId;
		}
	});

	/**
	 * Loads the context based on the configured <code>sPath</code> and the created context
	 *
	 * @param {sap.ui.model.ChangeReason} sChangeReason The reason for refreshing the binding
	 * @private
	 * @since 1.0.0
	 */
	Context.prototype._loadContext = function(sChangeReason) {
		var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oBinding.oContext, this.oBinding.bUnique);
		if (oBindingInfo && !this.oBinding.bPendingRequest){
			var oRequestInfo = this.oModel._getProperty(this.oModel.mChangedResources, oBindingInfo.getBinding().slice(0, 2));
			if (!oRequestInfo || oRequestInfo.method !== "POST"){
				var oResource = this.oModel._getProperty(this.oModel.oData, oBindingInfo.getBinding());
				if (!oResource || sChangeReason === ChangeReason.Refresh){
					var fnAfterContextRequest = function(oData){
						if (oData.message !== "abort"){
							this._markAsReady(oData && oData.total, sChangeReason);
						}
					}.bind(this);
					var mParameters = {
						binding : this.oBinding,
						forceDirectCall : false,
						success : fnAfterContextRequest,
						error : fnAfterContextRequest
					};
					FHIRUtils.addRequestQueryParameters(this.oBinding, mParameters);
					this.oBinding.bPendingRequest = true;
					this.oModel.loadData(oBindingInfo.getRequestPath(), mParameters);
					this.bPendingRequest = true;
				} else {
					this.oBinding.bIsLoaded = true;
				}
			} else {
				this.oBinding.bIsCreatedResource = true;
			}
		}
	};

	/**
	 * Determines the dependent binding
	 *
	 * @returns {sap.fhir.model.r4.FHIRContextBinding|sap.fhir.model.r4.FHIRListBinding|sap.fhir.model.r4.FHIRTreeBinding} oBinding The dependent binding
	 * @protected
	 * @since 1.0.0
	 */
	Context.prototype.getBinding = function() {
		return this.oBinding;
	};

	/**
	 * Marks the context binding initialization or update as completed
	 *
	 * @param {number} iTotal The total number of bound resources. This information is needed to enable the property binding %total%
	 * @param {sap.ui.model.ChangeReason} sChangeReason The reason for refreshing the binding
	 * @private
	 * @since 1.0.0
	 */
	Context.prototype._markAsReady = function(iTotal, sChangeReason){
		this.iTotal = iTotal;
		this.oBinding.bInitial = false;
		this.oBinding.bPendingRequest = false;
		this.oBinding._fireChange({
			reason : sChangeReason || ChangeReason.Change
		});
	};

	/**
	 * Refreshes all depending bindings
	 *
	 * @param {sap.ui.model.ChangeReason} sChangeReason The reason for refreshing the context
	 * @public
	 * @since 1.0.0
	 */
	Context.prototype.refresh = function(sChangeReason) {
		this.oBinding.bInitial = true;
		this._loadContext(ChangeReason.Refresh);
	};

	/**
	 * Determines the context for the given path with the binding and if it not exists creates it
	 *
	 * @param {sap.fhir.model.r4.FHIRModel} oModel
	 *   The model
	 * @param {sap.fhir.model.r4.FHIRContextBinding|sap.fhir.model.r4.FHIRListBinding|sap.fhir.model.r4.FHIRTreeBinding} oBinding
	 *   A binding that belongs to the model
	 * @param {string} sPath
	 *   An absolute path without trailing slash
	 * @param {string} [sGroupId]
	 *   The group where the context belongs to
	 * @returns {sap.fhir.model.r4.Context} Context object used by this context binding or <code>null</code>
	 * @protected
	 * @since 1.0.0
	 */
	Context.create = function(oModel, oBinding, sPath, sGroupId){
		if (oModel.mContexts.hasOwnProperty(sPath) && !oModel.mContexts[sPath].hasOwnProperty(oBinding.sId)){
			oModel.mContexts[sPath][oBinding.sId] = new Context(oModel, oBinding, sPath, sGroupId);
		} else if (!oModel.mContexts.hasOwnProperty(sPath)){
			oModel.mContexts[sPath] = {};
			oModel.mContexts[sPath][oBinding.sId] = new Context(oModel, oBinding, sPath, sGroupId);
		}
		return oModel.mContexts[sPath][oBinding.sId];
	};

	return Context;
});