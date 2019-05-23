// This file declares globals in order to avoid unnecessary 'compiler' warnings
// in VSCode. At not time will this file be used by the runtime (browser, ...).
// It should also not be shipped.

// Global sap-instance - for now the type of `sap` is simply set to `any`. However,
// in a next step we could set it's type to a custom interface that declares it's
// capabilities in order to get better type checking - for example:
//
//    interface SAP { 
//        define(dependencies: string[], code: any); 
//    }
// 

var sap: any = {};
