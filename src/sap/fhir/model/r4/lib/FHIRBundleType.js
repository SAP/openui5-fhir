/*!
 * ${copyright}
 */

// Provides enumeration sap.fhir.model.r4.lib.FHIRBundleType
sap.ui.define(function() {
	"use strict";

	/**
	 * Represents the ValueSet [BundleType]{@link http://hl7.org/fhir/ValueSet/bundle-type}
	 *
	 * @enum {string}
	 * @protected
	 * @alias sap.fhir.model.r4.lib.FHIRBundleType
	 */
	var FHIRBundleType = {
		/**
		 * The bundle is a document. The first resource is a Composition.
		 *
		 * @see FHIR Specification: [bundle-type-document]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-document}
		 * @public
		 */
		Document : "document",

		/**
		 * The bundle is a message. The first resource is a MessageHeader.
		 *
		 * @see FHIR Specification: [bundle-type-message]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-message}
		 * @public
		 */
		Message : "message",

		/**
		 * The bundle is a transaction - intended to be processed by a server as an atomic commit.
		 *
		 * @see FHIR Specification: [bundle-type-transaction]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-transaction}
		 */
		Transaction : "transaction",

		/**
		 * The bundle is a transaction response. Because the response is a transaction response, the transaction has succeeded, and all responses are error free.
		 *
		 * @see FHIR Specification: [bundle-type-transaction-response]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-transaction-response}
		 */
		TransactionResponse : "transaction-response",

		/**
		 * The bundle is a transaction - intended to be processed by a server as a group of actions.
		 *
		 * @see FHIR Specification: [bundle-type-batch]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-batch}
		 */
		Batch : "batch",

		/**
		 * The bundle is a batch response. Note that as a batch, some responses may indicate failure and others success.
		 *
		 * @see FHIR Specification: [bundle-type-batch-response] {@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-batch-response}
		 */
		BatchResponse : "batch-response",

		/**
		 * The bundle is a list of resources from a history interaction on a server.
		 *
		 * @see FHIR Specification: [bundle-type-history]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-history}
		 */
		History : "history",

		/**
		 * The bundle is a list of resources returned as a result of a search/query interaction, operation, or message.
		 *
		 * @see FHIR Specification: [bundle-type-searchset]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-searchset}
		 */
		SearchSet : "searchset",

		/**
		 * The bundle is a set of resources collected into a single package for ease of distribution.
		 *
		 * @see FHIR Specification: [bundle-type-collection]{@link https://www.hl7.org/fhir/codesystem-bundle-type.html#bundle-type-collection}
		 */
		Collection : "collection"
	};

	return FHIRBundleType;

}, /* bExport= */true);