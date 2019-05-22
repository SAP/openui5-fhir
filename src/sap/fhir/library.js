sap.ui.define(function() {

	"use strict";

	/**
	 * The UI5 FHIR library provides a model to build state of the art UI5 applications in context of health industries
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
		dependencies : [ "sap.ui.core" ],
		controls : [ ],
		types : [ ]
	});

	return sap.fhir;
});