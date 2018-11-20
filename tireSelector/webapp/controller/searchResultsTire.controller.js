var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/Filter',
	'sap/m/ObjectIdentifier',
	'app/toyota/tireselector/ui5_tireselector/controller/BaseController'
], function (Controller, JSONModel, ResourceModel, Filter, ObjectIdentifier, BaseController) {
	"use strict";

	return BaseController.extend("app.toyota.tireselector.ui5_tireselector.controller.searchResultsTire", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.searchResults
		 */
		onInit: function () {
			_that = this;

			_that.serviceURL = "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_FITMENT_SRV/";

			_that.oSelectTireJSONModel = new JSONModel();
			_that.getView().setModel(_that.oSelectTireJSONModel, "SelectTireJSONModel");

			//ZC_FitmentSet
			_that.oSelectTireJSONModel.getData().FitmentData = [];
			$.ajax({
				dataType: "json",
				url: _that.serviceURL + "ZC_FitmentSet",
				type: "GET",
				success: function (oData) {
					console.log("Ajax data", oData.d.results);
					_that.oSelectTireJSONModel.getData().FitmentData = oData.d.results;
					_that.oSelectTireJSONModel.updateBindings();
				},
				error: function (oError) {}
			});

			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableDealerNet: false,
				enableProfit: false
			});

			_that.getView().setModel(_that._oViewModel, "propertiesModel");

			_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			_that.getView().setModel(_that.oI18nModel, "i18n");

			if (window.location.search == "?language=fr") {
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				_that.getView().setModel(i18nModel, "i18n");
				_that.sCurrentLocale = 'FR';
			} else {
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				_that.getView().setModel(i18nModel, "i18n");
				_that.sCurrentLocale = 'EN';
			}

			this.getRouter().attachRouteMatched(function (oEvent) {
				_that.oTable = _that.getView().byId("idTireSelectionTable");

				// _that.getView().byId("ID_DealerNet").setVisible(false);
				// _that.getView().byId("ID_Profit").setVisible(false)
				// if (_that.oTable !== undefined) {
				// 	_that.oTable.getColumns()[5].setVisible(false);
				// 	_that.oTable.getColumns()[6].setVisible(false);
				// }
				// if (_that.oTable !== undefined) {
				// 	if (sap.ushell.components.SearchOption.getSelectedKey() == "Tire Size") {
				// 		_that.oTable.getColumns()[0].setVisible(true);
				// 	} else {
				// 		_that.oTable.getColumns()[0].setVisible(false);
				// 	}
				// }
				if (oEvent.getParameter("arguments").modelData !== undefined) {
					_that.oSelectedModel = oEvent.getParameter("arguments").modelData;
					_that.getView().byId("selectedModelText").setText("Selected Model: " + _that.oSelectedModel + "");
				}
			}, _that);

			_that.oTable = _that.getView().byId("idTireSelectionTable");
			var oBindingInfo = _that.oTable.getBindingInfo("rows");
			_that.oTable.bindRows(oBindingInfo);
			// this.byId("idVBox").addItem(_that.oTable);

			_that.objList = {
				"TireSelectionList": [{
					"TireFitment": "Other",
					"TireCategory": "Winter",
					"TireBrandDesc": "BranDescription1",
					"LoadRate": "999",
					"PartNumber": "12345678",
					"DealerNet": "9.99",
					"Profit": "15.00",
					"Retails": "24.99",
					"Ratings": "3"
				}, {
					"TireFitment": "Acceptable",
					"TireCategory": "All-Weather",
					"TireBrandDesc": "BranDescription1",
					"LoadRate": "999",
					"PartNumber": "12345678",
					"DealerNet": "9.99",
					"Profit": "15.00",
					"Retails": "24.99",
					"Ratings": "4"
				}, {
					"TireFitment": "Perfect",
					"TireCategory": "Summer",
					"TireBrandDesc": "BranDescription1",
					"LoadRate": "999",
					"PartNumber": "12345678",
					"DealerNet": "9.99",
					"Profit": "15.00",
					"Retails": "24.99",
					"Ratings": "3"
				}, {
					"TireFitment": "OE",
					"TireCategory": "All-Season",
					"TireBrandDesc": "BranDescription1",
					"LoadRate": "999",
					"PartNumber": "12345678",
					"DealerNet": "9.99",
					"Profit": "15.00",
					"Retails": "24.99",
					"Ratings": "1"
				}, {
					"TireFitment": "Perfect",
					"TireCategory": "Winter",
					"TireBrandDesc": "BranDescription1",
					"LoadRate": "999",
					"PartNumber": "12345678",
					"DealerNet": "9.99",
					"Profit": "15.00",
					"Retails": "24.99",
					"Ratings": "5"
				}],
				"Filters": [{
					"type": "TireBrand",
					"values": [{
						"text": "Goodyear"
					}, {
						"text": "Dunlop"
					}, {
						"text": "Kelly"
					}, {
						"text": "FireStone"
					}]
				}, {
					"type": "TireFitment",
					"values": [{
						"text": "Perfect"
					}, {
						"text": "Acceptable"
					}, {
						"text": "OE"
					}, {
						"text": "Other"
					}]
				}, {
					"type": "TireCategory",
					"values": [{
						"text": "All-Season"
					}, {
						"text": "Winter"
					}, {
						"text": "Summer"
					}, {
						"text": "All-Weather"
					}]
				}, {
					"type": "TireStatus",
					"values": [{
						"text": "Active"
					}, {
						"text": "Discontinued"
					}]
				}, {
					"type": "TirePrice",
					"values": [{
						"text": "Under $100"
					}, {
						"text": "$100 - $150"
					}, {
						"text": "$151 - $200"
					}, {
						"text": "$201 - $250"
					}, {
						"text": "$251 - $300"
					}, {
						"text": "Over $300"
					}]
				}, {
					"type": "Other",
					"values": [{
						"text": "Show Dealer Net"
					}, {
						"text": "Use Preview Markup"
					}]
				}]
			};
			_that.oSelectTireJSONModel.setData(_that.objList);
			_that.oSelectTireJSONModel.updateBindings();
		},

		/*Functions for Table Checkbox options*/
		onCheckPress: function (oCheck) {
			console.log("Check Pressed", oCheck);
			var oCheckText = oCheck.getSource().getProperty("text");
			if (oCheckText == "Show Dealer Net") {
				if (oCheck.getParameter("selected") == true) {
					_that._oViewModel.setProperty("/enableDealerNet", true);
					_that._oViewModel.setProperty("/enableProfit", true);
					// _that.oTable.getColumns()[5].setVisible(true);
					// _that.oTable.getColumns()[6].setVisible(true);
				} else {
					_that._oViewModel.setProperty("/enableDealerNet", false);
					_that._oViewModel.setProperty("/enableProfit", false);
					// _that.oTable.getColumns()[5].setVisible(false);
					// _that.oTable.getColumns()[6].setVisible(false);
				}
			}
		},

		onPressBreadCrumb: function (oEvtLink) {
			// var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("Routemaster");
		},
		NavBackToSearch: function () {
			_that.getRouter().navTo("Routemaster");
			sap.ushell.components.SearchOptionVal.setValue("");
			sap.ushell.components.ModelSeriesCombo.setSelectedKey();
			sap.ushell.components.SearchOptionVal2.setSelectedKey();
		},
		handleFacetConfirm: function (oEvent) {
			// debugger;
			// _that.oTable.getColumns()[5].setVisible(false);
			// _that.oTable.getColumns()[6].setVisible(false);
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource();
			// this._filterModel(oFacetFilter);
		},

		// _filterModel: function (oFacetFilter) {
		// 	// debugger;
		// 	var mFacetFilterLists = oFacetFilter.getLists().filter(function (oList) {
		// 		return oList.getSelectedItems().length;
		// 	});

		// 	if (mFacetFilterLists.length) {
		// 		// Build the nested filter with ORs between the values of each group and
		// 		// ANDs between each group
		// 		var oFilter = new Filter(mFacetFilterLists.map(function (oList) {
		// 			return new Filter(oList.getSelectedItems().map(function (oItem) {
		// 				return new Filter(oList.getTitle(), "EQ", oItem.getText());
		// 			}), false);
		// 		}), true);
		// 		this._applyFilter(oFilter);
		// 	} else {
		// 		this._applyFilter([]);
		// 	}
		// },
		// _applyFilter: function (oFilter) {
		// 	_that.oTable.getColumns()[5].setVisible(false);
		// 	_that.oTable.getColumns()[6].setVisible(false);
		// 	for (var i = 0; i < oFilter.aFilters.length; i++) {
		// 		console.log(oFilter.aFilters[i]);
		// 		for (var j = 0; j < oFilter.aFilters[i].aFilters.length; j++) {
		// 			console.log(oFilter.aFilters[i].aFilters[j]);
		// 			if (oFilter.aFilters[i].aFilters[j].oValue1 == "Show Dealer Net") {
		// 				console.log("Show Dealer and Profit Columns");
		// 				_that.oTable.getColumns()[5].setVisible(true);
		// 				_that.oTable.getColumns()[6].setVisible(true);
		// 			} else {
		// 				_that.oTable.getColumns()[5].setVisible(false);
		// 				_that.oTable.getColumns()[6].setVisible(false);
		// 			}
		// 		}
		// 	}
		// 	// Get the table (last thing in the VBox) and apply the filter
		// 	var aVBoxItems = this.byId("idVBox").getItems();
		// 	var oTable = aVBoxItems[aVBoxItems.length - 1];
		// 	oTable.getBinding("rows").filter(oFilter);
		// },
		// handleFacetFilterReset: function (oEvent) {
		// 	var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
		// 	var aFacetFilterLists = oFacetFilter.getLists();
		// 	for (var i = 0; i < aFacetFilterLists.length; i++) {
		// 		aFacetFilterLists[i].setSelectedKeys();
		// 	}
		// 	this._applyFilter([]);
		// },
		// handleListClose: function (oEvent) {
		// 	// Get the Facet Filter lists and construct a (nested) filter for the binding
		// 	var oFacetFilter = oEvent.getSource().getParent();
		// 	this._filterModel(oFacetFilter);
		// },

		onRowPress: function (oRowEvt) {
			_that.getRouter().navTo("tireQuotation", {
				rowData: JSON.stringify(oRowEvt.getSource().getModel("SelectTireJSONModel").getProperty(oRowEvt.mParameters.rowBindingContext.sPath))
			});
		},

		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_that.getRouter().navTo("Routemaster");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ReportError")) {
				_that.getRouter().navTo("reportError");
			}
		},
		onExit: function () {
			_that.destroy();
			_that.oSelectTireJSONModel.refresh();
		}
	});
});