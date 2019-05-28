sap.ui.define(["sap/ui/core/util/MockServer"], function(MockServer) {
	"use strict";

	function fnLoadJSON(sPath) {
		return function(oXHR) {
			try {
				oXHR.respondFile(200, {}, sPath);
			} catch (e){
				throw (e);
			}
		};
	}

	function addRequest(aRequests, sMethod, sUrlRegex, sFilePath){
		aRequests.push({method: sMethod, path: new RegExp(sUrlRegex), response: fnLoadJSON(sFilePath)});
		return aRequests;
	}

	MockServer.config({
		autoRespond : true,
		autoRespondAfter : 0
	});

	// create the mockserver
	var oMockServer = new MockServer();

	// configure the mock requests
	var aRequests = [];
	aRequests = addRequest(aRequests, "GET", "^.*(businessVersion).*$", "/test-resources/localService/BusinessVersion.json");
	oMockServer.setRequests(aRequests);

	// start the mockserver
	oMockServer.start();
});