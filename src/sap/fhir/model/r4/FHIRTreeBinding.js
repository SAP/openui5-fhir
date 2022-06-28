sap.ui.define([
	"sap/ui/model/TreeBinding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/SorterProcessor",
	"sap/fhir/model/r4/FHIRUtils",
	"sap/fhir/model/r4/OperationMode",
	"sap/ui/model/Filter",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/fhir/model/r4/Context"
], function(TreeBinding, ChangeReason, Sorter, FilterProcessor, SorterProcessor, FHIRUtils, OperationMode, Filter, Log, deepEqual, each, Context) {
	"use strict";

	/**
	 * Constructor for a new FHIRTreeBinding
	 *
	 * @class
	 * @classdesc Tree binding implementation for the FHIRModel
	 * @alias sap.fhir.model.r4.FHIRTreeBinding
	 * @param {sap.fhir.model.r4.FHIRModel} oModel The FHIRModel
	 * @param {string} sPath The binding path in the model
	 * @param {sap.fhir.model.r4.Context} [oContext] The parent context which is required as base for a relative path
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [aFilters] The dynamic application filters to be used initially (can be either a filter or an array of filters)
	 * @param {object} [mParameters] The map which contains additional parameters for the binding
	 * @param {string} [mParameters.groupId] The group id
	 * @param {sap.fhir.model.r4.OperationMode} [mParameters.operationMode] The operation mode, how to handle operations like filtering and sorting
	 * @param {string} [mParameters.rootSearch] The search parameter to identify the root node, e.g. 'base'
	 * @param {string} [mParameters.rootValue] The value of the search parameter to identify the root node, e.g. 'http://hl7.org/fhir/StructureDefinition/DomainResource'
	 * @param {string} [mParameters.rootProperty] The property of a FHIR resource which represents the link to the parent in the tree, e.g. 'baseDefinition'
	 * @param {string} [mParameters.nodeProperty] The property of a FHIR resource which identifies the resource as a node in the tree, e.g. 'url', Note: The `rootProperty` of a child, is the value of the `nodeProperty` of the parent
	 * @param {boolean} [mParameters.displayRootNode=false] Determines if the root node of the tree is displayed or not
	 * @param {boolean} [mParameters.collapseRecursive=true] Determines if all sub nodes of a single node will be collapsed also, if this single node is collapsed
	 * @param {number} [mParameters.numberOfExpandedLevels=0] Determines the number of levels, which will be auto-expanded initially
	 *
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [aSorters] The dynamic sorters to be used initially (can be either a sorter or an array of sorters)
	 * @author SAP SE
	 * @extends sap.ui.model.TreeBinding
	 * @public
	 * @since 1.0.0
	 * @version ${version}
	*/
	var FHIRTreeBinding = TreeBinding.extend("sap.fhir.model.r4.FHIRTreeBinding", {

		constructor : function(oModel, sPath, oContext, aFilters, mParameters, aSorters) {
			TreeBinding.apply(this, arguments);
			this.aFilters = aFilters instanceof Filter ? [aFilters] : aFilters;
			this.aSorters = aSorters instanceof Sorter ? [aSorters] : aSorters;
			this.aSorters = aSorters;
			this.sId = FHIRUtils.uuidv4();
			this._checkParameters(mParameters);
			this.iExpandedNodesLength = 0;
			this.mParameters = mParameters;
			this.sRootSearch = mParameters.rootSearch;
			this.sRootProperty = mParameters.rootProperty;
			this.aRootProperty = FHIRUtils.splitPath(this.sRootProperty);
			this.sRootValue = mParameters.rootValue;
			this.sNodeProperty = mParameters.nodeProperty;
			this.aNodeProperty = FHIRUtils.splitPath(this.sNodeProperty);
			this.sOperationMode = mParameters.operationMode || this.oModel.sDefaultOperationMode;
			this.sGroupId = mParameters && mParameters.groupId || oContext && oContext.sGroupId;
			if (this.sOperationMode !== OperationMode.Server) {
				throw new Error("Unsupported OperationMode: " + this.sOperationMode + ". Only sap.fhir.model.r4.OperationMode.Server is supported.");
			}
			this.iNumberOfExpandedLevels = mParameters.numberOfExpandedLevels || 0;
			this._aRowIndexMap = [];
			this.oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext);

			// default value for collapse recursive
			if (this.mParameters.collapseRecursive === undefined) {
				this.bCollapseRecursive = true;
			} else {
				this.bCollapseRecursive = !!this.mParameters.collapseRecursive;
			}
			this._resetData();
		}
	});


	/**
	 * Fired, when the tree binding starts to request tree items from the FHIR server
	 *
	 * @event sap.fhir.model.r4.FHIRTreeBinding#treeLoadingStarted
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @public
	 */

	/**
	 * Fired, when the tree binding has finished requesting tree items from the FHIR server
	 *
	 * @event sap.fhir.model.r4.FHIRTreeBinding#treeLoadingCompleted
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @public
	 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the <code>treeLoadingStarted</code> event of this <code>sap.fhir.model.r4.FHIRTreeBinding</code>.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the oListener-instance (if present) or in a 'static way'.
	 * @param {object} [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.attachTreeLoadingStarted = function(oData, fnFunction, oListener) {
		this.attachEvent("treeLoadingStarted", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the <code>treeLoadingStarted</code> event of this <code>sap.fhir.model.r4.FHIRTreeBinding</code>. The passed function and listener
	 * object must match the ones previously used for event registration.
	 *
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} oListener Object on which the given function had to be called.
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.detachTreeLoadingStarted = function(fnFunction, oListener) {
		this.detachEvent("treeLoadingStarted", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event <code>treeLoadingStarted</code> to attached listeners.
	 *
	 * @param {any} mArguments Arguments to be fired alongside the event.
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} <code>this</code> to allow method chaining
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.fireTreeLoadingStarted = function(mArguments) {
		this.fireEvent("treeLoadingStarted", mArguments);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the <code>treeLoadingCompleted</code> event of this <code>sap.fhir.model.r4.FHIRTreeBinding</code>.
	 *
	 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the oListener-instance (if present) or in a 'static way'.
	 * @param {object} [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.attachTreeLoadingCompleted = function(oData, fnFunction, oListener) {
		this.attachEvent("treeLoadingCompleted", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the <code>treeLoadingCompleted</code> event of this <code>sap.fhir.model.r4.FHIRTreeBinding</code>. The passed function and listener
	 * object must match the ones previously used for event registration.
	 *
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} oListener Object on which the given function had to be called.
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.detachTreeLoadingCompleted = function(fnFunction, oListener) {
		this.detachEvent("treeLoadingCompleted", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event <code>treeLoadingCompleted</code> to attached listeners.
	 * @param {any} mArguments Arguments to be fired alongside the event.
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding} <code>this</code> to allow method chaining
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.fireTreeLoadingCompleted = function(mArguments) {
		this.fireEvent("treeLoadingCompleted", mArguments);
		return this;
	};

	/**
	 * Checks if rootSearch, rootProperty, rootValue and nodeProperty are set in <code>mParameters</code>
	 * @param {object} mParameters Parameters to check.
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._checkParameters = function(mParameters) {
		if (!mParameters || !FHIRUtils.isObject(mParameters) || FHIRUtils.isEmptyObject(mParameters)) {
			throw new Error("Missing parameters: rootSearch, rootProperty, rootValue and nodeProperty have to be set in parameters.");
		}
		FHIRUtils.checkFHIRSearchParameter(mParameters, "rootSearch");
		FHIRUtils.checkPathParameter(mParameters, "rootProperty");
		FHIRUtils.checkStringParameter(mParameters, "rootValue");
		FHIRUtils.checkPathParameter(mParameters, "nodeProperty");
	};

	/**
	 * Returns already created binding contexts for all entities in this tree binding for the range determined by the given start index <code>iStart</code> and <code>iLength</code>. Resource
	 * profiles which are mentioned in the context but aren't loaded already, are requested
	 *
	 * @param {number} [iStartIndex] The index where to start the retrieval of contexts
	 * @param {number} [iLength] The number of contexts to retrieve beginning from the start index
	 * @param {number} iThreshold The threshold for the tree table
	 * @param {number} bReturnNodes The flag if the method should return the nodes for the tree table
	 * @returns {sap.fhir.model.r4.Context[]} The array of all binding contexts
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getContexts =
			function(iStartIndex, iLength, iThreshold, bReturnNodes) {
				if (!this.iLength && iLength !== undefined){
					this.iLength = iLength;
				} else if (!this.iLength) {
					this.iLength = this.oModel.iSizeLimit;
				}
				var mParameters = this._buildParameters(this.iLength);
				this._buildContexts();
				this._createRootNode(iStartIndex, this.iLength);

				if (!this.sNextLink && !this.bPendingRequest && this.aFilters && FHIRUtils.isEmptyObject(this.mRequestHandle)) {
					this.aKeys = undefined;
					var aRootChildItems = [];
					this._buildFilteredTree(aRootChildItems);
					this._mTreeStateOld = FHIRUtils.deepClone(this._mTreeState);
					if (this.aKeys) {
						this.iTotalLength = this.aKeys.length;
					}
					this._buildContexts();
				} else if (!this.bPendingRequest && !this.aFilters) {
					this._buildTree();
				}


				var fnSuccess = function(oData) {
					if (oData.total === undefined){
						throw new Error("FHIR Server error: The \"total\" property is missing in the response for the requested FHIR resource " + this.sPath);
					}
					this.bDirectCallPending = false;
					var oBindingInfo = this.oModel.getBindingInfo(this.sPath, this.oContext);
					this.bInitial = false;
					if (oData.entry) {
						if (this.aFilters) {
							if (Object.keys(this.mRequestHandle).length === 0) {
								this._handlePaging(oData);
								this.bPendingRequest = false;
							}
							each(oData.entry, function(i, oEntry) {
								if (oBindingInfo.getResourceType() === oEntry.resource.resourceType) {
									this._mFilteredTreeItems[oEntry.resource.id] = oEntry.resource;
								}
							}.bind(this));
							if (!this.sNextLink) {
								var oRequestHandle;
								var mParams;
								for ( var sKey in this._mFilteredTreeItems) {
									if (this._mFilteredTreeItems.hasOwnProperty(sKey)) {
										var sRootValue = this.oModel._getProperty(this._mFilteredTreeItems[sKey], this.aRootProperty);
										var sNodeValue = this.oModel._getProperty(this._mFilteredTreeItems[sKey], this.aNodeProperty);
										if (sRootValue && sRootValue !== this.sRootValue && sNodeValue !== this.sRootValue) {
											var aItems = [];
											FHIRUtils.filterObject(this._mFilteredTreeItems, this.sNodeProperty, sRootValue, 1 + FHIRUtils.getNumberOfLevelsByPath(this.sNodeProperty), aItems);
											if (aItems.length === 0) {
												mParams = { urlParameters : {}};
												mParams.urlParameters[this.sNodeProperty + ":exact"] = sRootValue;
												oRequestHandle = this._submitRequest(this.sPath, mParams, fnSuccess);
												this.mRequestHandle[oRequestHandle.getId()] = oRequestHandle;
												oRequestHandle.getRequest().complete(function(oGivenRequestHandle) {
													delete this.mRequestHandle[oGivenRequestHandle.getId()];
													this._canRootAggregationsBeResolved(oData);
												}.bind(this, oRequestHandle));
												break;
											}
										}
									}
								}
							}
						} else {
							var oCurrentSection = this._oRootNode.nodeState.sections[0];
							if (!this.aKeys) {
								this.aKeys = [];
								iStartIndex = 0;
								oCurrentSection.startIndex = 0;
								oCurrentSection.length = oData.entry.length;
							} else {
								iStartIndex = this.aKeys.length;
								oCurrentSection.startIndex += oData.entry.length;
								oCurrentSection.length += oData.entry.length;
							}
							each(oData.entry, function(i, oEntry) {
								if (oBindingInfo.getResourceType() === oEntry.resource.resourceType) {
									this.aKeys[iStartIndex + i] = oEntry.resource.resourceType + "/" + oEntry.resource.id;
								}
							}.bind(this));

							this._markSuccessRequest(oData, oData.total);
						}
					} else {
						this._markSuccessRequest(oData, oData.total);
					}
				}.bind(this);

				// retrieve the requested section of nodes from the tree
				var aNodes = [];
				if (this._oRootNode) {
					aNodes = this._retrieveNodeSection(this._oRootNode, iStartIndex, this.iLength);
				}

				// keep a map between Table.RowIndex and tree nodes
				this._updateRowIndexMap(aNodes, iStartIndex);

				if (!this.bPendingRequest){
					if (!this.aSortersCache && !this.aFilterCache && this.sNextLink && (!bReturnNodes || iStartIndex > this.iStartIndex)) {
						this.iStartIndex += this.iLength;
						this._callNextLink(fnSuccess);
					} else if (this.iTotalLength === undefined){
						this.iStartIndex = 0;
						this._submitRequest(this.sPath, mParameters, fnSuccess);
					} else {
						this.bTreeLoadingStartedFired = false;
						this.fireTreeLoadingCompleted();
					}
				}

				if (bReturnNodes){
					return aNodes;
				} else {
					return this.aContexts;
				}
			};

	/**
	* Retrieves the "Lead-Selection-Index"
	* Normally this is the last selected node/table row.
	* @returns {number} returns the lead selection index or -1 if none is set
	* @protected
	* @since 1.0.0
	*/
	FHIRTreeBinding.prototype.getSelectedIndex = function () {
		//if we have no nodes selected, the lead selection index is -1
		if (!this._sLeadSelectionGroupID || FHIRUtils.isEmptyObject(this._mTreeState.selected)) {
			return -1;
		}

		// find the first selected entry -> this is our lead selection index
		var iNodeCounter = -1;
		var fnMatchFunction = function (oNode) {
			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {
				if (oNode.groupID === this._sLeadSelectionGroupID) {
					return true;
				}
			}
			return undefined;
		};
		this._match(this._oRootNode, [], 1, fnMatchFunction);

		return iNodeCounter;
	};

	/**
	 * Returns the context of node when it was found
	 * @param {number} iIndex The index of a node in the tree
	 * @returns {object} the context of a node
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getContextByIndex = function (iIndex) {
		if (this.isInitial()) {
			return undefined;
		}

		var oNode = this.findNode(iIndex);
		return oNode !== undefined ? oNode.context : undefined;
	};

	/**
	 * Calls the next link of paging
	 *
	 * @param {function} [fnSuccess] the call back after next link was called
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._callNextLink = function(fnSuccess) {
		if (FHIRUtils.isEmptyObject(this.mRequestHandle)) {
			var oRequestHandle = this._submitRequest(this.sNextLink, undefined, fnSuccess, undefined, true);
			this.mRequestHandle[oRequestHandle.getId()] = oRequestHandle;
			oRequestHandle.getRequest().complete(function(oGivenRequestHandle) {
				delete this.mRequestHandle[oGivenRequestHandle.getId()];
			}.bind(this, oRequestHandle));
		}
	};

	/**
	 * Builds the filtered tree from the given node and their children
	 *
	 * @param {object} [aRootChildItems] contains all children of the node
	 * @param {function} [oNode] to build the context and organize child relations
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._buildFilteredTree =
			function(aRootChildItems, oNode) {
				if (oNode && aRootChildItems.length > 0) {
					var aChildItems;
					for (var i = 0; i < aRootChildItems.length; i++) {
						aChildItems = [];
						FHIRUtils.filterObject(this._mFilteredTreeItems, this.sRootProperty, aRootChildItems[i].object[this.sNodeProperty], 1 + FHIRUtils.getNumberOfLevelsByPath(this.sNodeProperty),
							aChildItems, function(oObject) {
								return {
									children : undefined,
									object : oObject
								};
							});
						aRootChildItems[i].children = aChildItems;
						var oCurrentSection = oNode.nodeState.sections[0];
						oCurrentSection.startIndex = 0;
						oCurrentSection.length = aRootChildItems.length;
						var oChildNode = this._buildFilteredChildContexts(aRootChildItems[i], i, oNode);
						if (aChildItems.length !== 0) {
							this._buildFilteredTree(aChildItems, oChildNode);
						}
					}
				} else if (!this.aKeys && !FHIRUtils.isEmptyObject(this._mFilteredTreeItems)) {
					FHIRUtils.filterObject(this._mFilteredTreeItems, this.sRootProperty, this.sRootValue, 1 + FHIRUtils.getNumberOfLevelsByPath(this.sNodeProperty), aRootChildItems,
						function(oObject) {
							return {
								children : undefined,
								object : oObject
							};
						});
					this._buildFilteredTree(aRootChildItems, this._oRootNode);
				}
			};
	/**
	 * Builds the contexts for the given node
	 *
	 * @param {object} [oResource] contains all children of the node
	 * @param {number} [i] index where to insert the child in the tree
	 * @param {object} oNode to build the contexts and organize child relations
	 * @returns {undefined | object} Child node if oNode is expanded, otherwise undefined.
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._buildFilteredChildContexts = function(oResource, i, oNode) {
		if (oNode.nodeState.expanded) {
			var iStartIndex;
			if (!this.aKeys) {
				this.aKeys = [];
				iStartIndex = 0;
			} else {
				iStartIndex = this.aKeys.length;
			}
			this.aKeys[iStartIndex] = oResource.object.resourceType + "/" + oResource.object.id;
			this._buildContexts();
			var aChildContexts = this.aContexts.splice(iStartIndex, this.aKeys.length);
			var oChildNode = this._processChildren(oNode, aChildContexts[0], i, {
				total : oResource.children.length,
				expanded : true
			});
			return oChildNode;
		}
		return undefined;
	};

	/**
	 * Checks if the root aggregation can be resolved when there are no more pending requests in the queue and builds after that the filtered tree
	 *
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._canRootAggregationsBeResolved = function() {
		if (FHIRUtils.isEmptyObject(this.mRequestHandle)) {
			this.bPendingRequest = false;
			var aRootChildItems = [];
			this._buildFilteredTree(aRootChildItems);
			this.iTotalLength = this.aKeys.length;
			this._fireChange({
				reason : ChangeReason.Change
			});
		}
	};

	/**
	 * @typedef {object} sap.fhir.model.r4.FHIRTreeBinding.Parameter
	 * @prop {object} [urlParameters] The parameters that will be passed as query strings
	 * @public
	 * @since 1.0.0
	 */

	/**
	 * Creates the parameters for the FHIR request based on the configured filters and sorters
	 *
	 * @param {number} [iLength] The number of contexts to retrieve beginning from the start index
	 * @returns {sap.fhir.model.r4.FHIRTreeBinding.Parameter} The map of parameters
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._buildParameters = function(iLength) {
		var mParameters = {
			urlParameters : {
				_sort : FHIRUtils.createSortParams(this.aSorters)
			}
		};

		FHIRUtils.addRequestQueryParameters(this, mParameters);

		if (this.aFilters) {
			FHIRUtils.filterBuilder(this.aFilters, mParameters.urlParameters, this.oModel.iSupportedFilterDepth);
		} else {
			mParameters.urlParameters[this.sRootSearch] = this.sRootValue;
			mParameters.urlParameters._count = iLength;
		}
		return mParameters;
	};

	/**
	 * Writes the previous and next link in instance variables that can be reused
	 *
	 * @param {object} oData meta information of the response about the next previous link
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._handlePaging = function(oData) {
		if (oData && oData.link) {
			this.sNextLink = FHIRUtils.getLinkUrl(oData.link, "next");
			this.sPrevLink = FHIRUtils.getLinkUrl(oData.link, "previous");
		}
	};
	/**
	 * Mark the pending request as successful and attach a new data received callback
	 *
	 * @param {object} oData The data retrieved from the server
	 * @param {number} iTotalLength The number of resources retrieved from the server
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._markSuccessRequest = function(oData, iTotalLength) {
		this._handlePaging(oData);
		if (this.iTotalLength === undefined){
			this.iTotalLength = iTotalLength;
		}
		this.bPendingRequest = false;
		this.oModel.attachAfterUpdate(function() {
			this.fireDataReceived({
				data : oData
			});
		}.bind(this));
	};

	/**
	 * Determines the number of entities contained by the actual tree binding
	 *
	 * @returns {number} The number of entities contained by the current list binding
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getLength = function() {
		return this.iTotalLength;
	};

	/**
	 * Refreshes the tree binding
	 *
	 * @param {sap.ui.model.ChangeReason} sChangeReason The reason for refreshing the binding
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.refresh = function(sChangeReason) {
		this._resetData();
		this._fireChange({
			reason : sChangeReason
		});
	};

	/**
	 * Resets the data of the tree binding
	 *
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._resetData = function() {
		for (var key in this.mRequestHandle){
			this.mRequestHandle[key].getRequest().abort();
		}
		this.mRequestHandle = {};
		this.aKeys = undefined;
		this.aContexts = undefined;
		this.iTotalLength = undefined;
		this.bInitial = true;
		this.sNextLink = undefined;
		this.sPrevLink = undefined;
		this._oRootNode = undefined;
		this._mTreeState = undefined;
		this._mTreeStateOld = undefined;
		this.bPendingRequest = false;
		this.iLength = undefined;
		this.bTreeLoadingStartedFired = false;
		this.aSortersCache = undefined;
		this.aFilterCache = undefined;
		this._mFilteredTreeItems = {};
		this._createTreeState();
		this.iExpandedNodesLength = 0;
	};

	/**
	 * Determines if the list binding is configured in client mode
	 *
	 * @returns {boolean} if the model is initialized with the client mode
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._isClientMode = function() {
		return this.sOperationMode === OperationMode.Client;
	};

	/**
	 * Determines if the list binding is configured in server mode
	 *
	 * @returns {boolean} if the model is initialized with the server mode
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._isServerMode = function() {
		return this.sOperationMode === OperationMode.Server;
	};

	/**
	 * Filters the actual list binding depending on the given <code>aFilters</code>
	 *
	 * @param {sap.ui.model.Filter[]} [aFilters] The filters defined for the list binding
	 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.filter = function (aFilters, sFilterType) {
		FHIRUtils.filter(aFilters, this, sFilterType);
	};

	/**
	 * Sorts the actual list binding based on the given <code>aSorters</code>
	 *
	 * @param {sap.ui.model.Sorter[]} aSorters The sorters defined for the list binding
	 * @param {boolean} bRefresh If the binding should directly send a call or wait for the filters, for p13ndialog
	 * @public
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.sort = function(aSorters, bRefresh) {
		FHIRUtils.sort(aSorters, this, bRefresh);
	};

	/**
	 * Sets the context of the list binding and refreshes the binding
	 *
	 * @param {sap.fhir.model.r4.Context} oContext The context object
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.setContext = function(oContext) {
		if (this.oContext !== oContext && this.isRelative()) {
			this.oContext = oContext;
			this._resetData();
		}
	};

	/**
	 * Executes an ajax call with given <code>sPath</code>, <code>mParameters</code>. Additionally, it's possible to assign the given function <code>fnSuccessCallback</code> as a callback
	 * function which is executed when the ajax call was executed successfully
	 *
	 * @param {string} sPath The path of the resource which will be requested, relative to the root URL of the FHIR server
	 * @param {object} mParameters The URL parameters which are send by the request e.g. _count, _summary
	 * @param {function} fnSuccessCallbackBeforeMapping The callback function which is executed if the request was successful
	 * @param {function} fnSuccessCallbackAfterMapping The callback which is executed after the mapping of the data fCallback
	 * @param {boolean} [bForceDirectCall] Determines if this binding should avoid the bundle request
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} A request handle.
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._submitRequest = function(sPath, mParameters, fnSuccessCallbackBeforeMapping, fnSuccessCallbackAfterMapping, bForceDirectCall) {
		this.bPendingRequest = true;
		var fnErrorCallback = function() {
			this.bPendingRequest = false;
			this.bInitial = false;
		}.bind(this);
		this.bDirectCallPending = bForceDirectCall;
		if (!mParameters){
			mParameters = {};
		}
		mParameters.binding = this;
		mParameters.forceDirectCall = bForceDirectCall;
		mParameters.successBeforeMapping = fnSuccessCallbackBeforeMapping;
		mParameters.success = fnSuccessCallbackAfterMapping;
		mParameters.error = fnErrorCallback;
		var oRequestHandle = this.oModel.loadData(sPath, mParameters);
		this.bPendingRequest = true;
		if (!this.bTreeLoadingStartedFired) {
			this.bTreeLoadingStartedFired = true;
			this.fireTreeLoadingStarted();
		}
		return oRequestHandle;
	};

	/**
	 * Builds the binding context array for the list
	 *
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._buildContexts = function() {
		if (!this.aContexts) {
			this.aContexts = [];
		}
		if (this.aKeys) {
			this.aContexts = [];
			for (var j = 0; j < this.aKeys.length; j++) {
				this.aContexts.push(Context.create(this.oModel, this, "/" + this.aKeys[j], this.sGroupId));
			}
		}
	};

	/**
	 * Returns a node by the given index
	 *
	 * @param {number} iIndex The index of the node
	 * @returns {object} Node
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getNodeByIndex = function(iIndex) {
		if (this.bInitial) {
			return undefined;
		}

		// if the requested index is bigger than the magnitude of the tree, the index can never
		// be inside the tree.
		if (iIndex >= this.getLength()) {
			return undefined;
		}

		return this.findNode(iIndex);
	};

	/**
	 * Find node retrieves an actual tree nodes. However if there are sum rows cached (meaning, they are currently displayed), these will also be returned.
	 * @param {any} vParam Node to find.
	 * @returns {object | undefined} The found node or undefined.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.findNode = function(vParam) {
		if (this.bInitial) {
			return undefined;
		}

		var sParameterType = typeof vParam;
		var oFoundNode;

		var aSearchResult = [];

		// if the parameter is an index -> first check the cache, and then search the tree if necessary
		if (sParameterType === "number") {
			oFoundNode = this._aRowIndexMap[vParam];

			if (!oFoundNode) {
				var iIndexCounter = -1;
				this._match(this._oRootNode, aSearchResult, 1, function() {
					if (iIndexCounter === vParam) {
						return true;
					}
					iIndexCounter += 1;
					return undefined;
				});

				oFoundNode = aSearchResult[0];
			}

		}
		/*
		 * else if (sParameterType === "string" || sParameterType === "object") { // match auf group id // oFoundNode = aSearchResult[0]; }
		 */

		return oFoundNode;
	};

	/**
	 * Calls the given matching function on every child node in the sub tree with root "oNode". The matching function must
	 * return "true" if the node should be collected as a match, and false otherwise.
	 *
	 * @param {object} oNode the starting node of the sub-tree which will be traversed, handed to the fnMatchFunction
	 * @param {array} aResults the collected nodes for which the matching function returns true
	 * @param {number} iMaxNumberOfMatches the maximum number of matched nodes, _match() will stopp if this boundary is reached
	 * @param {function} fnMatchFunction the match function is called for every traversed nodes
	 * @param {number} [iPositionInParent] the relative position of the oNode parameter to its parent nodes children array, handed to the fnMatchFunction
	 * @param {object} [oParentNode] the parent node of the oNode parameter, handed to the fnMatchFunction
	 * @returns {boolean} if generally a math was found
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._match = function(oNode, aResults, iMaxNumberOfMatches, fnMatchFunction, iPositionInParent, oParentNode) {
		// recursion end if max number of matches have been collected
		// if iMaxNumberOfMatches is undefined -> the whole tree is searched.
		if (aResults.length === iMaxNumberOfMatches) {
			return true;
		}

		// push the node if it matches the criterium
		var bNodeMatches = fnMatchFunction.call(this, oNode, iPositionInParent, oParentNode);
		if (bNodeMatches) {
			aResults.push(oNode);
		}

		// if the node is not defined: there is a missing section in our tree
		if (!oNode) {
			return false;
		}

		if (oNode.nodeState.expanded){
			for (var i = 0; i < oNode.children.length; i++) {
				var oChildNode = oNode.children[i];
				var bMaxNumberReached = this._match(oChildNode, aResults, iMaxNumberOfMatches, fnMatchFunction, i, oNode);
				// break recursion if enough nodes where collected
				if (bMaxNumberReached) {
					return true;
				}
			}
		}

		// check if an after match hook is defined on sub-adapters
		return false;
	};

	/**
	 * Depth-First traversal of a sub-tree object structure starting with the given node as the root. Retrieves all found nodes (including gaps). Gaps will be filled with placeholder nodes. These
	 * placeholders are later used to automatically update the tree after invalidating and refreshing the sub-tree(s) containing the gaps.
	 *
	 * @param {object} oNode the root node of the sub-tree for which the section will be retrieved
	 * @param {number} iStartIndex the start of the tree section which should be retrieved
	 * @param {number} iLength the end of the tree section which should be retrieved
	 * @returns {object[]} an array containing all collected nodes, for which the absolute node index is greater than iStartIndex the length of the array will be iLength (or less if the tree does not
	 *         have that many nodes).
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._retrieveNodeSection = function(oNode, iStartIndex, iLength) {
		var iNodeCounter = -1;
		var aNodes = [];

		this._match(oNode, [], iLength, function(oToBeMatchedNode) {
			// make sure to exclude the artificial root node from being counted
			if (!oToBeMatchedNode || !oToBeMatchedNode.isArtificial) {
				iNodeCounter++;
			}
			if (iNodeCounter >= iStartIndex && oToBeMatchedNode && this.aContexts.indexOf(oToBeMatchedNode.context) > -1) {
				aNodes.push(oToBeMatchedNode);
				return true;
			}
			return false;
		});

		return aNodes;
	};

	/**
	 * Creates the root node with the amount of children given by the startIndex and the endIndex
	 *
	 * @param {number} iStartIndex the start of the tree section
	 * @param {number} iLength the end of the tree section
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._createRootNode = function(iStartIndex, iLength) {
		if (!this._oRootNode) {
			// create the root node
			var sRootGroupID = this._calculateGroupID({
				context : null,
				parent : null
			});

			var oRootNodeState = this._getNodeState(sRootGroupID);

			// create root node state if none exists
			if (!oRootNodeState) {
				oRootNodeState = this._createNodeState({
					groupID : sRootGroupID,
					sum : true,
					sections : [
						{
							startIndex : iStartIndex,
							length : iLength
						}
					]
				});

				// the root node is expanded by default under the following conditions:
				// 1: root node is artifical/should not be displayed OR we have an autoExpand situation (numberOfExpandedLevels > 0)
				// 2: the root node was not previously collapsed by the user
				this._updateTreeState({
					groupID : oRootNodeState.groupID,
					fallbackNodeState : oRootNodeState,
					expanded : true
				});
			}

			this._oRootNode = this._createNode({
				context : null,
				parent : null,
				level : this.bDisplayRootNode && this.oRootContext ? 0 : -1,
				nodeState : oRootNodeState,
				isLeaf : false,
				autoExpand : this.getNumberOfExpandedLevels() + 1
			});

			// flag the root node as artificial in case we have no real root context (but only children)
			this._oRootNode.isArtificial = true;
			this.vNodeLastInteraction = this._oRootNode;
		}
	};

	/**
	 * Builds the tree either in the initial case from the root node or when user did an interaction from the last node interaction
	 *
	 * @param {number} iStartIndex the start of the tree section
	 * @param {number} iLength the end of the tree section
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._buildTree = function() {
		// expanded the root node if requested
		if (this._mTreeState.expanded[this._oRootNode.groupID]) {
			if (Array.isArray(this.vNodeLastInteraction)){
				for (var i = 0; i < this.vNodeLastInteraction.length; i++){
					this._loadChildContexts(this.vNodeLastInteraction[i]);
				}
			} else {
				this._loadChildContexts(this.vNodeLastInteraction  || this._oRootNode);
			}
			this.vNodeLastInteraction = this._oRootNode;
		}
	};

	/**
	 * Synchronize a node section from the tree with our RowIndex Mapping table, that the indention is correct
	 *
	 * @param {object} aNodes the nodes which shall be indented
	 * @param {number} iStartIndex from where the indentions have to be handled
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._updateRowIndexMap = function(aNodes, iStartIndex) {
		// throw away the old mapping index
		this._aRowIndexMap = [];

		for (var i = 0; i < aNodes.length; i++) {
			this._aRowIndexMap[iStartIndex + i] = aNodes[i];
		}
	};

	/**
	 * Creates a new tree node with valid default values
	 *
	 * @param {object} mParameters a set of parameters which might differ from the default values
	 * @returns {object} a newly created tree node
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._createNode = function(mParameters) {
		mParameters = mParameters || {};
		var oContext = mParameters.context;
		var oNode = {
			context : oContext,
			level : mParameters.level || 0,
			children : mParameters.children || [],
			parent : mParameters.parent,
			nodeState : mParameters.nodeState,
			isLeaf : mParameters.isLeaf,
			// the relative position of the node inside its parents children array
			positionInParent : mParameters.positionInParent,
			// the sum of all child nodes in the sub-tree (below this node)
			magnitude : mParameters.magnitude || 0,
			// the total number of sum rows in the sub-tree
			numberOfTotals : mParameters.numberOfTotals || 0,
			// the total number of leafs in the sub-tree
			numberOfLeafs : mParameters.numberOfLeafs || 0,
			autoExpand : mParameters.autoExpand || 0,
			absoluteNodeIndex : mParameters.absoluteNodeIndex || 0,
			totalNumberOfLeafs : 0
		};
		// calculate the group id
		if (oContext !== undefined) {
			oNode.groupID = this._calculateGroupID(oNode);
		}

		return oNode;
	};

	/**
	 * Returns the node state for the given group id expanded, collapsed, selected, deselected
	 *
	 * @param {object} sGroupID ID of a group node.
	 * @returns {object} node state
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._getNodeState = function(sGroupID) {
		var oExpanded = this._mTreeState.expanded[sGroupID];
		var oCollapsed = this._mTreeState.collapsed[sGroupID];
		var oSelected = this._mTreeState.selected[sGroupID];
		var oDeselected = this._mTreeState.deselected[sGroupID];

		// return one or the other
		// may be undefined if no sections loaded yet
		return oExpanded || oCollapsed || oSelected || oDeselected;
	};

	/**
	 * Calculates a unique group ID for a given node
	 *
	 * @param {object} oNode Node of which the group ID shall be calculated
	 * @returns {string} Group ID for oNode
	 * @override
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._calculateGroupID = function(oNode) {
		var sBindingPath = this.getPath();
		var sGroupId;
		if (oNode.context) {
			var sContextPath = oNode.context.getPath();
			// only split the contextpath along the binding path, if it is not the top-level ("/"),
			// otherwise the "_" replace regex, will replace wrongly substitute the context-path
			if (sBindingPath !== "/") {
				// match the context-path in case the "arrayNames" property of the ClientTreeBindings is identical to the binding path
				var aMatch = sContextPath.match(sBindingPath + "(.*)");
				if (aMatch && aMatch[1]) {
					sGroupId = aMatch[1];
				} else {
					Log.warning("CTBA: BindingPath/ContextPath matching problem!");
				}
			}
			if (!sGroupId) {
				sGroupId = sContextPath;
			}

			// slashes are used to separate levels. As in the data model not every path-part represents a level,
			// the remaining slashes must be replaced by some other character. "_" is used
			if (sGroupId.startsWith("/")) {
				sGroupId = sGroupId.substring(1, sGroupId.length);
			}

			var sParentGroupId;
			if (!oNode.parent) {
				// If there is no parent object we expect that:
				// 1. the parent group id is unknown and
				// 2. the parent context is known (added in ClientTreeBinding._applyFilterRecursive)
				//
				// We use the parent context to recursively calculate the parent group id
				// In case the parent context is empty, we expect this node to be a child of the root node (which has a context of null)
				sParentGroupId = this._calculateGroupID({
					context : oNode.context._parentContext || null
				});
			} else {
				// "Normal" case: We know the parent group id
				sParentGroupId = oNode.parent.groupID;
			}
			sGroupId = sParentGroupId + sGroupId.replace(/\//g, "_") + "/";

		} else if (oNode.context === null) {
			// only the root node should have null as context
			sGroupId = "/";
		}

		return sGroupId;
	};

	/**
	 * Creates a node state depending on the given parameters
	 *
	 * @param {object} mParameters the properties for the node state
	 * @param {string} [mParameters.groupID] The group where the node belongs to
	 * @param {boolean} [mParameters.expanded] if the node is initially expanded
	 * @param {object[]} [mParameters.sections] The section length how many childs the node has and there indices
	 * @param {number} [mParameters.sections[0].startIndex mParameters.sections[0].length] The first index everytime 0. The last index of the child node
	 * @param {boolean} [mParameters.sum] true for the root node
	 * @returns {object} node state
	 * @override
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._createNodeState = function(mParameters) {
		if (!mParameters.groupID) {
			Log.fatal("To create a node state a group ID is mandatory!");
			return undefined;
		}

		// check if the tree has an initial expansion state for the given groupID
		var bInitiallyExpanded;
		var bInitiallyCollapsed;
		if (this._oInitialTreeState) {
			bInitiallyExpanded = this._oInitialTreeState._isExpanded(mParameters.groupID);
			bInitiallyCollapsed = this._oInitialTreeState._isCollapsed(mParameters.groupID);

			this._oInitialTreeState._remove(mParameters.groupID);
		}

		// check the expansion state which should be set
		// the given values have precedence over the initially set values, false is the fallback
		var bIsExpanded = mParameters.expanded || bInitiallyExpanded || false;
		var bIsSelected = mParameters.selected || false;

		var oNodeState = {
			groupID : mParameters.groupID,
			expanded : bIsExpanded,
			// a fresh node state has to have a single page with the current pagesize
			sections : mParameters.sections || [
				{
					startIndex : 0,
					length : this._iPageSize
				}
			],
			sum : mParameters.sum || false,
			selected : bIsSelected
		};

		// track initally modified nodes in the global treeState
		if (bInitiallyExpanded || bInitiallyCollapsed) {
			this._updateTreeState({
				groupID : mParameters.groupID,
				fallbackNodeState : oNodeState,
				expanded : bInitiallyExpanded,
				collapsed : bInitiallyCollapsed
			});
		}

		return oNodeState;
	};

	/**
	 * @typedef {object} UpdateTreeStateParameters
	 * @prop {boolean} expanded
	 * @prop {string} groupID
	 * @prop {number} sum
	*/

	/**
	 * Updates the tree state depending on the given parameters
	 *
	 * @param {UpdateTreeStateParameters} mParameters Parameters used to update the tree state.
	 * @returns {object} node state
	 * @override
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._updateTreeState = function(mParameters) {
		mParameters = mParameters || {};
		// get the source and target list
		var oTargetStateObject = mParameters.expanded ? this._mTreeState.expanded : this._mTreeState.collapsed;
		var oSourceStateObject = mParameters.expanded ? this._mTreeState.collapsed : this._mTreeState.expanded;

		// get the current node state, or create a new one
		var oNodeStateInSource = this._getNodeState(mParameters.groupID);
		// if no node state exists -> create it
		if (!oNodeStateInSource) {
			oNodeStateInSource = mParameters.fallbackNodeState || this._createNodeState({
				groupID : mParameters.groupID,
				expanded : mParameters.expanded,
				sum : mParameters.sum
			});
		}

		// move from the source state to the target state
		delete oSourceStateObject[mParameters.groupID];

		oTargetStateObject[mParameters.groupID] = oNodeStateInSource;

		// keep track of the expanded status on the node state
		oNodeStateInSource.expanded = mParameters.expanded;

		return oNodeStateInSource;
	};

	/**
	 * Determines the size of a group from given node
	 *
	 * @param {object} oNode the node for which the group size should be determined
	 * @override
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._getGroupSize = function(oNode) {
		return this.getChildCount(oNode.context);
	};

	/**
	 * Requests and creates the child contexts of a given node
	 *
	 * @param {object} oNode creates the child contexts for the given node
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._loadChildContexts = function(oNode) {
		var oNodeState = oNode.nodeState;
		var aChildContexts;
		// iterate all loaded (known) sections
		for (var i = 0; i < oNodeState.sections.length; i++) {

			var oCurrentSection = oNodeState.sections[i];
			var _fnProcessNodeContexts = function(oData) { // eslint-disable-line no-loop-func
				var aKeys = [];
				for (var k in oData.entry) {
					var oResource = oData.entry[k].resource;
					aKeys[k] = oResource.resourceType + "/" + oResource.id;
				}
				var iStartIndexSubkeys = this.aKeys.indexOf(oNode.context.sPath.substring(1)) + 1;
				var iEndIndexSubkeys = iStartIndexSubkeys + aKeys.length;
				var aKeysTmp = this.aKeys.slice(iStartIndexSubkeys, iEndIndexSubkeys);
				if (!deepEqual(aKeys, aKeysTmp)) {
					FHIRUtils.insertArrayIntoArray(this.aKeys, aKeys, iStartIndexSubkeys);
					this._buildContexts();
					this.iExpandedNodesLength += aKeys.length;
					this.iTotalLength += aKeys.length;
					aChildContexts = this.aContexts.slice(iStartIndexSubkeys, iEndIndexSubkeys);
					this._iterateChildContexts(aChildContexts, oCurrentSection, oNode);
				}
			}.bind(this);
			if (oNodeState.expanded) {
				// try to load the contexts for this sections (may be [])
				if (oNode.isArtificial) {
					if (oNode.children.length === 0) {
						aChildContexts = this.aContexts;
					} else if (oNode.children.length !== oCurrentSection.length) {
						aChildContexts = this.aContexts.slice(this.aContexts.length - (oCurrentSection.length - oCurrentSection.startIndex), this.aContexts.length);
					}
					if (aChildContexts !== undefined){
						this._iterateChildContexts(aChildContexts, oCurrentSection, oNode);
					}
				} else if (!oNode.isLeaf && oNode.children.length === 0) {
					this.getNodeContexts(oNode.context, _fnProcessNodeContexts);
				} else if (!oNode.isLeaf && oNode.children.length > 0) {
					for (var j = 0; j < oNode.children.length; j++) {
						this._loadChildContexts(oNode.children[j]);
					}
					var aKeys = [];
					each(oNode.children, function(k, oChildNode) { // eslint-disable-line no-loop-func
						aKeys[k] = oChildNode.context.sPath.substring(1);
					});
					if (!FHIRUtils.isSubset(aKeys, this.aKeys)) {
						var iStartIndexSubkeys = this.aKeys.indexOf(oNode.context.sPath.substring(1)) + 1;
						FHIRUtils.insertArrayIntoArray(this.aKeys, aKeys, iStartIndexSubkeys);
						this._buildContexts();
						this.iExpandedNodesLength += aKeys.length;
						this.iTotalLength += aKeys.length;
					}
				}
			} else {
				this._removeFromKeysAndContexts(oNode);
			}
		}
	};

	/**
	 * Removes the children and their childrens from the tree by the given node
	 * @param {object} oNode - to remove its children and children's children
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._removeFromKeysAndContexts = function(oNode) {
		var aContexts = [];
		this._flatTree(oNode, aContexts, oNode, function(oCurrentNode) {
			return oCurrentNode.context;
		});
		var aKeys = [];
		each(aContexts, function(iIndex, oContext) {
			var sKey = oContext.sPath.substring(1);
			if (this.aKeys.indexOf(sKey) > -1){
				aKeys.push(sKey);
			}
		}.bind(this));
		this.aKeys = FHIRUtils.removeArrayFromArray(this.aKeys, aKeys);
		this._buildContexts();
		this.iExpandedNodesLength -= aKeys.length;
		this.iTotalLength -= aKeys.length;
	};

	/**
	 * Removes the given node from tree
	 *
	 * @param {object} oNode the node from where the tree should be flatten
	 * @param {object} aArray where all nodes are flatten after the method
	 * @param {object} oRootNode that should be excluded of the flatten tree, must be same object as oNode
	 * @param {function} fnPreProcessResult preprocess the objects which are stored in aArray
	 * @param {function} fnDoProcessOfChildren inlucde e.g. only expanded nodes in the aArray
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._flatTree = function(oNode, aArray, oRootNode, fnPreProcessResult, fnDoProcessOfChildren) {
		if (oNode !== oRootNode) {
			aArray.push(fnPreProcessResult ? fnPreProcessResult(oNode) : oNode);
		}
		if (oNode && oNode.children && (!fnDoProcessOfChildren || fnDoProcessOfChildren(oNode))) {
			for (var i = 0; i < oNode.children.length; i++) {
				this._flatTree(oNode.children[i], aArray, oRootNode, fnPreProcessResult, fnDoProcessOfChildren);
			}
		}
	};

	/**
	 * Iterates over all child contexts and handles their child aggregations
	 *
	 * @param {object} aChildContexts from oNode which are iterated
	 * @param {object} oCurrentSection  current section
	 * @param {object} oNode for processing its children
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._iterateChildContexts = function(aChildContexts, oCurrentSection, oNode) {
		// for each child context we create a new node
		each(aChildContexts, function(j, oChildContext) {
			if (oChildContext) {
				var oRequestHandle = this._loadNumberOfChildren(oChildContext, function(oData) {
					this._processChildren(oNode, oChildContext, j + oCurrentSection.startIndex, oData);
				}.bind(this));
				oRequestHandle.getRequest().complete(function(oGivenRequestHandle) {
					delete this.mRequestHandle[oGivenRequestHandle.getId()];
					if (FHIRUtils.isEmptyObject(this.mRequestHandle)) {
						this.bPendingRequest = false;
						this._mTreeStateOld = FHIRUtils.deepClone(this._mTreeState);
						this._fireChange({reason : ChangeReason.Change});
					}
				}.bind(this, oRequestHandle));
				this.mRequestHandle[oRequestHandle.getId()] = oRequestHandle;
			}
		}.bind(this));
	};

	/**
	 * @typedef {object} ProcessChildrenData
	 * @prop {boolean | undefined} expanded
	 * @prop {number} total
	 */

	/**
	 * Handles child aggregations if it is leaf or not, which position, plus updating its state (expanded, collapsed ..)
	 *
	 * @param {object} oNode the parent of the childcontext
	 * @param {object} oChildContext the current processed child
	 * @param {object} iChildIndex that it can be resolved which children it is in oNode
	 * @param {ProcessChildrenData} oData Data to process.
	 * @returns {object} Built child node from oNode
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._processChildren = function(oNode, oChildContext, iChildIndex, oData) {
		var oChildNode = oNode.children[iChildIndex];

		// the updated node data after this tree building cycle
		var oUpdatedNodeData = {
			context : oChildContext,
			parent : oNode,
			level : oNode.level + 1,
			positionInParent : iChildIndex,
			autoExpand : Math.max(oNode.autoExpand - 1, -1)
		};

		// if we already have a child node reuse it, otherwise create a new one
		// Using an object reference allows us to automatically update our "snapshot" of the tree, we retrieve in getContexts
		if (oChildNode) {
			oChildNode.context = oUpdatedNodeData.context;
			oChildNode.parent = oUpdatedNodeData.parent;
			oChildNode.level = oUpdatedNodeData.level;
			oChildNode.positionInParent = oUpdatedNodeData.positionInParent;
			oChildNode.magnitude = 0;
			oChildNode.numberOfTotals = 0;
			oChildNode.autoExpand = oUpdatedNodeData.autoExpand;
			// calculate the group id for the given context
			// if we reach this point, the binding returned a context from which we can calculate the group id
			var sGroupIDForChild = this._calculateGroupID(oChildNode);
			oChildNode.groupID = sGroupIDForChild;
		} else {
			// create a node one level deeper (missing a group ID and a context)
			oChildNode = this._createNode(oUpdatedNodeData);
		}

		// retrieve the node state OR create one if necessary
		oChildNode.nodeState = this._getNodeState(oChildNode.groupID);
		if (!oChildNode.nodeState) {
			oChildNode.nodeState = this._createNodeState({
				groupID : oChildNode.groupID,
				expanded : oData.expanded || false,
				sections : [
					{
						startIndex : 0,
						length : oData.total
					}
				]
			// a new node state is never expanded (EXCEPT during auto expand!)
			});
		}

		oChildNode.nodeState.parentGroupID = oNode.groupID;
		oNode.children[iChildIndex] = oChildNode;

		// if the table is grouped: a leaf is a node 1 level deeper than the number of grouped columns
		// otherwise if the table is (fully) ungrouped every node is a leaf
		oChildNode.isLeaf = !this.nodeHasChildren(oChildNode, oData.total);

		if (oChildNode.isLeaf) {
			oNode.numberOfLeafs += 1;
		}

		// if the parent node is in selectAllMode, select this child node
		if (oChildNode.parent.nodeState.selectAllMode && !this._mTreeState.deselected[oChildNode.groupID]) {
			this.setNodeSelection(oChildNode.nodeState, true);
		}

		// if the child node was previously expanded, it has to be expanded again after we rebuilt our tree
		// --> recursion
		// but only if we have at least 1 group (otherwise we have a flat list and not a tree)
		if ((oChildNode.autoExpand > 0 || oChildNode.nodeState.expanded) && !this.aFilters) {

			if (!this._mTreeState.collapsed[oChildNode.groupID] && !oChildNode.isLeaf) {
				this._updateTreeState({
					groupID : oChildNode.nodeState.groupID,
					fallbackNodeState : oChildNode.nodeState,
					expanded : true
				});
				this._loadChildContexts(oChildNode);
			}
			// sum up the magnitude/sumRows when moving up in the recursion
			oNode.magnitude += Math.max(oChildNode.magnitude || 0, 0);
			oNode.numberOfLeafs += oChildNode.numberOfLeafs;
		}
		return oChildNode;
	};

	/**
	 * Returns true if the binding is grouped, default is true.
	 * @returns {boolean} True if the binding is grouped, otherwise false.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.isGrouped = function() {
		return true;
	};

	/**
	 * Creates the initial tree state
	 *
	 * @param {boolean} bReset if the tree should be rested
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._createTreeState = function(bReset) {
		if (!this._mTreeState || bReset) {
			// general tree status information, the nodes are referenced by their groupID
			this._mTreeState = {
				expanded : {}, // a map of all expanded nodes
				collapsed : {}, // a map of all collapsed nodes
				selected : {}, // a map of all selected nodes
				deselected : {}
			// a map of all deselected nodes (due to user interaction)
			};
		}
	};

	/**
	 * Returns the max depth of expanded levels
	 *
	 * @returns {number} Number of expanded levels.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getNumberOfExpandedLevels = function() {
		return this.iNumberOfExpandedLevels;
	};

	/**
	 * Sets the max depth of expanded levels
	 * @param {number} iNumberOfExpandedLevels Number of expanded levels.
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.setNumberOfExpandedLevels = function(iNumberOfExpandedLevels) {
		this.iNumberOfExpandedLevels = parseInt(iNumberOfExpandedLevels, 10);
	};

	/**
	 * Toggles the tree node sitting at the given index.
	 *
	 * @param {number} iIndex the absolute row index
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.toggleIndex = function(iIndex) {
		var oNode = this.findNode(iIndex);

		if (!oNode) {
			Log.fatal("There is no node at index " + iIndex + ".");
			return;
		}

		if (oNode.nodeState.expanded) {
			this.collapse(iIndex);
		} else {
			this.expand(iIndex);
		}
	};

	/**
	 * Collapses the given node, identified via an absolute row index.
	 *
	 * @param {boolean} bSuppressChange if set to true, no change event will be fired
	 * @param {object} oNode last interacted node
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._handleLastNodeInteraction = function(bSuppressChange, oNode){
		if (this.vNodeLastInteraction === this._oRootNode){
			this.vNodeLastInteraction = [];
		}
		if (bSuppressChange || this.vNodeLastInteraction.length > 0){
			this.vNodeLastInteraction.push(oNode);
		} else {
			this.vNodeLastInteraction = oNode;
		}
	};

	/**
	 * Collapses the given node, identified via an absolute row index.
	 *
	 * @param {number} vParam the row index of the tree node
	 * @param {boolean} bSuppressChange if set to true, no change event will be fired
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.collapse = function(vParam, bSuppressChange) {
		this._mTreeStateOld = FHIRUtils.deepClone(this._mTreeState);
		var that = this;
		var oNode = this.findNode(vParam);
		this._handleLastNodeInteraction(bSuppressChange, oNode);
		if (!oNode) {
			Log.fatal("No node found for index " + vParam);
			return;
		}
		var oNodeStateForCollapsingNode = oNode.nodeState;

		this._updateTreeState({
			groupID : oNodeStateForCollapsingNode.groupID,
			fallbackNodeState : oNodeStateForCollapsingNode,
			expanded : false
		});

		// remove selectAllMode if necessary
		oNodeStateForCollapsingNode.selectAllMode = false;

		if (this.bCollapseRecursive) {
			var sGroupIDforCollapsingNode = oNodeStateForCollapsingNode.groupID;
			var sGroupID;

			// Collapse all subsequent child nodes, this is determined by a common groupID prefix, e.g.: "/A100-50/" is the parent of "/A100-50/Finance/"
			// All expanded nodes which start with 'sGroupIDforCollapsingNode', are basically children of it and also need to be collapsed
			for (sGroupID in this._mTreeState.expanded) {
				if (sGroupID.startsWith(sGroupIDforCollapsingNode)) {
					that._updateTreeState({
						groupID : sGroupID,
						expanded : false
					});
				}
			}

			var aDeselectedNodeIds = [];

			// always remove selections from child nodes of the collapsed node

			for (sGroupID in this._mTreeState.selected) {
				var oNodeState = this._mTreeState.selected[sGroupID];
				if (sGroupID.startsWith(sGroupIDforCollapsingNode) && sGroupID !== sGroupIDforCollapsingNode) {
					// removes the selectAllMode from child nodes
					oNodeState.selectAllMode = false;
					that.setNodeSelection(oNodeState, false);
					aDeselectedNodeIds.push(sGroupID);
				}
			}

			if (aDeselectedNodeIds.length) {
				var selectionChangeParams = {
					rowIndices : []
				};
				// Collect the changed indices
				var iNodeCounter = -1;
				this._map(this._oRootNode, function(oCurrentNode) {
					if (!oCurrentNode || !oCurrentNode.isArtificial) {
						iNodeCounter++;
					}

					if (oCurrentNode && aDeselectedNodeIds.indexOf(oCurrentNode.groupID) !== -1) {
						if (oCurrentNode.groupID === this._sLeadSelectionGroupID) {
							// Lead selection got deselected
							selectionChangeParams.oldIndex = iNodeCounter;
							selectionChangeParams.leadIndex = -1;
						}
						selectionChangeParams.rowIndices.push(iNodeCounter);
					}
				});

				this._publishSelectionChanges(selectionChangeParams);
			}
		}

		if (!bSuppressChange) {
			this._fireChange({
				reason : ChangeReason.Collapse
			});
		}
	};

	/**
	 * Expand the tree node sitting at the given index.
	 *
	 * @param {number} iIndex the absolute row index
	 * @param {boolean} bSuppressChange if set to true, no change event will be fired
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.expand = function(iIndex, bSuppressChange) {
		this._mTreeStateOld = FHIRUtils.deepClone(this._mTreeState);
		var oNode = this.findNode(iIndex);
		if (!oNode) {
			Log.fatal("No node found for index " + iIndex);
			return;
		}
		this._handleLastNodeInteraction(bSuppressChange, oNode);
		this._updateTreeState({
			groupID : oNode.nodeState.groupID,
			fallbackNodeState : oNode.nodeState,
			expanded : true
		});

		if (!bSuppressChange) {
			this._fireChange({
				reason : ChangeReason.Expand
			});
		}
	};

	/**
	 * Retrieves the requested part from the tree and returns node objects.
	 *
	 * @param {number} iStartIndex @see sap.fhir.model.r4.FHIRTreeBinding#getContexts
	 * @param {number} iLength @see sap.fhir.model.r4.FHIRTreeBinding#getContexts
	 * @param {number} iThreshold @see sap.fhir.model.r4.FHIRTreeBinding#getContexts
	 * @returns {object} Tree Node
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getNodes = function(iStartIndex, iLength, iThreshold) {
		return this.getContexts(iStartIndex, iLength, iThreshold, true);
	};

	/**
	 * Returns true or false, depending on the child count of the given node.
	 *
	 * @param {object} oNode Node instance to check whether it has children
	 * @param {number} iNumberOfChildren The number of children the node will have
	 * @returns {boolean} True if the node has children
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.nodeHasChildren = function(oNode, iNumberOfChildren) {
		// check if the node has children
		if (!oNode) {
			return false;
		} else if (oNode.isArtificial || iNumberOfChildren > 0) {
			return true;
		} else if (oNode.isLeaf === false){
			return true;
		} else {
			// call the children
			return oNode.children.length > 0;
		}
	};

	/**
	 * Determines how many children the context has
	 *
	 * @param {object} oChildContext the info for the children
	 * @param {function} fCallback The callback to process the response, fill the aKeys
	 * @returns {sap.fhir.model.r4.lib.RequestHandle} A request handle.
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._loadNumberOfChildren = function(oChildContext, fCallback) {
		var oResource = this.oModel.getProperty(undefined, oChildContext);
		var mParameters = {
			urlParameters : {_count : 1}
		};
		mParameters.urlParameters[this.sRootSearch] = oResource[this.sNodeProperty];
		return this._submitRequest(this.sPath, mParameters, fCallback);
	};

	/**
	 * Return node contexts for the tree
	 *
	 * @param {object} oContext to use for retrieving the node contexts
	 * @param {function} fCallback The callback which is executed after the mapping of the data
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getNodeContexts = function(oContext, fCallback) {
		var oResource = this.oModel.getProperty(undefined, oContext);
		var mParameters = { urlParameters : {}};
		mParameters.urlParameters[this.sRootSearch] = oResource[this.sNodeProperty];
		this._submitRequest(this.sPath, mParameters, undefined, fCallback);
	};

	/**
	 * Retrieves the expanded state of the row sitting at the given index.
	 * @param {number} iIndex the index for which the expansion state should be retrieved
	 * @returns {boolean} if the given index is expanded
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.isExpanded = function (iIndex) {
		var oNode = this.findNode(iIndex);
		return oNode && oNode.nodeState ? oNode.nodeState.expanded : false;
	};

	/**
	 * Calls a function on every child node in the sub tree with root "oNode".
	 *
	 * @param {object} oNode the starting node for the function mapping
	 * @param {function} fnMapFunction the function which should be mapped for each node in the sub-tree
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._map = function (oNode, fnMapFunction) {

		fnMapFunction.call(this, oNode);

		//if the node is not defined: there is a missing section in our tree
		if (!oNode) {
			return;
		}

		for (var i = 0; i < oNode.children.length; i++) {
			var oChildNode = oNode.children[i];
			this._map(oChildNode, fnMapFunction);
		}

		if (this._afterMapHook) {
			this._afterMapHook(oNode, fnMapFunction);
		}
	};

	//*************************************************
	//*               Selection-Handling              *
	//************************************************/

	/**
	 * Sets the selection state of the given node.
	 * @param {object} oNodeState the node state for which the selection should be changed
	 * @param {boolean} bIsSelected the selection state for the given node
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.setNodeSelection = function (oNodeState, bIsSelected) {

		if (!oNodeState.groupID) {
			Log.fatal("NodeState must have a group ID!");
			return;
		}

		oNodeState.selected = bIsSelected;

		// toggles the selection state based on bIsSelected
		if (bIsSelected) {
			this._mTreeState.selected[oNodeState.groupID] = oNodeState;
			delete this._mTreeState.deselected[oNodeState.groupID];
		} else {
			delete this._mTreeState.selected[oNodeState.groupID];
			this._mTreeState.deselected[oNodeState.groupID] = oNodeState;
		}
	};

	/**
	 * Returns the selection state for the node at the given index.
	 * @param {number} iRowIndex the row index to check for selection state
	 * @returns {boolean} If row is selected
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.isIndexSelected = function (iRowIndex) {
		var oNode = this.getNodeByIndex(iRowIndex);
		return oNode && oNode.nodeState ? oNode.nodeState.selected : false;
	};

	/**
	 * Returns if the node at the given index is selectable.
	 * In the AnalyticalTable only nodes with isLeaf = true are selectable.
	 * @param {number} iRowIndex the row index which should be checked for "selectability"
	 * @returns {boolean} If row is selectable
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.isIndexSelectable = function (iRowIndex) {
		var oNode = this.getNodeByIndex(iRowIndex);
		return this._isNodeSelectable(oNode);
	};

	/**
	 * Checks if the given node can be selected. Always true for TreeTable controls, except the node is not defined.
	 * @param {object} oNode The node which should be checked
	 * @returns {boolean} If the node is selectable
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._isNodeSelectable = function (oNode) {
		return !!oNode && !oNode.isArtificial;
	};

	/**
	 * Marks a single TreeTable node sitting on iRowIndex as selected.
	 * Also sets the lead selection index to this node.
	 * @param {number} iRowIndex the absolute row index which should be selected
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.setSelectedIndex = function (iRowIndex) {
		var oNode = this.findNode(iRowIndex);

		if (oNode && this._isNodeSelectable(oNode)) {
			// clear and fetch the changes on the selection
			var oChanges = this._clearSelection();

			// if the selected row index was already selected before -> remove it from the changed Indices from the clearSection() call
			var iChangedIndex = oChanges.rowIndices.indexOf(iRowIndex);
			if (iChangedIndex >= 0) {
				oChanges.rowIndices.splice(iChangedIndex, 1);
			} else {
				// the newly selected index is missing and also has to be propagated via the event params
				oChanges.rowIndices.push(iRowIndex);
			}

			//set the new lead index
			oChanges.leadGroupID = oNode.groupID;
			oChanges.leadIndex = iRowIndex;

			this.setNodeSelection(oNode.nodeState, true);

			this._publishSelectionChanges(oChanges);
		} else {
			Log.warning("The selection was ignored. Please make sure to only select rows, for which data has been fetched to the client. For AnalyticalTables, some rows might not be selectable at all.");
		}
	};


	/**
	 * Returns an array with all selected row indices.
	 * Only absolute row indices for nodes known to the client will can be retrieved this way
	 * @returns {number[]} an array with all selected indices
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getSelectedIndices = function () {
		var aResultIndices = [];
		var that = this;

		//if we have no nodes selected, the selection indices are empty
		if (FHIRUtils.isEmptyObject(this._mTreeState.selected)) {
			return aResultIndices;
		}

		// maximum number of possibly selected nodes
		var iNumberOfNodesToSelect = Object.keys(this._mTreeState.selected).length;

		// collect the indices of all selected nodes
		var iNodeCounter = -1;
		var fnMatchFunction = function (oNode) {
			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {
				if (oNode.nodeState && oNode.nodeState.selected && !oNode.isArtificial) {
					aResultIndices.push(iNodeCounter);
					// cache the selected node for subsequent findNode/getContextByIndex calls
					that._aRowIndexMap[iNodeCounter] = oNode;
					return true;
				}
			}
			return undefined;
		};

		this._match(this._oRootNode, [], iNumberOfNodesToSelect, fnMatchFunction);

		return aResultIndices;
	};

	/**
	 * Returns the number of selected nodes (including not-yet loaded)
	 * @returns {number} How many nodes are selected
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getSelectedNodesCount = function () {
		var iSelectedNodes;

		if (this._oRootNode && this._oRootNode.nodeState.selectAllMode) {
			var sGroupId, iVisibleDeselectedNodeCount, oParent, oGroupNodeState;

			var oContext, aVisibleGroupIds = [];
			if (this.filterInfo && this.aAllFilters) {
				// If we are filtering, we need to map the filtered (visible) contexts to group IDs.
				// With that we can check whether a node state is actually a visible node
				for (var i = this.filterInfo.aFilteredContexts.length - 1; i >= 0; i--) {
					oContext = this.filterInfo.aFilteredContexts[i];
					aVisibleGroupIds.push(this._calculateGroupID({
						context: oContext
					}));
				}
			}

			iVisibleDeselectedNodeCount = 0;
			// If we implicitly deselect all nodes under a group node,
			//	we need to count them as "visible deselected nodes"
			for (sGroupId in this._mTreeState.expanded) {
				if (!this.aAllFilters || aVisibleGroupIds.indexOf(sGroupId) !== -1) { // Not filtering or part of the visible nodes if filtering
					oGroupNodeState = this._mTreeState.expanded[sGroupId];
					if (!oGroupNodeState.selectAllMode && oGroupNodeState.leafCount !== undefined) {
						iVisibleDeselectedNodeCount += oGroupNodeState.leafCount;
					}
				}
			}

			// Except those who got explicitly selected after the parent got collapsed
			//	and expanded again (and while the root is still in select-all mode)
			for (sGroupId in this._mTreeState.selected) {
				if (!this.aAllFilters || aVisibleGroupIds.indexOf(sGroupId) !== -1) { // Not filtering or part of the visible nodes if filtering
					oGroupNodeState = this._mTreeState.selected[sGroupId];
					oParent = this._mTreeState.expanded[oGroupNodeState.parentGroupID];
					if (oParent && !oParent.selectAllMode) {
						iVisibleDeselectedNodeCount--;
					}
				}
			}

			// Add those which are explicitly deselected and whose parents *are* in selectAllMode (not covered by the above)
			for (sGroupId in this._mTreeState.deselected) {
				if (!this.aAllFilters || aVisibleGroupIds.indexOf(sGroupId) !== -1) { // Not filtering or part of the visible nodes if filtering
					oGroupNodeState = this._mTreeState.deselected[sGroupId];
					oParent = this._mTreeState.expanded[oGroupNodeState.parentGroupID];
					// If parent is expanded check if its in select all mode
					if (oParent && oParent.selectAllMode) {
						iVisibleDeselectedNodeCount++;
					}
				}
			}

			iSelectedNodes = this._getSelectableNodesCount(this._oRootNode) - iVisibleDeselectedNodeCount;
		} else {
			iSelectedNodes = Object.keys(this._mTreeState.selected).length;
		}
		return iSelectedNodes;
	};

	/**
	 * Returns the number of currently selectable nodes (with respect to the current expand/collapse state).
	 * @param {object} oNode the node with it selectable subnodes information
	 * @returns {number} Number of currently selectable nodes
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._getSelectableNodesCount = function (oNode) {
		if (oNode) {
			return oNode.magnitude;
		} else {
			return 0;
		}
	};

	/**
	 * Returns an array containing all selected contexts, ordered by their appearance in the tree.
	 * @returns {sap.fhir.model.r4.Context[]} an array containing the binding contexts for all selected nodes
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getSelectedContexts = function () {
		var aResultContexts = [];
		var that = this;

		//if we have no nodes selected, the selection indices are empty
		if (FHIRUtils.isEmptyObject(this._mTreeState.selected)) {
			return aResultContexts;
		}

		// maximum number of possibly selected nodes
		var iNumberOfNodesToSelect = Object.keys(this._mTreeState.selected).length;

		// collect the indices & contexts of all selected nodes
		var iNodeCounter = -1;
		var fnMatchFunction = function (oNode) {
			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {
				if (oNode.nodeState && oNode.nodeState.selected && !oNode.isArtificial) {
					aResultContexts.push(oNode.context);
					// cache the selected node for subsequent findNode/getContextByIndex calls
					that._aRowIndexMap[iNodeCounter] = oNode;
					return true;
				}
			}
			return undefined;
		};

		this._match(this._oRootNode, [], iNumberOfNodesToSelect, fnMatchFunction);

		return aResultContexts;
	};

	/**
	 * Sets the selection to the range from iFromIndex to iToIndex (including boundaries).
	 * e.g. setSelectionInterval(1,3) marks the rows 1,2 and 3.
	 * All currently selected rows will be deselected in the process.
	 * A selectionChanged event is fired
	 * @param {number} iFromIndex The start of the selection interval
	 * @param {number} iToIndex The end of the selection interval
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
		// clears the selection but suppresses the selection change event
		var mClearParams = this._clearSelection();
		// the addSelectionInterval function takes care of the selection change event
		var mSetParams = this._setSelectionInterval(iFromIndex, iToIndex, true);

		var mIndicesFound = {};
		var aRowIndices = [];
		var iIndex;
		// flag all cleared indices as changed
		for (var i = 0; i < mClearParams.rowIndices.length; i++) {
			iIndex = mClearParams.rowIndices[i];
			mIndicesFound[iIndex] = true;
		}

		// now merge the changed indices after clearing with the newly selected
		// duplicate indices mean, that the index was previously selected and is now still selected -> remove it from the changes
		for (var j = 0; j < mSetParams.rowIndices.length; j++) {
			iIndex = mSetParams.rowIndices[j];
			if (mIndicesFound[iIndex]) {
				delete mIndicesFound[iIndex];
			} else {
				mIndicesFound[iIndex] = true;
			}
		}
		// transform the changed index MAP into a real array of indices
		for (iIndex in mIndicesFound) {
			if (mIndicesFound[iIndex]) {
				aRowIndices.push(parseInt(iIndex, 10));
			}
		}

		//and fire the event
		this._publishSelectionChanges({
			rowIndices: aRowIndices,
			oldIndex: mClearParams.oldIndex,
			leadIndex: mSetParams.leadIndex,
			leadGroupID: mSetParams.leadGroupID
		});
	};

	/**
	 * Sets the value inside the given range to the value given with 'bSelectionValue'
	 * @private
	 * @param {number} iFromIndex the starting index of the selection range
	 * @param {number} iToIndex the end index of the selection range
	 * @param {boolean} bSelectionValue the selection state which should be applied to all indices between 'from' and 'to' index
	 * @returns {object} The selection interval parameters
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._setSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
		//make sure the "From" Index is always lower than the "To" Index
		var iNewFromIndex = Math.min(iFromIndex, iToIndex);
		var iNewToIndex = Math.max(iFromIndex, iToIndex);

		//find out how many nodes should be selected, this is a termination condition for the match function
		var aNewlySelectedNodes = [];
		var aChangedIndices = [];
		var iNumberOfNodesToSelect = Math.abs(iNewToIndex - iNewFromIndex) + 1; //+1 because the boundary indices are included

		// the old lead index, might be undefined -> publishSelectionChanges() will set it to -1
		var iOldLeadIndex;

		// loop through all nodes and select them if necessary
		var iNodeCounter = -1;
		var fnMatchFunction = function (oNode) {

			// do not count the artificial root node
			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {
				//if the node is inside the range -> select it
				if (iNodeCounter >= iNewFromIndex && iNodeCounter <= iNewToIndex) {

					if (this._isNodeSelectable(oNode)) {
						// fetch the node index if its selection state changes
						if (oNode.nodeState.selected !== !!bSelectionValue) {
							aChangedIndices.push(iNodeCounter);
						}

						// remember the old lead selection index if we encounter it
						// (might not happen if the lead selection is outside the newly set range)
						if (oNode.groupID === this._sLeadSelectionGroupID) {
							iOldLeadIndex = iNodeCounter;
						}

						// select/deselect node, but suppress the selection change event
						this.setNodeSelection(oNode.nodeState, !!bSelectionValue);
					}

					return true;
				}
			}
			return undefined;
		};

		this._match(this._oRootNode, aNewlySelectedNodes, iNumberOfNodesToSelect, fnMatchFunction);

		var mParams = {
			rowIndices: aChangedIndices,
			oldIndex: iOldLeadIndex,
			//if we found a lead index during tree traversal and we deselected it -> the new lead selection index is -1
			leadIndex: iOldLeadIndex && !bSelectionValue ? -1 : undefined
		};

		// set new lead selection node if necessary
		if (aNewlySelectedNodes.length > 0 && bSelectionValue){
			var oLeadSelectionNode = aNewlySelectedNodes[aNewlySelectedNodes.length - 1];
			mParams.leadGroupID = oLeadSelectionNode.groupID;
			mParams.leadIndex = iNewToIndex;
		}

		return mParams;
	};

	/**
	 * Marks a range of tree nodes as selected/deselected, starting with iFromIndex going to iToIndex.
	 * The TreeNodes are referenced via their absolute row index.
	 * Please be aware, that the absolute row index only applies to the tree which is visualized by the TreeTable.
	 * Invisible nodes (collapsed child nodes) will not be regarded.
	 * @param {number} iFromIndex the starting index of the selection range
	 * @param {number} iToIndex the end index of the selection range
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.addSelectionInterval = function (iFromIndex, iToIndex) {
		var mParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
		this._publishSelectionChanges(mParams);
	};

	/**
	 * Removes the selections inside the given range (including boundaries)
	 * @param {number} iFromIndex the starting index of the selection range
	 * @param {number} iToIndex the end index of the selection range
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.removeSelectionInterval = function (iFromIndex, iToIndex) {
		var mParams = this._setSelectionInterval(iFromIndex, iToIndex, false);
		this._publishSelectionChanges(mParams);
	};

	/**
	 * Selects all avaliable nodes
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.selectAll = function () {

		// remove all deselected nodes
		this._mTreeState.deselected = {};

		var mParams = {
			rowIndices: [],
			oldIndex: -1,
			selectAll: true
		};

		// recursion variables
		var iNodeCounter = -1;

		this._map(this._oRootNode, function (oNode) {

			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {

				//if we find the old lead selection index -> keep it, safes some performance later on
				if (oNode.groupID === this._sLeadSelectionGroupID) {
					mParams.oldIndex = iNodeCounter;
				}

				if (this._isNodeSelectable(oNode)) {
					//if a node is NOT selected (and is not our artificial root node...)
					if (oNode.nodeState.selected !== true) {
						mParams.rowIndices.push(iNodeCounter);
					}
					this.setNodeSelection(oNode.nodeState, true);

					// keep track of the last selected node -> this will be the new lead index
					mParams.leadGroupID = oNode.groupID;
					mParams.leadIndex = iNodeCounter;
				}

				//propagate select all mode to all expanded nodes (including the root node)
				// child nodes will inherit the selection state it in the process (see _buildTree/_loadChildContexts)
				if (oNode.nodeState.expanded) {
					oNode.nodeState.selectAllMode = true;
				}
			}
		});

		this._publishSelectionChanges(mParams);
	};

	/**
	 * Removes the selection from all nodes
	 * @returns {object} The selection interval parameters
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._clearSelection = function () {
		var iNodeCounter = -1;
		var iOldLeadIndex = -1;
		var iMaxNumberOfMatches = 0;

		var aChangedIndices = [];

		// Optimisation: find out how many nodes we have to check for deselection
		for (var sGroupID in this._mTreeState.selected) {
			if (sGroupID) {
				iMaxNumberOfMatches++;
			}
		}

		// matches all selected nodes and retrieves their absolute row index
		var fnMatch = function (oNode) {

			// do not count the artifical root node
			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {
				// Always reset selectAllMode
				oNode.nodeState.selectAllMode = false;

				if (this._mTreeState.selected[oNode.groupID]) {
					// remember changed index, push it to the limit!
					if (!oNode.isArtificial) {
						aChangedIndices.push(iNodeCounter);
					}
					// deslect the node
					this.setNodeSelection(oNode.nodeState, false);

					//also remember the old lead index
					if (oNode.groupID === this._sLeadSelectionGroupID) {
						iOldLeadIndex = iNodeCounter;
					}

					return true;
				}
			}
			return undefined;
		};

		this._match(this._oRootNode, [], iMaxNumberOfMatches, fnMatch);

		// explicitly remove the selectAllMode from the root node
		if (this._oRootNode && this._oRootNode.nodeState && this._oRootNode.isArtificial) {
			this._oRootNode.nodeState.selectAllMode = false;
		}

		return {
			rowIndices: aChangedIndices,
			oldIndex: iOldLeadIndex,
			leadIndex: -1
		};
	};
	/**
	 * Removes the complete selection.
	 * @param {boolean} bSuppressSelectionChangeEvent if this is set to true, no selectionChange event will be fired
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.clearSelection = function (bSuppressSelectionChangeEvent) {
		var oChanges = this._clearSelection();

		// check if the selection change event should be suppressed
		if (!bSuppressSelectionChangeEvent) {
			this._publishSelectionChanges(oChanges);
		}
	};

	/**
	 * Fires a "selectionChanged" event with the given parameters.
	 * Also performs a sanity check on the parameters.
	 * @param {object} mParams The selection interval parameters
	 * @private
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype._publishSelectionChanges = function (mParams) {

		// retrieve the current (old) lead selection and add it to the changed row indices if necessary
		mParams.oldIndex = mParams.oldIndex || this.getSelectedIndex();

		//sort row indices ascending
		mParams.rowIndices.sort(function(a, b) {
			return a - b;
		});

		//set the lead selection index
		if (mParams.leadIndex >= 0 && mParams.leadGroupID) {
			//keep track of a newly set lead index
			this._sLeadSelectionGroupID = mParams.leadGroupID;
		} else if (mParams.leadIndex === -1){
			// explicitly remove the lead index
			this._sLeadSelectionGroupID = undefined;
		} else {
			//nothing changed, lead and old index are the same
			mParams.leadIndex = mParams.oldIndex;
		}

		//only fire event if the selection actually changed somehow
		if (mParams.rowIndices.length > 0 || (mParams.leadIndex !== undefined && mParams.leadIndex !== -1)) {
			this.fireSelectionChanged(mParams);
		}
	};

	/**
	 * Sets the node hierarchy to collapse recursive. When set to true, all child nodes will get collapsed as well.
	 * @param {boolean} bCollapseRecursive If the tree should be collapse recursively
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.setCollapseRecursive = function (bCollapseRecursive) {
		this.bCollapseRecursive = !!bCollapseRecursive;
	};

	/**
	 * Gets the collapsing behavior when parent nodes are collapsed.
	 * @returns {boolean} If the current tree binding will be collapsed recursively
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.getCollapseRecursive = function () {
		return this.bCollapseRecursive;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'selectionChanged' event of this <code>sap.ui.model.SelectionModel</code>.<br/>
	 * Event is fired if the selection of tree nodes is changed in any way.
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function.
	 * @returns {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.attachSelectionChanged = function(oData, fnFunction, oListener) {
		this.attachEvent("selectionChanged", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'selectionChanged' event of this <code>sap.ui.model.SelectionModel</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @returns {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.detachSelectionChanged = function(fnFunction, oListener) {
		this.detachEvent("selectionChanged", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event 'selectionChanged' to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'leadIndex' of type <code>int</code> Lead selection index.</li>
	 * <li>'rowIndices' of type <code>int[]</code> Other selected indices (if available)</li>
	 * </ul>
	 *
	 * @param {object} mArguments the arguments to pass along with the event.
	 * @param {number} mArguments.leadIndex Lead selection index
	 * @param {number[]} [mArguments.rowIndices] Other selected indices (if available)
	 * @returns {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
	 * @protected
	 * @since 1.0.0
	 */
	FHIRTreeBinding.prototype.fireSelectionChanged = function(mArguments) {
		this.fireEvent("selectionChanged", mArguments);
		return this;
	};

	return FHIRTreeBinding;

});