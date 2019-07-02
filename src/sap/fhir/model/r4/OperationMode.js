/*!
 * ${copyright}
 */

// Provides enumeration sap.fhir.model.r4.OperationMode
sap.ui.define(function() {

	"use strict";

	/**
	 * Different modes for executing service operations (filtering, sorting)
	 *
	 * @alias sap.fhir.model.r4.OperationMode
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var OperationMode = {

		/**
		 * Operations are executed on the server in the FHIR service request, by appending corresponding URL parameters for filter and sorting. Each change in filtering
		 * or sorting triggers a new request to the server.
		 *
		 * @public
		 */
		Server : "Server",

		/**
		 * not supported
		 *
		 * Operations are executed on the client. This only works if all entries are loaded on the client.
		 * The initial request fetches the complete collection, filtering and sorting does not trigger further requests.
		 * @public
		 */
		Client : "Client"

	};
	return OperationMode;
});
