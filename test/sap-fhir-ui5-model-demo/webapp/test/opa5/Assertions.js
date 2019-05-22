sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/BindingPath",
	"sap/base/Log"
], function(Opa5, Properties, BindingPath, Log) {
	"use strict";

	var textMatcher = function(oItem) {
		return this === oItem.getText();
	};

	var valueMatcher = function(oItem) {
		return this === oItem.getValue();
	};

	var fnSuccessText = function(oItem) {
		Opa5.assert.ok(true, "The item: " + oItem.getText() + " was found");
	};

	var fnSuccessTitle = function(oItem) {
		Opa5.assert.ok(true, "The item: " + oItem.getTitle() + " was found");
	};

	var fnSuccessValue = function(oItem) {
		Opa5.assert.ok(true, "The item: " + oItem.getValue() + " was found");
	};

	var assertions = new Opa5({

		theGenericTileBindingShouldDeliver  : function(sView, sControlId, mSettings){
			return this.waitFor({
				viewName : sView,
				id: sControlId,
				matchers : new sap.ui.test.matchers.Properties(mSettings),
				success : function(){
					Opa5.assert.ok(true, "The tile content fullfills the expected value");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "Did not find the tile content with value: " + mSettings.value
			});
		},

		theItemShouldAppear : function(sTitle, sView, fnSuccess, sControlName, fnMatcher) {
			return this.waitFor({
				controlType : sControlName || "sap.m.StandardTreeItem",
				viewName : sView,
				matchers : fnMatcher || function(oItem) {
					return sTitle === oItem.getTitle();
				},
				success : function(aItems){
					if (fnSuccess !== undefined){
						fnSuccess(aItems[0]);
					} else {
						fnSuccessTitle(aItems[0]);
					}
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "Did not find the item :" + sTitle
			});
		},

		theMessageShouldAppear : function(sTitle) {
			return this.iSeeMessagePopover(function(aMessagePopover){
				var oMessagepopover = aMessagePopover[0];
				var aMessagepopoverItems = oMessagepopover.getItems();
				var bMessageFound = false;
				for (var i = 0; i < aMessagepopoverItems.length; i++){
					if (aMessagepopoverItems[i].getTitle() === sTitle){
						bMessageFound = true;
						break;
					}
				}
				Opa5.assert.ok(bMessageFound, "The message could be found in the popover");
			});
		},

		theStandardListItemShouldAppear : function(sTitle, sView) {
			return this.theItemShouldAppear(sTitle, sView, fnSuccessTitle, "sap.m.StandardListItem");
		},

		theLabelShouldAppear : function(sTitle, sView) {
			return this.theItemShouldAppear(sTitle, sView, fnSuccessText, "sap.m.Label", textMatcher.bind(sTitle));
		},

		theTitleShouldAppear : function(sTitle, sView) {
			return this.theItemShouldAppear(sTitle, sView, fnSuccessTitle, "sap.m.Title");
		},

		theTextShouldAppear : function(sText, sView) {
			return this.theItemShouldAppear(sText, sView, fnSuccessText, "sap.m.Text", textMatcher.bind(sText));
		},

		theInputShouldAppear : function(sValue, sView) {
			return this.theItemShouldAppear(sValue, sView, fnSuccessValue, "sap.m.Input", valueMatcher.bind(sValue));
		},

		theTreeSizeShouldBe : function(iTreeSize, sView) {
			return this.waitFor({
				controlType : "sap.m.Tree",
				viewName : sView,
				success : function(aItem) {
					Opa5.assert.equal(aItem[0].getBinding("items").getLength(), iTreeSize, "The given tree size does match");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The given tree size :" + iTreeSize + "does not match"
			});
		},

		theTreeTableSizeShouldBe : function(iTreeSize, sView) {
			return this.waitFor({
				controlType : "sap.ui.table.TreeTable",
				viewName : sView,
				success : function(aItem) {
					Opa5.assert.deepEqual(this.findDuplicates(aItem[0].getBinding("rows").aKeys), [], "There are no duplicates in aKeys of the tree binding");
					Opa5.assert.equal(aItem[0].getBinding("rows").getLength(), iTreeSize, "The given tree size does match");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The given treetable size :" + iTreeSize + "does not match"
			});
		},

		findDuplicates : function(data) {
			var aSorted = data.slice().sort();
			var results = [];
			for (var i = 0; i < aSorted.length - 1; i++) {
				if (aSorted[i + 1] === aSorted[i]) {
					results.push(aSorted[i]);
				}
			}
			return results;
		},

		theTableSizeShouldBe : function(iTableSize, sView, sControlId) {
			return this.waitFor({
				id : sControlId,
				viewName : sView,
				success : function(oListBindingItem) {
					Opa5.assert.equal(oListBindingItem.getMaxItemsCount(), iTableSize, "The given table size does match");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The given table size :" + iTableSize + " does not match"
			});
		},

		theTableHeaderShouldBe : function(iTableSize, sView, sControlId) {
			return this.waitFor({
				id : sControlId,
				viewName : sView,
				success : function(oHeader) {
					Opa5.assert.equal(oHeader.getText(), "Patients (" + iTableSize + ")", "The given table size does match");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The given table size :" + iTableSize + " does not match"
			});
		},

		theGrowingInfoShouldBe : function(sView, sControlId, oGrowingInfo) {
			return this.waitFor({
				id : sControlId,
				viewName : sView,
				success : function(oListBindingItem) {
					Opa5.assert.deepEqual(oListBindingItem.getGrowingInfo(), oGrowingInfo, "The given growing info matches");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The given growing info :" + JSON.stringify(oGrowingInfo) + "does not match"
			});
		},

		iWaitUntilAggregationFilled : function(sView, sControlId, fnSuccess) {
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				matchers : new sap.ui.test.matchers.AggregationFilled({name : "items"}),
				success : fnSuccess,
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The control " + sControlId + " in the view " + sView + " items aggregation filled matcher didn't work"
			});
		},

		iGetControlById : function(sView, sControlId, fnSuccess) {
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				success : fnSuccess,
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The control " + sControlId + " in the view " + sView + " wasn't found"
			});
		},

		_iGetControl : function(sControlType, sView, fnSuccess) {
			return this.waitFor({
				controlType : sControlType,
				viewName : sView,
				success : fnSuccess,
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The controltype " + sControlType + " in the view " + sView + " wasn't found"
			});
		},

		iGetList : function(sView, fnSuccess) {
			return this._iGetControl("sap.m.List", sView, fnSuccess);
		},

		iGetStandardListItem : function(sView, fnSuccess) {
			return this._iGetControl("sap.m.StandardListItem", sView, fnSuccess);
		},

		iGetDialog : function(sView, fnSuccess) {
			return this._iGetControl("sap.m.Dialog", sView, fnSuccess);
		},

		iGetSelectDialog : function(sView, fnSuccess) {
			return this._iGetControl("sap.m.SelectDialog", sView, fnSuccess);
		},

		iCheckSizeOfItemAggregation : function(sView, sControlId, iExpectedSize){
			return this.iGetControlById(sView, sControlId, function(oControl){
				Opa5.assert.equal(iExpectedSize, oControl.getBinding("items").getLength(), oControl.sId + " was found and checked correct");
			});
		},

		iCheckContextSizeByItemAggregation : function(sView, sControlId, iExpectedSize){
			return this.iGetControlById(sView, sControlId, function(oControl){
				Opa5.assert.equal(iExpectedSize, oControl.getBinding("items").aKeys.length);
			});
		},

		iCheckTitlePropertyInItemsAggregation : function(sView, sControlId, sExpectedPath){
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				matchers : new sap.ui.test.matchers.AggregationContainsPropertyEqual({aggregationName : "items", propertyName: "title", propertyValue: sExpectedPath}),
				success : function(oControl){
					Opa5.assert.ok(true, "The control: " + sControlId + " was found.");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage: "The control: " + sControlId + " in the view " + sView + " with the item matcher on property title with the value " + sExpectedPath + " could not be found."
			});
		},

		iShouldSeeInput : function(sViewName, sInputId, sValue){
			return this.iShouldSeeControl(sViewName, "sap.m.Input", sInputId, {value: sValue});
		},

		iShouldSeeControl: function(sViewName, sControlType, sControlId, oProperties){
			return this.waitFor({
				viewName: sViewName,
				controlType: sControlType,
				id: sControlId,
				matchers: new Properties(oProperties),
				success: function(oControl){
					Opa5.assert.ok(true, "The " + sControlType + " element with id: '" + sControlId + " was found.");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage: "The " + sControlType + " element with id: '" + sControlId + " could not be found."
			});
		},

		iCompareSelectionInfo : function(sView, sControlId, vExpectedSelection) {
			return this.iGetControlById(sView, sControlId, function(oItem){
				Opa5.assert.deepEqual(oItem.getSelectedIndices(), vExpectedSelection, "The selected indices hit the expectation");
				Opa5.assert.equal(oItem.getBinding("rows").getSelectedContexts().length, vExpectedSelection.length, "The length of the selected context hit the expectation");
			});
		},

		iCheckIfIndexIsSelectable : function(sView, sControlId, iRowIndex, bIsSelectable) {
			return this.iGetControlById(sView, sControlId, function(oItem){
				Opa5.assert.equal(oItem.getBinding("rows").isIndexSelectable(iRowIndex), bIsSelectable, "The index check was successful");
			});
		},

		iShouldSeeMessageToast : function(sView, sText) {
			return this.waitFor({
				viewName : sView,
				check : function() {
					return sap.ui.test.Opa5.getJQuery()(".sapMMessageToast")[0] && sap.ui.test.Opa5.getJQuery()(".sapMMessageToast")[0].outerText === sText;
				},
				success : function() {
					Opa5.assert.ok(true, "The message toast is shown.");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "Did not find message toast with the text: " + sText
			});
		},

		iSeePage : function(sView, fnSuccess) {
			return this.waitFor({
				controlType : "sap.m.Page",
				viewName : sView,
				success : fnSuccess || function() {
					Opa5.assert.equal(1, 1, "Always true");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The view " + sView + " wasn't found"
			});
		},

		iSeeMessagePopover : function(fnSuccess) {
			return this.waitFor({
				controlType : "sap.m.MessagePopover",
				success : fnSuccess || function() {
					Opa5.assert.equal(1, 1, "Always true");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The messagepopover wasn't found"
			});
		},

		iShouldSeeOpenBusyDialog: function(){
			return this.waitFor({
				controlType: "sap.m.BusyDialog",
				searchOpenDialogs: true,
				success: function(aDialogs){
					Opa5.assert.ok(true, "A busy dialog is opened.");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage: "No opened busy dialog is found."
			});
		}
	});

	return assertions;
});