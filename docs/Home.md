<h1><span class="home-headline-1">OpenUI5-FHIR</span><span class="home-headline-2"> - </span><span class="home-headline-3">The Official API Documentation <a href="https://openui5.org/"><img height="30px" src="https://openui5.hana.ondemand.com/resources/sap/ui/documentation/sdk/images/logo_ui5.png"></a>🔥</span></h1>

This is the documentation of the *OpenUI5-FHIR* project containing the *sap.fhir* UI5 library.

UI5 provides models out of the box, which can be fragmented in client or server-side [models](https://openui5.hana.ondemand.com/#/topic/e1b625940c104b558e52f47afe5ddb4f).
- **Client-side**: JSON, XML and Resource
- **Server-side**: OData V2, OData V4

Inside the healthcare community there are a few specifications for clinical/medical data. [FHIR®](https://www.hl7.org/fhir/) is one of them. Furthermore FHIR® provides a query language to access and modify the data.

To develop an UI5 application based on an FHIR® backend applications, there is a need to provide an easy to use way to bind the UI to an model which takes care of creating, reading, updating and deleting the corresponding data in the FHIR® backend. This is the reason for the brand new *UI5 FHIR Model*.

## Includes
The *sap.fhir* UI5 library includes following files:
- `FHIRModel.js`: The model which provides functions to read, create, update and delete resources
- `FHIRContextBinding.js`: The context binding provides functions to bind a single entity to an ui element such as */Patient/a234bc/*
- `FHIRPropertyBinding.js`: The property binding provides functions to bind a single property in an entity to an ui element such as */Patient/a234bc/gender*
- `FHIRListBinding.js`: The list binding provides functions to bind a collection of entities to an ui element such as */Patient?gender=female*
- `FHIRTreeBinding.js`: The tree binding provides functions to bind a tree of entities to an ui element (Tree of organizations, etc.)

## Table of Contents

1. [Import OpenUI5-FHIR](#1-Importing-OpenUI5-FHIR)
2. [Create *UI5 FHIR Model*](#2-Create-UI5-FHIRModel)
3. [Releases](#3-Releases)

<a name="1-Import-OpenUI5-FHIR"></a>

## 1 Import OpenUI5-FHIR

The easiest and most comfortable way of importing the *UI5 FHIR Model* is using the NPM dependency `openui5-fhir`, which includes all necessary files. Add following snippet to your project `package.json` and update the version of `openui5-fhir` to the desired [version](https://github.com/SAP/openui5-fhir/releases).
```json
"dependencies": {
	"openui5-fhir": "${version}"
}
```

<a name="2-Create-UI5-FHIRModel"></a>

## 2 Create *UI5 FHIR Model*
Now, you can create the *UI5 FHIR Model* with a declaration in the *manifest.json* of your UI5 application.
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