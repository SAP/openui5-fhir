In UI5, four different types of bindings can be consumed by controls. To learn more about the general concept of binding in UI5, see [UI5 Binding](https://openui5.hana.ondemand.com/#/topic/e5310932a71f42daa41f3a6143efca9c). The *UI5 FHIR Model* provides a corresponding FHIR® implementation for each of these UI5 bindings. The following sections explain these bindings by using examples. 
> Hint: In this section, binding paths with simple strings, for example, `binding="/Patient/123"`. But you can also use the new binding syntax, which allows additional configurations, for example, `binding="{path: '/Patient/123'}"`.

### Step 2.1: FHIRContextBinding
Context binding allows you to bind elements to a specific object in the model data. Binding elements to objects creates a binding context and enables relative binding within the control and all of its children. Using the `binding` property of a UI5 control is the simplest way of binding a context to a control.

*Example: Binding a Page to a Patient with the ID 123* 
```xml
<Page id="myPage" binding="{/Patient/123}">
```
In some scenarios, user input is needed to decide to which entity the control should be bound. So, you can use the `bindElement` function of a UI5 control.
```javascript
function onInputChange(oEvent){
	var sValue = oEvent.getParameter("value");
	this.byId("myPage").bindElement("/Patient/" + sValue);
}
```
You can also use nested context bindings.

*Example (Veterinary Medicine): Bind a Page to a Patient with the ID 123 and Display Its Animal Data*
```xml
<Page id="myPage" binding="{/Patient/123}">
	<Panel binding="{animal}">
	</Panel>
</Page>
```

### Step 2.2: FHIRPropertyBinding
Property binding allows you to bind a specific property of a control to a specific property in the model data. You can either do this directly in the XML view or in the controller logic.

*Example: Bind a Text Field to the Gender of a Patient*
```xml
<Text id="myText" text="{/Patient/123/gender}">
```
In some scenarios, user input is needed to decide to which entity the control should be bound. So, you can use the `bindElement` function of a UI5 control.
```javascript
function onInputChange(oEvent){
	var sValue = oEvent.getParameter("value");
	this.byId("myText").bindProperty("text", "/Patient/" + sValue + "/gender");
}
```
For some properties, UI5 provides wrapper methods to reduce the number characters. The `bindText` method is provided for `sap.m.Text`:
```javascript
function onInputChange(oEvent){
	var sValue = oEvent.getParameter("value");
	this.byId("myText").bindText("/Patient/" + sValue + "/gender");
}
```

The section above explains how to use context binding. You can now combine context binding and property binding by using a relative binding path for the property binding.
```xml
<Page id="myPage" binding="{/Patient/123}">
	<Text text="{gender}" />
	<Text text="{birthDate}" />
</Page>
```
### Step 2.3: FHIRListBinding
List binding allows you to create child controls according to model data automatically. You can either do this directly in the XML view or in the controller logic.

*Example: Bind a List to All Patients in Your Clinical System and Show Their Gender and Birthdate*
```xml
<List id="myList" items="{/Patient}">
	<StandardListItem title="{gender} "description="{birthdate}"/> 
</List>
```
In some scenarios, user input is needed to decide to which aggregation the control should be bound. So, you can use the `bindAggregation` function of a UI5 control.
```javascript
function onInputChange(oEvent){
	var sValue = oEvent.getParameter("value");
	this.byId("myList").bindAggregation("items", "/" + sValue);
}
```
For some aggregations, UI5 provides wrapper methods to reduce the number characters. The `bindItems` method is provided for `sap.m.List`:
```javascript
function onInputChange(oEvent){
	var sValue = oEvent.getParameter("value");
	this.byId("myList").bindItems("/" + sValue);
}
```
You can also combine context binding and list binding. 

*Example: Bind a List to the Contacts of a Specific Patient*
```xml
<List id="myList" binding="{/Patient/123}" items="{contact}">
	<StandardListItem title="{name/0/given}"/>
</List>
```

You can also use nested list bindings.

*Example: Bind a List to All Patients and Show All Their Contacts.*
```xml
<List id="myList" items="{/Patient}">
	<CustomListItem title="{name/0/given}"/>
		<List items="{contact}">
			<StandardListItem title="{name/0/given}">
		</List>
	</CustomListItem>
</List>
```

### Step 2.4: FHIRTreeBinding
Tree Binding allows you to create child controls grouped by their ancestor relationship according to model data automatically. You can either do this directly in the XML view or in the controller logic. Currenlty, there are two UI5 controls that support tree binding: [sap.ui.table.TreeTable](https://openui5.hana.ondemand.com/#/api/sap.ui.table.TreeTable) and [sap.m.Tree](https://openui5.hana.ondemand.com/#/api/sap.m.Tree). FHIRTreeBinding connects FHIR® data structures to these UI5 controls. Because FHIR® does not process tree data as tree-structured data, the FHIRModel creates an internal tree structure by using model properties. This section shows you how to set up FHIRTreeBinding.

*Example: Bind a sap.m.Tree to a Tree of Organizations and Display the Name of the Organization* 
```xml
<Tree id="tree" items="{path: '/Organization', parameters: {rootSearch: 'partOf', rootProperty: 'id', rootValue: '1001', nodeProperty: 'id'}}">
	<StandardTreeItem title="{name}" />
</Tree>
```
The example above shows four parameters that are necessary to configure the transformation of FHIR® data to tree-structured data:
* **rootSearch**: This parameter determines the FHIR® search parameter on which the relationship to the parent element is configured, so it can be enriched with a modifier such as `:exact` or `:missing`.  
* **rootProperty**: This parameter represents the property of the FHIR® resource that points to the configured FHIR® search parameter.
* **rootValue**: This parameter defines the value of the *rootProperty* parameter.
* **nodeProperty**: This parameter represents the identifiable property of the FHIR® resource.

*Example: Bind a sap.m.Tree to a Tree of Structure Definitions and Display the Name of the Structure Definitions*
```xml
<Tree id="tree" items="{path: '/StructureDefinition', parameters: {rootSearch: 'base:exact', rootProperty: 'baseDefinition', rootValue: 'http://hl7.org/fhir/StructureDefinition/DomainResource', nodeProperty: 'url'}}">
	<StandardTreeItem title="{name}" />
</Tree>
```
