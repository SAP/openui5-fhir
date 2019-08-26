# Contributing

The idea of the *OpenUI5-FHIR* project is ab initio to be driven by the community of healthcare players and enthusiastic individuals.

Please read [this document](CONTRIBUTING.md) to read more about your options:
 * [Report an Issue](report-an-issue) as GitHub issues
 * [Analyze Issues](#analyze-issues) to get the root cause of an issue
 * [Contribute Code](#contribute-code) fixes and features
 * [Development](#development) setup

## Report an Issue

If you find a bug - behavior of the *OpenUI5-FHIR* project contradicting its specification - you are welcome to report it.
We can only handle well-reported, actual bugs, so please follow the guidelines below.

Once you have familiarized with the guidelines, you can go to the [Github issue tracker](https://github.com/SAP/openui5-fhir/issues/new) to report the issue.

### Quick Checklist for Bug Reports

Issue report checklist:
 * Real, current bug
 * No duplicate
 * Reproducible
 * Good summary
 * Well-documented
 * Minimal example
 * Use the [template](.github/ISSUE_TEMPLATE/bug_report.md)

### Requirements for a bug report

These eight requirements are the mandatory base of a good bug report:
1. **Only real bugs**: please do your best to make sure to only report real bugs! Do not report:
    * issues caused by application code or any code outside the *OpenUI5-FHIR* project.
    * something that behaves just different from what you expected. A bug is when something behaves different than specified. When in doubt, raice in a forum.
    * something you do not get to work properly. Use a support forum like Stack Overflow to request help.
    * feature requests. Well, this is arguable: critical or easy-to-do enhancement suggestions are welcome, but we do not want to use the issue tracker as wishlist.
2. No duplicate: you have searched the issue tracker to make sure the bug has not yet been reported
3. Good summary: the summary should be specific to the issue
4. Current bug: the bug can be reproduced in the most current version (state the tested version!)
5. Reproducible bug: there are clear steps to reproduce given. This includes, where possible:
    * a URL to access the example
    * any required user/password information (do not reveal any credentials that could be mis-used!)
    * detailed and complete step-by-step instructions to reproduce the bug
6. Precise description:
    * precisely state the expected and the actual behavior
    * give information about the used browser/device and its version, if possible also the behavior in other browsers/devices
    * if the bug is about wrong UI appearance, attach a screenshot and mark what is wrong
    * generally give as much additional information as possible. (But find the right balance: do not invest hours for a very obvious and easy to solve issue. When in doubt, give more information.)
7. Only one bug per report: open different tickets for different issues

You are encouraged to use [this template](.github/ISSUE_TEMPLATE/bug_report.md).

Please report bugs in English, so all users can understand them.

If the bug appears to be a regression introduced in a new version of the *OpenUI5-FHIR* project, try to find the closest versions between which it was introduced.

### Issue handling process

When an issue is reported, a committer will look at it and either confirm it as a real issue (by giving the "approved" label), close it if it is not an issue, or ask for more details. Approved issues are then either assigned to a committer in GitHub, reported in our internal issue handling system, or left open as "contribution welcome" for easy or not urgent fixes.

An issue that is about a real bug is closed as soon as the fix is committed. The closing comment explains which patch version(s) will contain the fix.

<!--
### Reporting Security Issues

If you find a security issue, please act responsibly and report it not in the public issue tracker, but directly to us, so we can fix it before it can be exploited:
* SAP Customers: if the found security issue is not covered by a published security note, please report it by creating a customer message at https://service.sap.com/message.
 * Researchers/non-Customers: please send the related information to secure@sap.com using [PGP for e-mail encryption](http://global.sap.com/pc/security/keyblock.txt).
Also refer to the general [SAP security information page](https://www.sap.com/corporate/en/company/security.html).
-->

### Usage of Labels

Github offers labels to categorize issues. We defined the following labels so far:

Labels for issue categories:
 * bug: this issue is a bug in the code
 * documentation: this issue is about wrong documentation
 * enhancement: this is not a bug report, but an enhancement request

Status of open issues:
 * unconfirmed: this report needs confirmation whether it is really a bug (no label; this is the default status)
 * approved: this issue is confirmed to be a bug
 * author action: the author is required to provide information
 * contribution welcome: this fix/enhancement is approved and you are invited to contribute it

Status/resolution of closed issues:
 * fixed: a fix for the issue was provided
 * duplicate: the issue is also reported in a different ticket and is handled there
 * invalid: for some reason or another this issue report will not be handled further (maybe lack of information or issue does not apply anymore)
 * works: not reproducible or working as expected
 * wontfix: while acknowledged to be an issue, a fix cannot or will not be provided

The labels can only be set and modified by committers.

### Issue Reporting Disclaimer

We want to improve the quality of the *OpenUI5-FHIR* project and good bug reports are welcome! But our capacity is limited, so we cannot handle questions or consultation requests and we cannot afford to ask for required details. So we reserve the right to close or to not process insufficient bug reports in favor of those which are very cleanly documented and easy to reproduce. Even though we would like to solve each well-documented issue, there is always the chance that it won't happen - remember: The *OpenUI5-FHIR* project is Open Source and comes without warranty.

## Analyze Issues

Analyzing issue reports can be a lot of effort. Any help is welcome! Go to [the Github issue tracker](https://github.com/SAP/openui5-fhir/issues?state=open) and find an open issue which needs additional work or a bugfix.

Additional work may be further information or it might be a hint that helps understanding the issue. Maybe you can even find and [contribute](#contribute-code) a bugfix?

## Contribute Code

You are welcome to contribute code in order to fix bugs or to implement new features.

There are three important things to know:

1. You must be aware of the Apache License (which describes contributions) and **agree to the Contributors License Agreement**. This is common practice in all major Open Source projects. To make this process as simple as possible, we are using *[CLA assistant](https://cla-assistant.io/)* for individual contributions. CLA assistant is an open source tool that integrates with GitHub very well and enables a one-click-experience for accepting the CLA. For company contributors special rules apply. See the respective section below for details.
2. There are **several requirements regarding code style, quality, and product standards** which need to be met (we also have to follow them). The respective section below gives more details on the coding guidelines.
3. **Not all proposed contributions can be accepted**. Some features may e.g. just fit a third-party add-on better. The code must fit the overall direction of the *OpenUI5-FHIR* project and really improve it, so there should be some "bang for the byte". For most bug fixes this is a given, but major feature implementation first need to be discussed with one of the *OpenUI5-FHIR* committers (Top 20 committers: [Contributors List](https://github.com/SAP/openui5-fhir/graphs/contributors)), possibly one who touched the related code recently. The more effort you invest, the better you should clarify in advance whether the contribution fits: the best way would be to just open an enhancement ticket in the issue tracker to discuss the feature you plan to implement (make it clear you intend to contribute). We will then forward the proposal to the respective code owner, this avoids disappointment.
4. New features should be minimally tested and test cases should be included in the code contribution. If the feature cannot be easily tested with automatic tests at least one core contributor should manually test the feature before merging the contribution.

### Contributor License Agreement

When you contribute (code, documentation, or anything else), you have to be aware that your contribution is covered by the same [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0) that is applied to the *OpenUI5-FHIR* project itself.
In particular you need to agree to the Individual Contributor License Agreement,
which can be [found here](https://gist.github.com/CLAassistant/bd1ea8ec8aa0357414e8).

(This applies to all contributors, including those contributing on behalf of a company). If you agree to its content, you simply have to click on the link posted by the CLA assistant as a comment to the pull request. Click it to check the CLA, then accept it on the following screen if you agree to it. CLA assistant will save this decision for upcoming contributions and will notify you if there is any change to the CLA in the meantime.

#### Company Contributors

If employees of a company contribute code, in **addition** to the individual agreement above, there needs to be one company agreement submitted. This is mainly for the protection of the contributing employees.

A company representative authorized to do so needs to download, fill, and print
the [Corporate Contributor License Agreement](docs/pdfs/SAP%20Corporate%20Contributor%20License%20Agreement.pdf) form. Then either:

- Scan it and e-mail it to [opensource@sap.com](mailto:opensource@sap.com) and [florian.vogt@sap.com](mailto:florian.vogt@sap.com)
- Fax it to: +49 6227 78-45813
- Send it by traditional letter to: *Industry Standards & Open Source Team, Dietmar-Hopp-Allee 16, 69190 Walldorf, Germany*

The form contains a list of employees who are authorized to contribute on behalf of your company. When this list changes, please let us know.

### Contribution Content Guidelines

Contributed content can be accepted if it:

1. is useful to improve the *OpenUI5-FHIR* project (explained above)
2. follows the applicable guidelines and standards

The second requirement could be described in entire books and would still lack a 100%-clear definition, so you will get a committer's feedback if something is not right. Extensive conventions and guidelines documentation is [available here](docs/guidelines.md).

These are some of the most important rules to give you an initial impression:

- ✅ Apply a clean coding style adapted to the surrounding code, even though we are aware the existing code is not fully clean
- ✅ Use the npm command `npm run lint:watch:fix` to auto fix the style of JavaScript files
- ✅ Use the npm command `npm run format:xml` to beautify xml files
- ✅ Use variable naming conventions like in the other files you are seeing (e.g. hungarian notation)
- ✅ Only access public APIs of other entities (there are exceptions, but this is the rule)
- ✅ Write unit test and integration tests
- ✅ Comment your code where it gets non-trivial
- ✅ Comment your functions and classes with [JSDoc](http://usejsdoc.org)-syntax
- ✅ Have a look on [CODE CLIMATE](https://codeclimate.com/github/SAP/openui5-fhir)
- ⛔️ No `console.log` statements, use `sap/base/Log` which comes with the `sap.ui.core` UI5 library
- ⚠️ Keep an eye on performance and memory consumption
- ⚠️ Do not do any incompatible changes, especially do not modify the name or behavior of public API methods or properties
- ⚠️ Always consider the developer who USES your code!
    - Think about what code and how much code she/he will need to write to use your feature
    - Think about what she/he expects your feature to do

If this list sounds lengthy and hard to achieve - well, that's what WE have to comply with as well, and it's by far not complete…

#### Code Climate

To ensure high quaility and maintainability this repository is configured on [CODE CLIMATE](https://codeclimate.com/github/SAP/openui5-fhir).

Current status:
[![Code Climate](https://codeclimate.com/github/SAP/openui5-fhir/badges/gpa.svg)](https://codeclimate.com/github/SAP/openui5-fhir)

The goal of high quality and maintainability is an ongoing task which has to be considered while the whole development cycle. Feel free to dive into the code smells! The team is looking forward to get a pull request from you which increases the maintainability🤗. 

#### Dependabot

To ensure to use the latest patches and features of packages which are used in the project, [Dependabot](https://dependabot.com/) is configured. *Dependabot* will open a new pull request if a new version of an used packaged is published. You can view and edit the *Dependabot* settings for *OpenUI5-FHIR* [here](https://app.dependabot.com/accounts/SAP/repos/181670481).

### How to contribute - the Process

1. Make sure the change would be welcome (e.g. a bugfix or a useful feature); best do so by proposing it in a GitHub issue
2. Create a branch forking the *OpenUI5-FHIR* repository and do your change
3. Commit and push your changes on that branch
    - When you have several commits, squash them into one (see [this explanation](http://davidwalsh.name/squash-commits-git)) - this also needs to be done when additional changes are required after the code review

4. In the commit message follow the [commit message guidelines](docs/guidelines.md#git-guidelines)
5. If your change fixes an issue reported at GitHub, add the following line to the commit message:
    - `Fixes https://github.com/SAP/openui5-fhir/issues/(issueNumber)`
    - Do NOT add a colon after "Fixes" - this prevents automatic closing.
	- When your pull request number is known (e.g. because you enhance a pull request after a code review), you can also add the line `Closes https://github.com/SAP/openui5-fhir/pull/(pullRequestNumber)`
6. Create a Pull Request to https://github.com/SAP/openui5-fhir
7. Follow the link posted by the CLA assistant to your pull request and accept it, as described in detail above.
8. Wait for our code review and approval, possibly enhancing your change on request
    - Note that the *OpenUI5-FHIR* project developers also have their regular duties, so depending on the required effort for reviewing, testing and clarification this may take a while

9. Once the change has been approved we will inform you in a comment
10. Your pull request will be merged into master by one of the *OpenUI5-FHIR* project committers.
11. We will close the pull request, feel free to delete the now obsolete branch

## Development
This section describes the system setup which makes your developer life easier.

### Prerequisites
1. Install the latest [nodejs](https://nodejs.org/en/) version
2. Install docker
    - Windwos: https://docs.docker.com/docker-for-windows/install/
    - Mac: https://docs.docker.com/docker-for-mac/install/
    - Linux: https://runnable.com/docker/install-docker-on-linux
3. Install [Maven](https://maven.apache.org/install.html)
4. Install an IDE (e.g. [VSCode](https://code.visualstudio.com/Download))
5. Install [Git](https://git-scm.com/downloads)
6. Create an account on [GitHub](https://github.com/join?source=header-home)

### Deployment of *sap-fhir-test-app*-project
The following section describes how the *OpenUI5-FHIR* project internal test application can be deployed and which development tasks can be executed.

1. Go to the [latest release](https://github.com/SAP/openui5-fhir/releases/latest) and download the latest release *.zip*.
2. Extract the *.zip* in your desired local location
3. Go to the folder which contains the *OpenUI5-FHIR*-folder
4. Open the console (windows: CMD, linux/mac: terminal)
5. Enter `npm install`
6. Enter `npm run serve`. This script starts the mockserver and hosts all needed UI5 resources
7. *Optional*: If the mockserver is already startet, you can use `npm run serve:ui5` to only host the UI5 resources
8. Open your desired browser and open [http://localhost:8081/test-resources/sap-fhir-test-app/webapp/index.html](http://localhost:8081/test-resources/sap-fhir-test-app/webapp/index.html)

### Development Tasks
The following sections describe, how useful development tasks can be executed.

#### Deployment
Developing and debugging can't be easier. Therefore, execute `npm run serve` or if the mockserver is already started `npm run serve:ui5`.

Following entry points are available:
- QUnit tests: [http://localhost:8081/test-resources/qunit/unit.qunit.html](http://localhost:8081/test-resources/qunit/unit.qunit.html)
- OPA5 tests: [http://localhost:8081/test-resources/sap-fhir-test-app/webapp/test/opa5/all.opa5.html](http://localhost:8081/test-resources/sap-fhir-test-app/webapp/test/opa5/all.opa5.html)

#### ESLinting
There are various lint-scripts in `package.json`. During development you will most likely want to use either:

```bash
npm run lint:watch
```

or

```bash
npm run lint:watch:fix
```

The former script simply watches all files for changes and lints them immediately. The result is written to the console. The latter script is also watching all files for changes but applies fixes automatically.

#### Testing

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

#### Documentation

```bash
npm run docs
```

The above command creates the API documentation for thie `openui5-fhir` project locally. All classes, which are considered to be part of the public API are explicitely named in the run-script itself. After execution of this command, open the generated API documentation in your browser on [generated_docs/html/index.html](generated_docs/html/index.html).