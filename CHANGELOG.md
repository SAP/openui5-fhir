## [2.0.5](https://github.com/SAP/openui5-fhir/compare/v2.0.4...v2.0.5) (2021-03-10)


### Bug Fixes

* single filter or sorter object ([#237](https://github.com/SAP/openui5-fhir/issues/237)) ([552f2fc](https://github.com/SAP/openui5-fhir/commit/552f2fcb04314705f4ac8aa81f2b0c35714fe87d))

## [2.0.4](https://github.com/SAP/openui5-fhir/compare/v2.0.3...v2.0.4) (2020-11-26)


### Bug Fixes

* forceful update of server state variable in handleClient changes for multiple reset changes scenario ([#201](https://github.com/SAP/openui5-fhir/issues/201)) ([efcafbd](https://github.com/SAP/openui5-fhir/commit/efcafbd5f94af28da7cf6c6464fcd19b7095ee53))

## [2.0.3](https://github.com/SAP/openui5-fhir/compare/v2.0.2...v2.0.3) (2020-11-17)


### Bug Fixes

* restore csrf token handling ([#108](https://github.com/SAP/openui5-fhir/issues/108)) ([5c0ed46](https://github.com/SAP/openui5-fhir/commit/5c0ed46e377f390e2575a8c661189549a14bab6a))

## [2.0.2](https://github.com/SAP/openui5-fhir/compare/v2.0.1...v2.0.2) (2020-11-05)


### Bug Fixes

* Valueset calls without expand option ([#193](https://github.com/SAP/openui5-fhir/issues/193)) ([0c5ebb5](https://github.com/SAP/openui5-fhir/commit/0c5ebb581a13728ec18d16a7258d1e600e7df844))

## [2.0.1](https://github.com/SAP/openui5-fhir/compare/v2.0.0...v2.0.1) (2020-10-15)


### Bug Fixes

* dont trigger request failed for aborted requests ([#186](https://github.com/SAP/openui5-fhir/issues/186)) ([05286bb](https://github.com/SAP/openui5-fhir/commit/05286bbb2b7d1ee8ac311019c3821259dc022520)), closes [/github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/model/odata/ODataModel.js#L869](https://github.com//github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/model/odata/ODataModel.js/issues/L869)

# [2.0.0](https://github.com/SAP/openui5-fhir/compare/v1.1.7...v2.0.0) (2020-09-07)


### Features

* handle bundle response more comfortable ([#176](https://github.com/SAP/openui5-fhir/issues/176)) ([518a1f0](https://github.com/SAP/openui5-fhir/commit/518a1f06ba13df6541855b910f3e182665aa5c4e))


### BREAKING CHANGES

* callback parameters of `FHIRModel.submitChanges` get enhanced in case of bundle requests. See https://sap.github.io/openui5-fhir/tutorial-4%20Request%20Handling.html.

## [1.1.7](https://github.com/SAP/openui5-fhir/compare/v1.1.6...v1.1.7) (2020-09-04)


### Bug Fixes

* pending request handle ([#173](https://github.com/SAP/openui5-fhir/issues/173)) ([b463e13](https://github.com/SAP/openui5-fhir/commit/b463e1313569eccf23f7e32a8ad0d5a278b2b440))

## [1.1.6](https://github.com/SAP/openui5-fhir/compare/v1.1.5...v1.1.6) (2020-08-04)


### Bug Fixes

* **sap.fhir.model.r4.FHIRListBinding.js:** array index error while accessing structure definition url when no structure definition is maintained in a resource instance ([#155](https://github.com/SAP/openui5-fhir/issues/155)) ([0f4459c](https://github.com/SAP/openui5-fhir/commit/0f4459c292454671850479c72a53ec67d306dbc0))

## [1.1.5](https://github.com/SAP/openui5-fhir/compare/v1.1.4...v1.1.5) (2020-07-29)


### Bug Fixes

* handling changed resources when the server state and the client state is the same ([#154](https://github.com/SAP/openui5-fhir/issues/154)) ([f84d8a4](https://github.com/SAP/openui5-fhir/commit/f84d8a4849aded50ed51bd780a59a851cc00dc95))

## [1.1.4](https://github.com/SAP/openui5-fhir/compare/v1.1.3...v1.1.4) (2020-07-27)


### Bug Fixes

* set the etag in the correct format ([#149](https://github.com/SAP/openui5-fhir/issues/149)) ([27b5239](https://github.com/SAP/openui5-fhir/commit/27b523967a2460284257a0a1d5daf09d7bae3599))

## [1.1.3](https://github.com/SAP/openui5-fhir/compare/v1.1.2...v1.1.3) (2020-07-13)


### Bug Fixes

* in case the resource id is not present  ([#146](https://github.com/SAP/openui5-fhir/issues/146)) ([0397ba9](https://github.com/SAP/openui5-fhir/commit/0397ba997e9b327bbe5bc79c8e52af85643dce0b))

## [1.1.2](https://github.com/SAP/openui5-fhir/compare/v1.1.1...v1.1.2) (2020-06-24)


### Bug Fixes

* set the default query params based on configuration ([#142](https://github.com/SAP/openui5-fhir/issues/142)) ([08c9bea](https://github.com/SAP/openui5-fhir/commit/08c9bea8150d570f4455808f62595c5b8dad0943))

## [1.1.1](https://github.com/SAP/openui5-fhir/compare/v1.1.0...v1.1.1) (2020-06-24)


### Bug Fixes

* in case the location header has slash at the beginning ([#143](https://github.com/SAP/openui5-fhir/issues/143)) ([e5ab233](https://github.com/SAP/openui5-fhir/commit/e5ab233a1536fca27448e3aac05de58f6358df71))

# [1.1.0](https://github.com/SAP/openui5-fhir/compare/v1.0.5...v1.1.0) (2020-06-17)


### Features

* Implement the fullurl for bundle entries ([#135](https://github.com/SAP/openui5-fhir/issues/135)) ([ba7acbe](https://github.com/SAP/openui5-fhir/commit/ba7acbe3acb6c56722bc60bcdf9cb6440b98aaf7))

## [1.0.5](https://github.com/SAP/openui5-fhir/compare/v1.0.4...v1.0.5) (2020-03-27)


### Bug Fixes

* upgrade UI5 version from 1.70.0 to 1.75.0 ([#109](https://github.com/SAP/openui5-fhir/issues/109)) ([fb19439](https://github.com/SAP/openui5-fhir/commit/fb19439a2af9ab044b09d462ee3690c3a31b759c))

## [1.0.4](https://github.com/SAP/openui5-fhir/compare/v1.0.3...v1.0.4) (2019-08-26)


### Bug Fixes

* total binding issue by binding initialization ([#53](https://github.com/SAP/openui5-fhir/issues/53)) ([75a41f3](https://github.com/SAP/openui5-fhir/commit/75a41f3))

## [1.0.3](https://github.com/SAP/openui5-fhir/compare/v1.0.2...v1.0.3) (2019-07-24)


### Bug Fixes

* **FHIRListBinding:** enable dynamic valueset binding to valueset containing codeable concept ([29c2697](https://github.com/SAP/openui5-fhir/commit/29c2697))

## [1.0.2](https://github.com/SAP/openui5-fhir/compare/v1.0.1...v1.0.2) (2019-07-09)


### Bug Fixes

* enable self-contained bundling of consuming apps ([d33efdd](https://github.com/SAP/openui5-fhir/commit/d33efdd))

## [1.0.1](https://github.com/SAP/openui5-fhir/compare/v1.0.0...v1.0.1) (2019-07-09)


### Bug Fixes

* enable code uglifying by consuming apps ([5ad61e1](https://github.com/SAP/openui5-fhir/commit/5ad61e1))

# 1.0.0 (2019-07-03)


### Bug Fixes

* provide UI5 specific configs and refactor tests ([5f12072](https://github.com/SAP/openui5-fhir/commit/5f12072))


### Features

* add sources, tests and pipeline ([8980ade](https://github.com/SAP/openui5-fhir/commit/8980ade))
* upgrade UI5 version to 1.66.1 ([32061a8](https://github.com/SAP/openui5-fhir/commit/32061a8))
