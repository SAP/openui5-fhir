<p align="center"><img height="300px" src="docs/images/logo.png"></a></p>

# OpenUI5-FHIR
[![npm version](https://badge.fury.io/js/openui5-fhir.svg)](//www.npmjs.com/package/openui5-fhir)
[![Build Status](https://travis-ci.org/SAP/openui5-fhir.svg?branch=master)](https://travis-ci.org/SAP/openui5-fhir)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE.txt)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**The OpenUI5-FHIR project connects the worlds of UI5 and FHIR. Build beautiful and enterprise-ready web applications based on the FHIR specification.**

The world of healthcare is in change. Though being a highly regulated industry, more and more solutions move from on-premise into the cloud due to increasing costs. With this, there is a need to standardize communication between all players in the healthcare ecosystem (hospital, insurances, etc.). The [FHIR](https://www.hl7.org/fhir/index.html) protocol, developed by HL7, has the goal to achieve that. To build UI5 applications based on a FHIR endpoint, there is a need to provide a UI5 library who enables FHIR for UI5. The [OpenUI5-FHIR](https://github.com/SAP/openui5-fhir) project provides the *sap.fhir* UI5 library, which fills this gap. Currently, this library provides the UI5 FHIR Model which handles the communication with a FHIR endpoint by a central instance, like the ODataModel does it for OData services. The UI5 FHIR Model enables teams to implement fast and full scope UI5 applications based on a FHIR endpoint. In future, the *OpenUI5-FHIR* project might be enhanced by further FHIR specific UI5 artefacts.

The complete documentation can be viewed in our [Documentation](https://sap.github.io/openui5-fhir/).

## History

OpenUI5 provides models out of the box, which can be fragmented in client or server-side [models](https://openui5.hana.ondemand.com/#/topic/e1b625940c104b558e52f47afe5ddb4f).
- Client-side models: JSON, XML and Resource
- Server-side models: OData V2, OData V4

Inside the healthcare community there are a few specifications for clinical/medical data. [FHIR](https://www.hl7.org/fhir/) is one of them. Furthermore FHIR provides a query language to access and modify the data.

To develop OpenUI5 applications based on FHIR endpoints, there is a need to provide an easy to use way to bind the UI to an model which takes care of creating, reading, updating and deleting the corresponding data in the FHIR endpoint. This is the reason for the brand new UI5 FHIR Model, which is included in the *OpenUI5-FHIR* project.

## Features

The *OpenUI5-FHIR* project provides following UI5 artefacts:
- **UI5 FHIR Model**: The FHIR specific UI5 model implementation to bind UI5 controls to content which is provided by a FHIR endpoint. The model takes care of requesting, creating, updating and removing FHIR resources. The application developer doesn't have to care about which requests have to be sent to the FHIR endpoint at which point in time. The UI5 FHIR Model does the job!

## Requirements

The *OpenUI5-FHIR* project is completely integrated into the world of UI5. That means applications built with the *OpenUI5-FHIR* libary can be consumed in any modern browser.

The underlaying FHIR endpoint has to full following requirements:
- Provide the FHIR data as JSON

## Usage

The *OpenUI5-FHIR* project is published at npm.

*TODO: add here guide how to include project/library

## Known Issues

The list of current issues is available [here](https://github.com/SAP/openui5-fhir/issues)

## Support

Do you've any questions? Don't hesitate to raise a [new issue](https://github.com/SAP/openui5-fhir/issues/new/choose).

## Contributing

The idea of the *OpenUI5-FHIR* project is ab initio to be driven by the community of healthcare players and enthusiastic individuals.

Please read [this document](CONTRIBUTING.md) to read more about your options:

- [Report Bugs](CONTRIBUTING.md#report-an-issue) as GitHub issues
- [Analyze Bugs](CONTRIBUTING.md#analyze-issues)
- [Contribute Code](CONTRIBUTING.md#contribute-code) (fixes and features)

## License

Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved.

This project is licensed under the Apache Software License, v.2 except as noted otherwise in the [LICENSE file](LICENSE.txt).

## References

[OpenUI5-FHIR Documentation](https://sap.github.io/openui5-fhir/)

[OpenUI5 Documentation](https://openui5.hana.ondemand.com/)

[FHIR Documentation](https://www.hl7.org/fhir/index.html)