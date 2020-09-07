const Path = require('path');

const srcPath = Path.join(process.cwd(), 'src', 'sap', 'fhir', 'model', 'r4');
const srcFileNames = ['FHIRListBinding.js', 'FHIRTreeBinding.js', 'FHIRModel.js', 'FHIRContextBinding.js', 'FHIRPropertyBinding.js', 'OperationMode.js', 'SubmitMode.js', 'lib/RequestHandle.js', 'Context.js'];
const srcFiles = srcFileNames.map(name => Path.join(srcPath, name));

module.exports = {
  plugins: ["plugins/markdown"],
  source: {
    includePattern: ".+\.(md|js(doc|x))?$",
    include: srcFiles
  },
  opts: {
    tutorials: "./docs/tutorials",
    template: "./lib/jsdoc/plugin",
    destination: "./generated_docs/html",
    readme: "./docs/Home.md",
    sample: "https://github.com/SAP-samples/openui5-fhir-sample-app"
  },
  templates: {
    default: {
      staticFiles: {
        include: ["./docs/staticImages"]
      },
      useLongnameInNav: false,
      showInheritedInNav: false
    }
  }
};
