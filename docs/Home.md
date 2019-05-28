# OpenUI5-FHIR - The Official API Documentation <a href="https://openui5.org/"><img height="30px" src="https://openui5.hana.ondemand.com/resources/sap/ui/documentation/sdk/images/logo_ui5.png"></a>🔥

This is the documentation of the *OpenUI5-FHIR* project containing the *sap.fhir* UI5 library.

UI5 provides models out of the box, which can be fragmented in client or server-side [models](https://openui5.hana.ondemand.com/#/topic/e1b625940c104b558e52f47afe5ddb4f).
- Client-side models: JSON, XML and Resource
- Server-side models: OData V2, OData V4

Inside the healthcare community there are a few specifications for clinical/medical data. [FHIR](https://www.hl7.org/fhir/) is one of them. Furthermore FHIR provides a query language to access and modify the data.

To develop UI5 applications based on FHIR backend applications, there is a need to provide an easy to use way to bind the UI to an model which takes care of creating, reading, updating and deleting the corresponding data in the FHIR backend. This is the reason for the brand new UI5 FHIRModel.

## Includes
The FHIRModel implementation includes following files:
- `FHIRModel.js`: The model which provides functions to read, create, update and delete resources
- `FHIRContextBinding.js`: The context binding provides functions to bind a single entity to an ui element such as */Patient/a234bc/*
- `FHIRPropertyBinding.js`: The property binding provides functions to bind a single property in an entity to an ui element such as */Patient/a234bc/gender*
- `FHIRListBinding.js`: The list binding provides functions to bind a collection of entities to an ui element such as */Patient?gender=female*
- `FHIRTreeBinding.js`: The tree binding provides functions to bind a tree of entities to an ui element (Tree of organizations, etc.)

## Table of Contents

1. [Import OpenUI5-FHIR](#1-Importing-OpenUI5-FHIR)
2. [Create UI5 FHIRModel](#2-Create-UI5-FHIRModel)
3. [Releases](#3-Releases)
4. [Development](#4-Development) \(*only internal*\)
    1. [Deployment of *sap-fhir-test-app*-project](#4.1-Deployment-of-sap-fhir-test-app-project)
	2. [Development Tasks](#4.2-Development-Tasks)
		1. [ESLinting](#4.2.1-ESLinting)
		2. [Testing](#4.2.2-Testing)
		3. [Documentation](#4.2.3-Documentation)

<a name="1-Import-OpenUI5-FHIR"></a>

## 1 Import OpenUI5-FHIR

The easiest and most comfortable way of importing the UI5 FHIRModel is using the NPM dependency `openui5-fhir`, which includes all necessary files. Add following snippet to your project `package.json` and update the version of `openui5-fhir` to the desired [version](https://github.com/SAP/openui5-fhir/releases).
```json
"dependencies": {
	"openui5-fhir": "1.0.X"
}
```

<a name="2-Create-UI5-FHIRModel"></a>

## 2 Create UI5 FHIRModel
Now, you can create the UI5 FHIRModel with a declaration in the *manifest.json* of your UI5 application.
```json
	"sap.app": {
		"dataSources": {
			"myFHIRService": {
				"uri": "https://myfhirservicehost.com/fhir/",
				"type": "FHIR"
			}
		}
	},
	"sap.ui5": {
		"fhirModel": {
			"type": "sap.fhir.model.r4.FHIRModel",
			"dataSource": "myFHIRService"
		}
	}
```

<a name="3-Releases"></a>

## 3 Releases
Overview about [all releases](https://github.com/SAP/openui5-fhir/releases).

Get the [latest release](https://github.com/SAP/openui5-fhir/releases/latest).

<a name="4-Development"></a>

## 4 Development
The following section describes how the *OpenUI5-FHIR* project internal test application can be deployed and which development tasks can be executed.

<a name="4.1-Deployment-of-sap-fhir-test-app-project"></a>

### 4.1 Deployment of *sap-fhir-test-app*-project
1. Go to the [latest release](https://github.com/SAP/openui5-fhir/releases/latest) and download the latest release *.zip*.
2. Extract the *.zip* in your desired local location
3. To deploy the *sap-fhir-test-app*-project you can use any HTTP server. We're using the node module [http-server](https://www.npmjs.com/package/http-server) or the chrome app [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb).
	1. *http-server*:
		1. Go to the folder which contains the *OpenUI5-FHIR*-folder
		2. Open the console (windows: CMD, linux/mac: terminal)
		3. Enter `npm install http-server -g`
		4. Enter `http-server`
		5. Open your desired browser and open `http://localhost:8080/openui5-fhir/test/sap-fhir-test-app/webapp/`
	2. *Web Server for Chrome*:
		1. Open your chrome browser and open [link](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)
		2. Click on the install button of the *Web Server for Chrome*
		3. Open the *Web Server for Chrome* app
		4. Click on the *CHOOSE FOLDER* button and choose the folder contains the *OpenUI5-FHIR* folder
		5. Open your desired browser and open `http://localhost:8887/openui5-fhir/test/sap-fhir-test-app/webapp/`

<a name="4.2-Development-Tasks"></a>

### 4.2 Development Tasks
The following sections describe, how useful development tasks can be executed.

<a name="4.2.1-ESLinting"></a>

#### 4.2.1 ESLinting
There are various lint-scripts in `package.json`. During development you will most likely want to use either:

```bash
npm run lint:watch
```

or

```bash
npm run lint:watch:fix
```

The former script simply watches all files for changes and lints them immediately. The result is written to the console. The latter script is also watching all files for changes but applies fixes automatically.

<a name="4.2.2-Testing"></a>

#### 4.2.2 Testing

The testsuite needs a mockserver. Therefore various scripts are placed in the  `package.json`. `setup_mock.sh` has to be used. Execute `./setup_mock.sh` when you start developing and/or testing.

```bash
npm run serve:mockserver
```

Starts a mockerserver with test data.

```bash
npm run test
```

Executes the QUnit and Opa5 tests.

```bash
npm run test-mockserver
```

Starts a mockerserver with test data and executes the QUnit and Opa5 tests.


<a name="4.2.3-Documentation"></a>

#### 4.2.3 Documentation

```bash
npm run docs
```

The above command creates API documentation for thie FHIRModel project. All classes, which are considered to be part of the public API are explicitely named in the run-script itself.