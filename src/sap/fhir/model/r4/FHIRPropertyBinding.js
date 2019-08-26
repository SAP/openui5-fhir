/*!
 * ${copyright}
 */

// Provides class sap.fhir.model.r4.FHIRPropertyBinding
sap.ui.define([
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/Context",
	"sap/ui/model/ChangeReason",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/base/Log",
	"sap/base/util/deepEqual"
], function(PropertyBinding,
	Context, ChangeReason, FHIRUtils, Log, deepEqual) {
	"use strict";

	/**
	 * Constructor for a new FHIRPropertyBinding
	 *
	 * @class
	 * @classdesc Property binding implementation for the FHIRModel
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The assigned FHIRModel
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} oContext The context which is required as base for a relative path
	 * @param {object} [mParameters] The map which contains additional parameters for the binding
	 * @alias sap.fhir.model.r4.FHIRPropertyBinding
	 * @author SAP SE
	 * @extends sap.ui.model.PropertyBinding
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRPropertyBinding = PropertyBinding.extend("sap.fhir.model.r4.FHIRPropertyBinding", {

		constructor : function(oModel, sPath, oContext, mParameters) {
			PropertyBinding.apply(this, arguments);
			this.oValue = this._getValue();
			this.sId = FHIRUtils.uuidv4();
			this.mParameters = mParameters;
		}

	});

	/**
	 * Initializes the binding, will force an update of the property binding
	 *
	 * @see sap.ui.model.Binding.prototype.initialize
	 * @returns {sap.fhir.model.r4.FHIRPropertyBinding} <code>this</code> to allow method chaining
	 * @protected
	 * @since 1.0.0
	 */
	FHIRPropertyBinding.prototype.initialize = function() {
		this.checkUpdate(false);
		return this;
	};

	/**
	 * Updates the binding value and sends a change event
	 *
	 * @param {boolean} [bForceUpdate] Force update of binding
	 * @param {object} [mChangedResources] The object containing the changed resources
	 * @param {string} [sMethod] The http method which triggered the checkupdate()
	 * @param {string} [sChangeReason] The reason for the fireChange event
	 * @protected
	 * @since 1.0.0
	 */
	FHIRPropertyBinding.prototype.checkUpdate = function(bForceUpdate, mChangedResources, sMethod, sChangeReason) {
		var oValue = this._getValue();
		this.oValue = FHIRUtils.deepClone(oValue);
		this._fireChange({
			reason : sChangeReason || ChangeReason.Change
		});
	};

	/**
	 * Sets the context of the property binding to support relative binding paths
	 *
	 * @param {sap.fhir.model.r4.Context} [oContext] The context which is required as base for a relative path
	 * @see sap.ui.model.Binding#setContext
	 * @protected
	 * @since 1.0.0
	 */
	FHIRPropertyBinding.prototype.setContext = function(oContext) {
		this.oContext = oContext;
		this.checkUpdate(false, undefined, undefined, ChangeReason.Context);
	};

	/**
	 * Determines the current value of the property binding
	 *
	 * @returns {object} The current value of the property binding
	 * @see sap.ui.model.PropertyBinding#getValue
	 * @public
	 * @since 1.0.0
	 */
	FHIRPropertyBinding.prototype.getValue = function() {
		return this.oValue;
	};

	/**
	 * Determines the model value of the property binding based on the configured <code>sPath</code> and <code>oContext</code>
	 *
	 * @returns {object} The model value of the property binding
	 * @private
	 * @since 1.0.0
	 */
	FHIRPropertyBinding.prototype._getValue = function() {
		if (this.sPath === "%total%" && this.oContext){
			return this.oContext.iTotal;
		} else if (this.sPath !== "%total%"){
			return this.oModel.getProperty(this.sPath, this.oContext);
		} else {
			return undefined;
		}
	};

	/**
	 * Sets the current value of the property binding, the value of the model property and fire a change event. Only changes the value if it differs from the current value
	 *
	 * @param {object} oValue The new value of the property binding
	 * @public
	 * @since 1.0.0
	 */
	FHIRPropertyBinding.prototype.setValue = function(oValue) {
		this.oModel.setProperty(this.sPath, oValue, this.oContext, this);
	};

	return FHIRPropertyBinding;

});