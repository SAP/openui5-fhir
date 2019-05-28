# OpenUI5-FHIR <a href="https://openui5.org/"><img height="30px" src="https://openui5.hana.ondemand.com/resources/sap/ui/documentation/sdk/images/logo_ui5.png"></a>🔥

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
		1. [Development](#4.2.1-Development)
		2. [ESLinting](#4.2.2-ESLinting)
		3. [Testing](#4.2.3-Testing)
		4. [Documentation](#4.2.4-Documentation)

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
3. Go to the folder which contains the *OpenUI5-FHIR*-folder
4. Open the console (windows: CMD, linux/mac: terminal)
5. Enter `npm install`
6. Enter `npm run serve`. This script starts the mockserver and hosts all needed UI5 resources
7. *Optional*: If the mockserver is already startet, you can use `npm run serve:ui5` to only host the UI5 resources
8. Open your desired browser and open [http://localhost:8081/test-resources/sap-fhir-test-app/webapp/index.html](http://localhost:8081/test-resources/sap-fhir-test-app/webapp/index.html)

<a name="4.2-Development-Tasks"></a>

### 4.2 Development Tasks
The following sections describe, how useful development tasks can be executed.

<a name="4.2.1-Development"></a>

#### 4.2.1 Development
Developing and debugging can't be easier. Therefore, execute `npm run serve` or if the mockserver is already started `npm run serve:ui5`.

Following entry points are available:
- QUnit tests: [http://localhost:8081/test-resources/qunit/unit.qunit.html](http://localhost:8081/test-resources/qunit/unit.qunit.html)
- OPA5 tests: [http://localhost:8081/test-resources/sap-fhir-test-app/webapp/test/opa5/all.opa5.html](http://localhost:8081/test-resources/sap-fhir-test-app/webapp/test/opa5/all.opa5.html)

<a name="4.2.2-ESLinting"></a>

#### 4.2.2 ESLinting
There are various lint-scripts in `package.json`. During development you will most likely want to use either:

```bash
npm run lint:watch
```

or

```bash
npm run lint:watch:fix
```

The former script simply watches all files for changes and lints them immediately. The result is written to the console. The latter script is also watching all files for changes but applies fixes automatically.

<a name="4.2.3-Testing"></a>

#### 4.2.3 Testing

The testsuite needs a mockserver. Therefore various scripts are placed in the `package.json`.

```bash
npm run serve:mockserver
```

Starts a mockerserver with test data.

```bash
npm run test-mockserver
```

Starts a mockerserver with test data and executes the QUnit and Opa5 tests.

```bash
npm run test
```

Executes the QUnit and Opa5 tests.

```bash
npm run test:unit
```

Executes the QUnit tests.

```bash
npm run test:opa5
```

Executes the OPA5 tests.


<a name="4.2.4-Documentation"></a>

#### 4.2.4 Documentation

```bash
npm run docs
```

The above command creates API documentation for thie FHIRModel project. All classes, which are considered to be part of the public API are explicitely named in the run-script itself.