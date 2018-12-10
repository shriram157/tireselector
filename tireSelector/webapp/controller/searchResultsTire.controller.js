var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/Filter',
	'sap/m/ObjectIdentifier',
	'tireSelector/controller/BaseController',
	"sap/ui/core/routing/History"
], function (Controller, JSONModel, ResourceModel, Filter, ObjectIdentifier, BaseController, History) {
	"use strict";

	return BaseController.extend("tireSelector.controller.searchResultsTire", {
		onInit: function () {
			_that = this;

			_that.oSelectTireJSONModel = new sap.ui.model.json.JSONModel();
			_that.getView().setModel(_that.oSelectTireJSONModel, "SelectTireJSONModel");

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
				_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				_that.getView().setModel(_that.oI18nModel, "i18n");
				_that.sCurrentLocale = 'FR';
			} else {
				_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				_that.getView().setModel(_that.oI18nModel, "i18n");
				_that.sCurrentLocale = 'EN';
			}

			_that.getRouter().attachRouteMatched(function (oEvent) {
				_that.oTable = _that.getView().byId("idTireSelectionTable");
				_that.oTireFitmentJSONModel = new sap.ui.model.json.JSONModel();

				var sLocation = window.location.host;
				var sLocation_conf = sLocation.search("webide");
				if (sLocation_conf == 0) {
					_that.sPrefix = "/tireSelector-dest";
				} else {
					_that.sPrefix = "";
				}
				_that.nodeJsUrl = _that.sPrefix + "/node";
				var filterData;

				if (oEvent.getParameter("arguments").modelData !== undefined) {
					_that.oModelData = JSON.parse(oEvent.getParameter("arguments").modelData);
					filterData = "?$filter=ZtireSize eq '" + _that.oModelData.ZtireSize + "'&$expand=FitmentToCharac";

				} else if (oEvent.getParameter("arguments").tireData !== undefined) {
					_that.oTireData = JSON.parse(oEvent.getParameters().arguments.tireData);
					filterData = "?$filter=ZtireSize eq '" + _that.oTireData.ZtireSize + "'&$expand=FitmentToCharac";
				}
				if (filterData !== undefined) {
					_that.oFitmentModel = _that.getOwnerComponent().getModel("FitmentModel");
					_that.oFitmentModel.read("/ZC_FitmentSet" + filterData, {
						success: $.proxy(function (oData) {
							console.log("Initial load Data", oData);
							_that.FitmentToCharac = {
								"results": []
							};
							for (var n = 0; n < oData.results[0].FitmentToCharac.results.length; n++) {
								if (oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT == "PF") {
									oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT = "Perfect";
								} else if (oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT == "AF") {
									oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT = "Acceptable";
								} else if (oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT == "OE") {
									oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT = "OE";
								} else if (oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT == "OF") {
									oData.results[0].FitmentToCharac.results[n].TIRE_FITMENT = "Other";
								}
							}

							_that.tempStorage = oData.results[0].FitmentToCharac.results;
							_that.Filters = [{
								"type": "Tire Fitment",
								"values": []
							}, {
								"type": "Tire Brand",
								"values": []
							}, {
								"type": "Tire Speed Rating",
								"values": []
							}, {
								"type": "Tire MFG Part No",
								"values": []
							}, {
								"type": "Tire Category",
								"values": []
							}];
							for (var l = 0; l < oData.results[0].FitmentToCharac.results.length; l++) {
								_that.Filters[0].values.push({
									"text": oData.results[0].FitmentToCharac.results[l].TIRE_FITMENT
								});
								_that.Filters[1].values.push({
									"text": oData.results[0].FitmentToCharac.results[l].TIRE_BRAND_NAME
								});
								_that.Filters[2].values.push({
									"text": oData.results[0].FitmentToCharac.results[l].TIRE_SPEED_RATING
								});
								_that.Filters[3].values.push({
									"text": oData.results[0].FitmentToCharac.results[l].TIRE_MFG_PART_NUM
								});
								_that.Filters[4].values.push({
									"text": oData.results[0].FitmentToCharac.results[l].TIRE_CATEGORY
								});
							}

							$.each(oData.results[0].FitmentToCharac.results, function (i, item) {
								_that.FitmentToCharac.results.push({
									"Tire Fitment": item.TIRE_FITMENT,
									"Tire Speed Rating": item.TIRE_SPEED_RATING,
									"Tire Load Rating": item.TIRE_LOAD_RATING,
									"Tire Brand": item.TIRE_BRAND_NAME,
									"Tire Category": item.TIRE_CATEGORY,
									"Tire Brand ID": item.TIRE_BRAND_ID,
									"Material": item.MATERIAL,
									"Tire MFG Part No": item.TIRE_MFG_PART_NUM
								});
							});
							_that.oTireFitmentJSONModel.setData(null);
							_that.oTireFitmentJSONModel.setData(_that.FitmentToCharac);
							_that.oTireFitmentJSONModel.getData().Filters = _that.Filters;
							console.log("TireFitmentJSONModel Data", _that.oTireFitmentJSONModel.getData());
							_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							_that.oTireFitmentJSONModel.refresh(true);
							_that.oTireFitmentJSONModel.updateBindings();
						}, this),
						error: function (oError) {
							console.log("Error in fetching ZC_FitmentSet data", oError);
						}
					});
				}
			}, _that);

			_that.oTable = _that.getView().byId("idTireSelectionTable");
			var oBindingInfo = _that.oTable.getBindingInfo("rows");
			_that.oTable.bindRows(oBindingInfo);
			this.byId("idVBox").addItem(_that.oTable);
		},

		/*Functions for Table Checkbox options*/
		onCheckPress: function (oCheck) {
			console.log("Check Pressed", oCheck);
			var oCheckText = oCheck.getSource().getProperty("text");
			if (oCheckText == "Show Dealer Net") {
				if (oCheck.getParameter("selected") == true) {
					_that._oViewModel.setProperty("/enableDealerNet", true);
					_that._oViewModel.setProperty("/enableProfit", true);
				} else {
					_that._oViewModel.setProperty("/enableDealerNet", false);
					_that._oViewModel.setProperty("/enableProfit", false);
				}
			}
		},

		onPressBreadCrumb: function (oEvtLink) {
			// var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("Routemaster");
		},

		NavBackToSearch: function () {
			_that.oTireFitmentJSONModel.refresh(true);
			sap.ushell.components.SearchOptionVIN.setValue("");
			sap.ushell.components.SearchOptionTireSize.setValue("");
			sap.ushell.components.ModelSeriesCombo.setSelectedKey();
			sap.ushell.components.SearchOptionVehicle.setSelectedKey();
			// var oHistory, sPreviousHash;

			// oHistory = History.getInstance();
			// sPreviousHash = oHistory.getPreviousHash();

			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {
			this.getRouter().navTo("Routemaster", {}, true);
			// }
		},

		//Facet Filter logic starts here
		_applyFilter: function (oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var aVBoxItems = this.getView().byId("idVBox").getItems();
			var oTable = aVBoxItems[aVBoxItems.length - 1];
			// oTable.getBinding("items").filter(oFilter);
			oTable.getBinding().filter(oFilter);
		},

		handleFacetFilterReset: function (oEvent) {
			var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var aFacetFilterLists = oFacetFilter.getLists();
			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			this._applyFilter([]);
		},

		handleListClose: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource().getParent();
			this._filterModel(oFacetFilter);
		},

		handleFacetConfirm: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource();
			this._filterModel(oFacetFilter);
			// MessageToast.show("confirm event fired");
		},

		_filterModel: function (oFacetFilter) {
			var mFacetFilterLists = oFacetFilter.getLists().filter(function (oList) {
				return oList.getSelectedItems().length;
			});

			if (mFacetFilterLists.length) {
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
				var oFilter = new Filter(mFacetFilterLists.map(function (oList) {
					return new Filter(oList.getSelectedItems().map(function (oItem) {
						return new Filter(oList.getTitle(), "EQ", oItem.getText());
					}), false);
				}), true);
				this._applyFilter(oFilter);
			} else {
				this._applyFilter([]);
			}
		},
		//Facet Filter logic ends here

		onRowPress: function (oRowEvt) {
			var oPath = oRowEvt.getSource().getModel("TireFitmentJSONModel").getProperty(oRowEvt.mParameters.rowBindingContext.sPath);
			_that.getRouter().navTo("tireQuotation", {
				rowData: JSON.stringify(oPath)
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
			_that.oTireFitmentJSONModel.setData(null);
			_that.oTireFitmentJSONModel.refresh(true);
		}
	});
});