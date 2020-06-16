/*!
 * ${copyright}
 */

/**
 * @class
 * @final
 * @extends sap.fhir.model.r4.type.URI
 * @alias sap.fhir.model.r4.type.URL
 * @author SAP SE
 * @public
 * @since 1.1.0
 * @version ${version}
 */

sap.ui.define(["sap/fhir/model/r4/type/URI"],function(URI) {
	"use strict";

	/**
	 * FHIR URL DataType
	 *
	 */
	var URL = URI.extend("sap.fhir.model.r4.type.URI", {

		constructor : function (oFormatOptions, oConstraints) {
			URI.apply(this,arguments);
		}

	}
	);

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	URL.prototype.getName =  function(){
		return "sap.fhir.model.r4.type.URL";
	};


	/**
	 * Returns the type's readable string.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	URL.prototype.toString =  function(){
		return "url";
	};

	return URL;

});
