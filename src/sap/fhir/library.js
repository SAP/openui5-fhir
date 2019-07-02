sap.ui.define(function() {

	"use strict";

	/**
	 * The sap.fhir library provides a model to build state of the art UI5 applications in context of health industries
	 *
	 * @namespace
	 * @name sap.fhir.model.r4
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	sap.ui.getCore().initLibrary({
		name : "sap.fhir",
		version : "${version}",
		noLibraryCSS: true,
		dependencies : [ "sap.ui.core" ],
		controls : [ ],
		types : [ ]
	});

	return sap.fhir;
});