var _that, DealerNet, oTable, tempData;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/Filter',
	'sap/m/ObjectIdentifier',
	'tireSelector/controller/BaseController',
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, JSONModel, ResourceModel, Filter, ObjectIdentifier, BaseController, History, MessageBox) {
	"use strict";

	return BaseController.extend("tireSelector.controller.searchResultsTire", {
		onInit: function () {
			_that = this;
			_that.oGlobalBusyDialog = new sap.m.BusyDialog();
			sap.ushell.components.oTable = _that.getView().byId("idTireSelectionTable");
			oTable = _that.getView().byId("idTireSelectionTable");

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
					_that._oViewModel = new sap.ui.model.json.JSONModel({
						busy: false,
						delay: 0,
						enableDealerNet: false,
						enableProfit: false
					});

					_that.getView().setModel(_that._oViewModel, "propertiesModel");
					oTable = _that.getView().byId("idTireSelectionTable");
					_that.oTireFitmentJSONModel = new sap.ui.model.json.JSONModel();

					if (oEvent.getParameter("arguments").tireData == "selectDifferentTire") {
						_that.oTireFitmentJSONModel.refresh(true);
						_that.oTireFitmentJSONModel.updateBindings(true);
					} else {

						oTable = _that.getView().byId("idTireSelectionTable");
						var sLocation = window.location.host;
						var sLocation_conf = sLocation.search("webide");
						if (sLocation_conf == 0) {
							_that.sPrefix = "/tireSelector-dest";
						} else {
							_that.sPrefix = "";
						}
						_that.nodeJsUrl = _that.sPrefix + "/node";

						_that.oPriceModel = new sap.ui.model.json.JSONModel();
						// _that.getView().setModel(_that.oPriceModel, "PriceModel");
						// _that.oService = this.nodeJsUrl + "/MD_PRODUCT_FS_SRV";
						_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");
						// _that.oPriceServiceModel = new sap.ui.model.odata.ODataModel(_that.oService, true);
						_that.DealerData = sap.ui.getCore().getModel("DealerModel").getData();

						if (sap.ui.getCore().getModel("ProdMarkupModel") != undefined && sap.ui.getCore().getModel("ProdMarkupModel").getData().length !=
							undefined) {
							_that.ProductMarkupModel = sap.ui.getCore().getModel("ProdMarkupModel");
							console.log("Product Markup Data", _that.ProductMarkupModel.getData());
						}
						// _that.oBusinessPartnerModel = new sap.ui.model.odata.ODataModel(this.nodeJsUrl + "/API_BUSINESS_PARTNER", true);
						_that.oBusinessPartnerModel = _that.getOwnerComponent().getModel("BusinessPartnerModel");
						_that.oBusinessPartnerModel.read("/A_BusinessPartner?$filter= zstatus eq ' '", {
							success: $.proxy(function (oDataResponse) {
								console.log("Business Partner Data", oDataResponse.results);
								_that.oBusinessPartnerModel = new JSONModel();
								_that.getView().setModel(_that.oBusinessPartnerModel, "BusinessPartnerModel");
								sap.ui.getCore().setModel(_that.oBusinessPartnerModel, "BusinessPartnerModel");
								_that.oBusinessPartnerModel.setData(oDataResponse);
								_that.oBusinessPartnerModel.updateBindings(true);
							}, _that),
							error: function (oError) {
								console.log("Error in fetching data", oError);
							}
						});
						var filterData;
						if (oEvent.getParameter("arguments").modelData !== undefined) {
							_that.oModelData = JSON.parse(oEvent.getParameter("arguments").modelData);
							filterData = "?$filter=ZtireSize eq '" + _that.oModelData.ZtireSize + "'&$expand=FitmentToCharac";

						} else if (oEvent.getParameter("arguments").tireData !== undefined) {
							_that.oTireData = JSON.parse(oEvent.getParameters().arguments.tireData);
							filterData = "?$filter=ZtireSize eq '" + _that.oTireData.ZtireSize + "'&$expand=FitmentToCharac";
						}
						if (filterData !== undefined) {
							_that.oGlobalBusyDialog = new sap.m.BusyDialog();
							_that.oGlobalBusyDialog.open();
							// _that.oFitmentModel = new sap.ui.model.odata.ODataModel(this.nodeJsUrl + "/Z_TIRESELECTOR_SRV", true);
							_that.oFitmentModel = _that.getOwnerComponent().getModel("FitmentModel");
							_that.tempModel = new sap.ui.model.json.JSONModel();
							_that.oFitmentModel.read("/ZC_FitmentSet" + filterData, {
								success: $.proxy(function (oData) {
									console.log("Initial load Data", oData.results[0].FitmentToCharac);
									_that.tempModel.setData(oData.results[0].FitmentToCharac);
									_that.tempModel.updateBindings(true);
									if (_that.tempModel.getData().results.length == 0) {
										_that.oGlobalBusyDialog.close();
										_that.oTireFitmentJSONModel.setData({});
										_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										_that.oTireFitmentJSONModel.updateBindings(true);
										sap.m.MessageBox.error(
											"NO Data found, Please update search criteria", {
												actions: [sap.m.MessageBox.Action.CLOSE],
												onClose: function (oAction) {
													_that.oTireFitmentJSONModel.setData({});
													_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
													_that.oTireFitmentJSONModel.refresh(true);
													_that.oTireFitmentJSONModel.updateBindings(true);
												}
											}
										);
									}

									_that.FitmentToCharac = {
										"results": []
									};
									for (var n = 0; n < _that.tempModel.getData().results.length; n++) {
										//Check with Pranay if we can skip
										if (_that.tempModel.getData().results[n].TIRE_CATEGORY == "?") {
											_that.tempModel.getData().results[n].TIRE_CATEGORY = "";
										}
										if (_that.tempModel.getData().results[n].TIRE_BRAND_NAME == "?") {
											_that.tempModel.getData().results[n].TIRE_BRAND_NAME = "";
										}
										if (_that.tempModel.getData().results[n].TIRE_MFG_PART_NUM == "?") {
											_that.tempModel.getData().results[n].TIRE_MFG_PART_NUM = "";
										}
										//TIRE_MFG_PART_NUM

										if (_that.tempModel.getData().results[n].TIRE_FITMENT == "PF") {
											_that.tempModel.getData().results[n].TIRE_FITMENT = "Perfect";
										} else if (_that.tempModel.getData().results[n].TIRE_FITMENT == "AF") {
											_that.tempModel.getData().results[n].TIRE_FITMENT = "Acceptable";
										} else if (_that.tempModel.getData().results[n].TIRE_FITMENT == "OE") {
											_that.tempModel.getData().results[n].TIRE_FITMENT = "OE";
										} else if (_that.tempModel.getData().results[n].TIRE_FITMENT == "OF") {
											_that.tempModel.getData().results[n].TIRE_FITMENT = "Other";
										}
										_that.tempModel.getData().results[n].TIRE_BRAND_ID = "2400100314";
										// _that.tempModel.getData().results[n].MATERIAL = "4261A53341";

										var tireBrand = _that.tempModel.getData().results[n].TIRE_BRAND_ID;
										if (sap.ui.getCore().getModel("ProdMarkupModel") != undefined && sap.ui.getCore().getModel("ProdMarkupModel").getData()
											.length !=
											undefined) {
											_that.ProductMarkupModel = sap.ui.getCore().getModel("ProdMarkupModel");
											for (var k = 0; k < _that.ProductMarkupModel.getData().results.length; k++) {
												if (tireBrand == _that.ProductMarkupModel.getData().results[k].Manufacturer_code) {
													var Live_Markup_Percentage = _that.ProductMarkupModel.getData().results[k].Live_Markup_Percentage;
													_that.tempModel.getData().results[n].Live_Markup_Percentage = Live_Markup_Percentage;
												}
											}
										} else {
											_that.tempModel.getData().results[n].Live_Markup_Percentage = null;
										}
									}
									_that.msgFlag = false;

									function getDealerNet(oMaterial) {
										// tempData = [];
										_that.Division = _that.DealerData.attributes[0].Division;
										_that.Doctype = "ZAF";
										_that.SalesOrg = "7000";
										_that.DistrChan = "10";
										_that.SoldtoParty = _that.DealerData.attributes[0].BusinessPartnerKey;
										var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype +
											"' and SalesOrg eq '" + _that.SalesOrg + "' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" + _that
											.SoldtoParty + "' and Material eq '" + oMaterial + "'";
										// _that.oPriceServiceModel = new sap.ui.model.odata.ODataModel(
										// "https://tireselector.cfapps.us10.hana.ondemand.com/node/MD_PRODUCT_FS_SRV/", true);
										tempData = [];
										_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");
										_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
											success: $.proxy(function (oDataPrice) {
												jQuery.sap.delayedCall(2000, _that, function () {
													for (var l = 0; l < oDataPrice.results.length; l++) {
														var CndType = oDataPrice.results[l].CndType;
														if (CndType == "ZPG4") {
															DealerNet = oDataPrice.results[l].Amount;
															tempData.push({
																"DealerNet": DealerNet,
																"oMat": oMaterial
															});
															console.log("fetched data", tempData);
															return tempData;
														}
													}
												});
											}, _that),
											error: function (oError) {
												console.log("Error in fetching ZC_PriceSet", oError);
											}
										});
									}
									for (var n = 0; n < _that.tempModel.getData().results.length; n++) {
										var oMat = _that.tempModel.getData().results[n].MATERIAL;
										getDealerNet(oMat);
										console.log("dealernetPrice", tempData);
									}

									jQuery.sap.delayedCall(5000, _that, function () {
										console.log("Updated Tempdata", tempData);

										for (var l = 0; l < _that.tempModel.getData().results.length; l++) {
											var checkMat = _that.tempModel.getData().results[l].MATERIAL;
											var dealerNet = _that.tempModel.getData().results[l].DealerNet;
											for (var k = 0; k < tempData.length; k++) {
												if (tempData[k].oMat === checkMat) {
													console.log("Odata material", checkMat);
													console.log("price material", oMat);
													dealerNet = tempData[k].DealerNet;
												}
											}
											_that.tempModel.getData().results[l].DealerNet = dealerNet;
											_that.tempModel.updateBindings(true);
										}
										if (_that.msgFlag == true) {
											sap.m.MessageBox.error(
												"Missing Pricing", {
													actions: [sap.m.MessageBox.Action.CLOSE],
													onClose: function (oAction) {
														_that.msgFlag = false;
													}
												}
											);
										}

										console.log("_that.tempModel", _that.tempModel.getData().results);
										_that.tempStorage = _that.tempModel.getData().results;
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
										for (var l = 0; l < _that.tempModel.getData().results.length; l++) {
											_that.Filters[0].values.push({
												"text": _that.tempModel.getData().results[l].TIRE_FITMENT
											});
											_that.Filters[1].values.push({
												"text": _that.tempModel.getData().results[l].TIRE_BRAND_NAME
											});
											_that.Filters[2].values.push({
												"text": _that.tempModel.getData().results[l].TIRE_SPEED_RATING
											});
											_that.Filters[3].values.push({
												"text": _that.tempModel.getData().results[l].TIRE_MFG_PART_NUM
											});
											_that.Filters[4].values.push({
												"text": _that.tempModel.getData().results[l].TIRE_CATEGORY
											});
											if (_that.tempModel.getData().results[l].DealerNet !== null || _that.tempModel.getData().results[l].DealerNet !=
												undefined) {
												_that.tempModel.getData().results[l].Retails = _that.tempModel.getData().results[l].DealerNet - _that.tempModel.getData()
													.results[l].Live_Markup_Percentage;
												_that.tempModel.getData().results[l].Profit = _that.tempModel.getData().results[l].Retails - _that.tempModel.getData()
													.results[l].DealerNet;
												// _that.tempModel.updateBindings(true);
											} else {
												_that.msgFlag = true;
												_that.tempModel.getData().results[l].Profit = 0;
												_that.tempModel.getData().results[l].Retails = 0;
												_that.tempModel.getData().results[l].DealerNet = 0;
												// _that.tempModel.updateBindings(true);
											}
											_that.tempModel.updateBindings(true);
										}

										// _that.tempModel.getData().Filters = _that.Filters;
										console.log("updated odata", _that.tempModel.getData());
										$.each(_that.tempModel.getData().results, function (i, item) {
											_that.FitmentToCharac.results.push({
												"Tire Fitment": item.TIRE_FITMENT,
												"Tire Speed Rating": item.TIRE_SPEED_RATING,
												"Tire Load Rating": item.TIRE_LOAD_RATING,
												"Tire Brand": item.TIRE_BRAND_NAME,
												"Tire Category": item.TIRE_CATEGORY,
												"Tire Brand ID": item.TIRE_BRAND_ID,
												"Material": item.MATERIAL,
												"Tire MFG Part No": item.TIRE_MFG_PART_NUM,
												"Dealer Net": decimalFormatter(item.DealerNet),
												"Retails": decimalFormatter(item.Retails),
												"Profit": decimalFormatter(item.Profit),
												"TireSize": item.TIRE_SIZE
											});
										});
										// _that.oTireFitmentJSONModel.setData(null);
										_that.oTireFitmentJSONModel.setData(_that.FitmentToCharac);
										_that.oTireFitmentJSONModel.getData().Filters = _that.Filters;
										// if (oTable != undefined) {
										// 	oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										// 	// var oBindingInfo = oTable.getBindingInfo("rows");
										// 	// oTable.bindRows(oBindingInfo);
										// 	// _that.byId("idVBox").addItem(oTable);
										// }
										// else {
										_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ushell.components.FacetFilters.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										// sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										// 	_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										// 	var oBindingInfo = sap.ushell.components.oTable.getBindingInfo("rows");
										// 	_that.byId("idVBox").addItem(sap.ushell.components.oTable);
										// }
										_that.oTireFitmentJSONModel.refresh(true);
										_that.oTireFitmentJSONModel.updateBindings(true);
										console.log("TireFitmentJSONModel Data", _that.oTireFitmentJSONModel.getData());

										_that.oGlobalBusyDialog.close();
									});
								}, this),
								error: function (oError) {
									console.log("Error in fetching data", oError);
								}
							});

							function decimalFormatter(oDecVal) {
								if (oDecVal != undefined || oDecVal != null) {
									var returnVal = parseFloat(oDecVal).toFixed(2);
									if (returnVal == 0.00) {
										return "";
									} else {
										return returnVal;
									}
								} else {
									return "";
								}
							}
						}
					}

				},
				_that);

			_that.oTable = _that.getView().byId("idTireSelectionTable");
			var oBindingInfo = _that.oTable.getBindingInfo("rows");
			_that.oTable.bindRows(oBindingInfo);
			this.byId("idVBox").addItem(_that.oTable);
			sap.ushell.components.FacetFilters = _that.byId("idVBox");
		},

		decimalFormatter: function (oDecVal) {
			if (oDecVal != undefined || oDecVal != null) {
				var returnVal = parseFloat(oDecVal).toFixed(2);
				if (returnVal == 0.00) {
					return "";
				} else {
					return returnVal;
				}
			} else {
				return "";
			}
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
			_that.getRouter().navTo("master");
		},

		NavBackToSearch: function () {
			// _that.oTireFitmentJSONModel.setData();
			// _that.oTireFitmentJSONModel.updateBindings(true);

			// var oHistory, sPreviousHash;

			// oHistory = History.getInstance();
			// sPreviousHash = oHistory.getPreviousHash();

			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {

			_that.oTireFitmentJSONModel.setData();
			_that.oTireFitmentJSONModel.refresh(true);
			_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			_that.oTireFitmentJSONModel.updateBindings(true);
			this.getRouter().navTo("master", {}, true);
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

			oPath.TireSize = oPath.TireSize.replace("/", "%2F");
			_that.getRouter().navTo("tireQuotation", {
				rowData: JSON.stringify(oPath)
			});
		},

		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_that.getRouter().navTo("master");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ReportError")) {
				_that.getRouter().navTo("reportError");
			}
		},
		onExit: function () {
			// _that.oTireFitmentJSONModel.setData();
			// _that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			_that.oTireFitmentJSONModel.refresh(true);
			_that.destroy();
		}
	});
});