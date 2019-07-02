/*!
 * ${copyright}
 */

// Provides enumeration sap.fhir.model.r4.SubmitMode
sap.ui.define(function() {
	"use strict";

	/**
	 * Modes to control the use of bundle requests for a group ID.
	 *
	 * @alias sap.fhir.model.r4.SubmitMode
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var SubmitMode = {
		/**
		 * Requests associated with the group ID are sent in a bundle with bundle type 'batch' request via {@link sap.fhir.model.r4.FHIRModel#submitBundle}.
		 *
		 * @public
		 */
		Batch : "Batch",

		/**
		 * Requests associated with the group ID are sent in a bundle with bundle type 'transaction' request via {@link sap.fhir.model.r4.FHIRModel#submitBundle}.
		 *
		 * @public
		 */
		Transaction : "Transaction",

		/**
		 * Requests associated with the group ID are sent directly without bundle.
		 *
		 * @public
		 */
		Direct : "Direct"
	};

	return SubmitMode;

});