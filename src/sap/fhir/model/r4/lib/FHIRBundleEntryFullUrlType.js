/*!
 * ${copyright}
 */

// Provides enumeration sap.fhir.model.r4.FHIRBundleEntryFullUrlType
sap.ui.define(function() {
	"use strict";

	/**
	 * Types to generate the fullUrl in FHIRBundleEntry {@link sap.fhir.model.r4.lib.FHIRBundleEntry}
	 *
	 * @alias sap.fhir.model.r4.lib.FHIRBundleEntryFullUrlType
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	 */
	var FHIRBundleEntryFullUrlType = {
		/**
		 * FullUrl of Bundle entries are generated in the following format urn:uuid:uuidv4
		 * e.g. urn:uuid:f1db03d0-9414-49ea-8554-cdbdede32c98
		 * @public
		 */
		uuid : "uuid",

		/**
		 * not supported
		 * FullUrl of Bundle entries are generated in the following format urn:oid:xxx
		 * e.g. urn:oid:1.2.3.4.5
		 * @public
		 */
		oid : "oid",

		/**
		 * FullUrl of Bundle entries are generated in the following format absoulteUrl
		 * e.g. http://example.com/fhir/Patient/1234
		 * @public
		 */
		absolute : "absolute"
	};

	return FHIRBundleEntryFullUrlType;

});