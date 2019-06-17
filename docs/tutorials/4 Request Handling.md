FHIR® provides two different kinds of requests. Resources can either be created, read, updated and deleted with a direct HTTP call, or one or more requests can be packed in bundles. The following chapter explains the configuration of request handling.
> Hint: For UI5 applications based on a FHIR® server, the recommendation is to use bundle requests to reduce the number of requests and to avoid potentially patient-specific data in the URL. Nevertheless, there might be use cases where the application developer will use direct HTTP requests,for example, when the FHIR® server cannot process bundle requests.

### Step 4.1: Direct Requests
Out of the box, the *UI5 FHIR Model* requests and submits data as direct requests. This mode lets the URL contain the following syntax: 

```
VERB [base]/[type]/[id] {?_format=[mime-type]}
``` 

* `VERB`: The HTTP verb used for the interaction (GET, POST, PUT, DELETE)
* `base`: The FHIR® server base URL (http://myfhirservice.com/fhir/)
* `type`: The name of a resource type (for example, "Patient")
* `id`: The logical ID of a resource
* `mime-type`: The mime-type (JSON or XML)

For more information about the FHIR® RESTful API, see the [FHIR®-Documentation](https://www.hl7.org/fhir/http.html#read).

*Example: Binding a Panel to a Specific Patient and Show a List of All Patients Below*
```xml
<Panel id="myPatient" binding="{/Patient/XYZ}">
    <Input value="{name/[use=official]/family}"/>
    <Input value="{name/[use=official]/given}"/>
    <Button text="Save" press="onSavePress"/>
</Panel>
<List items="{/Patient}">
    <StandardListItem title="{name/[use=official]/family}, {name/[use=official]/given}"/>
</List>
```

<table>
  <tr valign="top">
    <td>With this UI, the model detects one FHIRContextBinding and one FHIRListBinding. Both are requesting their needed data in a separate HTTP call. The first call is `http://myfhirservice.com/fhir/Patient/XYZ`, the second call is `http://myfhirservice.com/fhir/Patient`.
    Direct requests support all functionalities of the FHIR® RESTful API. When you use this type of request, every binding triggers individual requests. So, the number of requests depends on how many bindings are declared on an UI. </br> </br>
    Now, a user can change the name of a single patient and save all changes by pressing the save button. This is possible by executing the `submitChanges` method of the model:
    </td>
    <td><img src="images/Tutorial_Step_4/request_sample_direct.PNG" class="side_picture"/></td>
  </tr>
</table>

```javascript
onSavePress: function(){
    this.getView().getModel().submitChanges();
}
```

### Step 4.2: Bundle Requests
<table>
  <tr valign="top">
    <td>
FHIR® bundle requests have some advantages over direct requests. The number of requests between the UI and the FHIR® server can be reduced to a minimum, and the requested URL only contains the service base URL. FHIR® provides two different types of bundle requests (`batch` and `transaction`). Both types submit a set of one or more actions via an HTTP request to the FHIR® server, which performs the different actions either independently as a batch or as a single atomic transaction. This implicates that if one or more actions fail, the other actions will be performed anyway (`batch`) or all other actions will not be performed at all (`transaction`).
 For more information about FHIR® bundle requests, see the [FHIR®-Documentation](https://www.hl7.org/fhir/http.html#transaction).
 </td>
    <td><img src="images/Tutorial_Step_4/request_sample_bundle.PNG" class="side_picture"/></td>
 </tr>
</table>

#### Step 4.2.1: Declaration of Groups
Depending on the use case, every binding can be configured to use either `batch` or `transaction`. This can be done by introducing binding groups. Application developers decide which binding groups are necessary for a particular UI5 application and which request type should be used for these groups before assigning these groups to the associated bindings. With this concept, it’s possible to reduce the number of HTTP requests to an appropriate level for the respective UI5 application. The declaration of groups is done in the `manifest.json` of the UI5 application.


*Example: Declaration of two groups A and B. All bindings of group A should be processed with a batch request, all bindings of group B should be processed with a transaction request.*
```json
"models": {
    "": {
        "type": "sap.fhir.model.r4.FHIRModel",
        "dataSource": "local",
        "settings": {
            "groupProperties": {
                "A": {
                    "submit": "Batch"
                },
                "B": {
                    "submit": "Transcation"
                }
            }
        }
    }
}
```
<p class="fileName">webapp / manifest.json</p> 

#### Step 4.2.2: Assignment of Groups
To assign a binding to a specific group, you need to add the `groupId` parameter to the binding declaration.

*Example: Binding a Panel to a Specific Patient and Show a List of All Patients Below, Which Should Be Processed in One Group*
```xml
<Panel id="myPatient" binding="{path: '/Patient/XYZ', parameters: {groupId: 'A'}}">
    <Input value="{name/[use=official]/family}"/>
    <Input value="{name/[use=official]/given}"/>
    <Button text="Save" press="onSavePress"/>
</Panel>
<List items="{path: '/Patient', parameters: {groupId: 'A'}}">
    <StandardListItem title="{name/[use=official]/family}, {name/[use=official]/given}"/>
</List>
```

#### Step 4.2.3: Submitting Changes
By introducing of the group concept, you can also control which changes will be send to the FHIR® server by mentioning the `groupId` when submitting the changes. Now, only the changes that are triggered by bindings assigned to group `A` are send to the FHIR® server.

```javascript
onSavePress: function(){
    this.getView().getModel().submitChanges("A");
}
```

### Step 4.3: Mixed Mode
Furthermore, you can mix the direct and bundle requests in one UI5 application with the group concept. If a binding should send a direct request and not be packed as a bundle request, the desired group has to be configured in `manifest.json` with `Direct` as the value of the `submit` property.

*Example: Declaration of Three Groups That Perform Batch, Transaction, and Direct Requests*
```json
"models": {
    "": {
        "type": "sap.fhir.model.r4.FHIRModel",
        "dataSource": "local",
        "settings": {
            "groupProperties": {
                "A": {
                    "submit": "Batch"
                },
                "B": {
                    "submit": "Transcation"
                },
                "C": {
                    "submit": "Direct"
                }
            }
        }
    }
}
```
With this declaration, all bindings assigned to the group `C` will trigger separate direct requests. Also, the submit of the changes with `this.getView().getModel().submitChanges("C");` will lead to multiple requests. The other bindings assigned to group `A` or `B` still send bundle requests.