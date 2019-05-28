sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/base/Log"
], function(Opa5, opaTest, EnterText, Press, Log) {
	"use strict";

	var actions = new Opa5({
		iEnterDataInInput : function(sSearch, sView, sControlId) {
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				actions : new EnterText({
					text : sSearch
				}),
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "There is no input defined."
			});
		},

		iPressButton : function(sView, sControlId) {
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				actions : new Press(),
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "There is no button defined."
			});
		},

		iDoActionWithControl : function(sControlType, fnSuccess) {
			return this.waitFor({
				controlType : sControlType,
				success : fnSuccess,
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "iDoActionWithControl for controltype: " + sControlType + " failed."
			});
		},

		iDoActionWithControlByView : function(sControlType, sView, fnSuccess) {
			return this.waitFor({
				controlType : sControlType,
				viewName : sView,
				success : fnSuccess,
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "iDoActionWithControlByView for controltype: " + sControlType + " in view " + sView + " failed."
			});
		},

		iDoActionWithControlById : function(sView, sControlId, fnSuccess) {
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				success : fnSuccess,
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "iDoActionWithControlById for control: " + sControlId + " in view " + sView + " failed."
			});
		},

		iDoActionWithSelect : function(fnSuccess) {
			return this.iDoActionWithControl("sap.m.Select",fnSuccess);
		},

		iScrollInTable : function(sView, sControlId, iRow) {
			return this.iDoActionWithControlById(sView, sControlId, function(oTable){
				iRow = (iRow || iRow === 0) ? iRow : oTable.getBinding("rows").getLength();
				oTable.setFirstVisibleRow(iRow);
			});
		},

		iScrollInTableToTop: function(sView, sControlId){
			return this.iScrollInTable(sView, sControlId, 0);
		},

		iScrollInTableToBottom: function(sView, sControlId){
			return this.iScrollInTable(sView, sControlId);
		},

		iScrollInScrollContainer : function(sView, sControlId, iPercentage) {
			return this.iDoActionWithControlById(sView, sControlId, function(oScrollContainer){
				var oScrollbar = oScrollContainer.getScrollDelegate();
				var iScrollHeight = oScrollbar.getScrollHeight();
				var iScrollValue = (iScrollHeight * iPercentage) / 100;
				var iPos = oScrollbar.getScrollTop();
				var iNewScrollPos = iPos + iScrollValue;
				if (iNewScrollPos >= 0 && iNewScrollPos <= iScrollHeight){
					oScrollContainer.scrollTo(0, iNewScrollPos, 0);
				} else if (iNewScrollPos < 0){
					oScrollContainer.scrollTo(0, 0, 0);
				} else {
					oScrollContainer.scrollTo(0,iScrollHeight,0);
				}
			});
		},

		iPressOnTheTreeItemExpander : function(sTitle, sView) {
			return this.waitFor({
				viewName : sView,
				controlType : "sap.ui.core.Icon",
				matchers : function(oItem) {
					var oTreeItem = oItem.getParent();
					return (oTreeItem.getMetadata().getName() === "sap.m.StandardTreeItem" || oTreeItem.getMetadata().getName() === "sap.m.CustomTreeItem") && sTitle === oTreeItem.getTitle();
				},
				actions : new Press(),
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "Did not find the tree item expander"
			});
		},

		iPressOnTheRowItemExpander : function(sTitle, sView) {
			return this.waitFor({
				viewName : sView,
				controlType : "sap.ui.table.Row",
				matchers : function(oItem) {
					return oItem.getCells()[1].getText() === sTitle;
				},
				success : function(aItems){
					var oRow = aItems[0];
					var oTreeTable = oRow.getParent();
					oTreeTable.expand(oRow.getIndex());
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "Did not find the row item expander"
			});
		},

		iSelectTheRowInTreeTable : function(sView, sControlId,iRowIndex){
			return this.iDoActionWithControlById(sView, sControlId, function(oItem){
				oItem.addSelectionInterval(iRowIndex,iRowIndex);
			});
		},

		iSelectAllInTreeTable : function(sView, sControlId){
			return this.iDoActionWithControlById(sView, sControlId, function(oItem){
				oItem.selectAll();
			});
		},

		iSelectSingleIndexInTreeTable : function(sView, sControlId, iRowIndex){
			return this.iDoActionWithControlById(sView, sControlId, function(oItem){
				oItem.setSelectedIndex(iRowIndex);
			});
		},

		iSelectRangeInTreeTable : function(sView, sControlId, iStartIndex, iLastIndex){
			return this.iDoActionWithControlById(sView, sControlId, function(oItem){
				oItem.setSelectionInterval(iStartIndex,iLastIndex);
			});
		},

		iDeselectRangeInTreeTable : function(sView, sControlId, iStartIndex, iLastIndex){
			return this.iDoActionWithControlById(sView, sControlId, function(oItem){
				oItem.removeSelectionInterval(iStartIndex,iLastIndex);
			});
		},

		iClearSelectionInTreeTable : function(sView, sControlId){
			return this.iDoActionWithControlById(sView, sControlId, function(oItem){
				oItem.clearSelection();
			});
		},

		iPressOnDialogButtonContainingTheText : function(sText) {
			return this.waitFor({
				searchOpenDialogs : true,
				controlType : "sap.m.Button",
				matchers : function(oButton) {
					return oButton.getText() === sText;
				},
				actions : new Press(),
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "Did not find the OK Button in the Nav Back Dialog."
			});
		},

		iPressNavBackButton : function(sView,sControlId) {
			return this.waitFor({
				viewName : sView,
				id : sControlId,
				actions : new Press(),
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "iPressNavBackButton failed"
			});
		},

		iSelectItemInControl : function(sView, fnSuccess, sControl) {
			return this.waitFor({
				controlType : sControl || "sap.m.Table",
				viewName : sView,
				success : fnSuccess || function(aItem) {
					Opa5.assert.ok(true, "The table with id " + aItem[0].getId() + " was found at position 0");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage : "The given control wasn't found"
			});
		},

		iPressListItemAtIndex: function(sViewName, sControlId, iIndex){
			return this.waitFor({
				id : sControlId,
				viewName : sViewName,
				actions: function(oList){
					oList.fireItemPress({listItem: oList.getItems()[0]});
				},
				success: function(){
					Opa5.assert.ok(true, "The item on the given index: " + iIndex + " is pressed in the list/table with id '" + sControlId + "' on the view '" + sViewName + "'");
				},
				error : function(oError){
					Log.fatal(oError);
				},
				errorMessage: "The item on the given index: " + iIndex + " can not be pressed in the list/table with id '" + sControlId + "' on the view '" + sViewName + "'"
			});
		}
	});

	return actions;
});