Development Conventions and Guidelines
======================================

To keep the *OpenUI5-FHIR* project code readable and maintainable, please follow these rules, even if you find them violated somewhere. Note that this list is not complete.
When a file is consistently not following these rules and adhering to the rules would make the code worse, follow the local style.

### Table of Contents

1.  [General](#general)
1.  [JavaScript Coding Guidelines](#javascript-coding-guidelines)
    *  [Code Formatting](#code-formatting)
    *  [Naming Conventions](#naming-conventions)
    *  [Creating Classes](#creating-classes)
    *  [Documentation (JSDoc)](#documentation-jsdoc)
1.  [Product Standards / Acceptance Criteria](#product-standards--acceptance-criteria)
1.  [File Names and Encoding](#file-names-and-encoding)
1.  [Git Guidelines](#git-guidelines)
    * [Commit Message](#commit-message)
1.  [Tools](#tools)
    *  [JavaScript](#JavaScript)
    *  [XML](#XML)



General
-------

-   Always consider the developers who USE your code! Do not surprise them, but give them what they expect. And make it simple.
-   Use the code style which is described with ESLint rules
-   Use Unix line endings (LF-only)
    -   In Eclipse, this is configured in "Preferences - General - Workspace - New text file line delimiter"
-   Text files must be UTF-8 encoded, only `*.properties` files must be ISO8859-1 encoded (as defined in the corresponding standard)
    -   This is at least the current state, which does cause some issues, so a change is not ruled out
    -   In Eclipse, this is configured in "Preferences - General - Workspace - Text File Encoding"
-   There is *no* 80-character line length guideline
-   Use comments. Don't rephrase the code, but tell the reader what is NOT in the code. Describe why your code does what it does. Prefer line comments.

JavaScript Coding Guidelines
----------------------------

-   No global JavaScript variables; Use AMD modules for encapsulation. For more information, see [Best Practices for Loading Modules](https://openui5.hana.ondemand.com/#/topic/00737d6c1b864dc3ab72ef56611491c4.html) and [API Reference: `sap.ui.define`](https://openui5.hana.ondemand.com/#/api/sap.ui/methods/sap.ui.define).
    -   This also means: no undeclared variables
    -   When using global variables introduced by other libraries, declare the usage in a special "global"-comment: `/*global JSZip, OpenAjax */`
-   Do not access internal (private) members of other objects
-   Use variable naming conventions like in the other files you are seeing (e.g. hungarian notation)
-   No `console.log` statements, use `sap/base/Log` which comes with the `sap.ui.core` UI5 library
-   Use `jQuery(window.document.getElementById("<someId>")` instead of `jQuery("#<someId>")` when &lt;someId&gt; is not a known string - certain characters in IDs need to be escaped for jQuery to work correctly
-   Keep modifications of jQuery and other embedded Open Source to a minimum and document them clearly with the term "SAP modification"
    -   Such modifications may not alter the standard behavior of the used library in a way that breaks other libraries

### Code Formatting
See [OpenUI5 - Code Formatting](https://github.com/SAP/openui5/blob/master/docs/guidelines.md#code-formatting).

### Naming Conventions
See [OpenUI5 - Naming Conventions](https://github.com/SAP/openui5/blob/master/docs/guidelines.md#naming-conventions)

### Creating Classes
See [OpenUI5 - Creating Classes](https://github.com/SAP/openui5/blob/master/docs/guidelines.md#creating-classes)

### Documentation (JSDoc)
See [OpenUI5 - Documentation (JSDoc)](https://github.com/SAP/openui5/blob/master/docs/guidelines.md#documentation-jsdoc)


UI5 Control Development Guidelines
----------------------------------

See [OpenUI5 - UI5 Control Development Guidelines](https://github.com/SAP/openui5/blob/master/docs/guidelines.md#ui5-control-development-guidelines).



Product Standards / Acceptance Criteria
---------------------------------------
See [OpenUI5 - Product Standards / Acceptance Criteria](https://github.com/SAP/openui5/blob/master/docs/guidelines.md#product-standards--acceptance-criteria). 


# Git Guidelines
--------------

## Settings
Set the Git `core.autocrlf` configuration property to "false" (and make sure to use Unix-style linebreaks (LF-only))

## Commit Message
The format of the commit messages has to follow the [Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

Tools
-----

The *OpenUI5-FHIR* project has already some rules defined to ensure high style quality for JavaScript and XML files. Adhering to these rules is mandatory.

### JavaScript
The configured [ESLint](http://eslint.org/) rules can be found [here]().
There are a few `npm` commands defined to check the style of your code base:
- `npm run lint`: BlaBlaBla
- `npm run lint:watch:fix`: BlaBlaBla

### XML
All XML files should be stored with the same formatting. The `npm` command `npm run format:xml` will do the job for you.