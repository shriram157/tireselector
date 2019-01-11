var _that, DealerNet, MSRP, oTable, tempData;
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
				// oTable = _that.getView().byId("idTireSelectionTable");
				sap.ushell.components.oTable = _that.getView().byId("idTireSelectionTable");

				var sLocation = window.location.host;
				var sLocation_conf = sLocation.search("webide");
				if (sLocation_conf == 0) {
					this.sPrefix = "/tireSelector-dest"; //ecpSales_node_secured
					_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
				} else {
					this.sPrefix = "";
					// this.attributeUrl = "/userDetails/attributes";
				}
				// this.sPrefix = "";
				_that.nodeJsUrl = this.sPrefix + "/node";

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

				_that.getOwnerComponent().getRouter().attachRoutePatternMatched(_that._oSelectTireRoute, _that);

				_that.oTable = _that.getView().byId("idTireSelectionTable");
				var oBindingInfo = _that.oTable.getBindingInfo("rows");
				_that.oTable.bindRows(oBindingInfo);
				this.byId("idVBox").addItem(_that.oTable);
				sap.ushell.components.FacetFilters = _that.byId("idVBox");
			},

			_oSelectTireRoute: function (oEvent) {
				_that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");
				_that.oProdMarkupModel = new sap.ui.model.json.JSONModel();
				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				console.log("XSO model data", _that.oXSOServiceModel);

				_that.oXSOServiceModel.read("/DealerMarkUp", {
					success: $.proxy(function (oData) {
						if (oData.results.length > 0) {
							console.log("XSO data", oData);
							_that.oProdMarkupModel.setData(oData);
							_that.oProdMarkupModel.updateBindings(true);
							_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
						} else {
							sap.m.MessageBox.error(
								"NO Data found for Product Markup"
							);
						}
					}, _that),
					error: function (oError) {
						sap.m.MessageBox.error(
							"NO Data found for Product Markup"
						);
					}
				});

				sap.ushell.components.oTable.getColumns()[5].setVisible(false);
				sap.ushell.components.oTable.getColumns()[6].setVisible(false);
				sap.ushell.components.oTable.getToolbar().getContent()[0].setSelected(false);
				sap.ushell.components.oTable.getToolbar().getContent()[1].setSelected(false);

				_that._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableDealerNet: false,
					enableProfit: false,
					enableProdMarkup: false
				});

				_that.getView().setModel(_that._oViewModel, "FitmentPageModel");

				_that.userDetails = sap.ui.getCore().getModel("DealerModel").getData();
				_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
				// _that.dealerCode = _that.userDetails.userContext.userAttributes.DealerCode[0];
				// _that.UserName = _that.userDetails.userContext.userInfo.logonName;

				//uncomment below for cloud testing
				var scopes = _that.userDetails.userContext.scopes;
				if (scopes[1] == "tireSelectorS!t1188.ViewTireQuotes" && scopes[2] == "tireSelectorS!t1188.ManagerProductMarkups") {
					_that._oViewModel.setProperty("/enableProdMarkup", true);
				} else {
					_that._oViewModel.setProperty("/enableProdMarkup", false);
				}

				_that.oTireFitmentJSONModel = new sap.ui.model.json.JSONModel();
				oTable = _that.getView().byId("idTireSelectionTable");
				// var sLocation = window.location.host;
				// var sLocation_conf = sLocation.search("webide");
				// if (sLocation_conf == 0) {
				// 	_that.sPrefix = "/tireSelector-dest";
				// } else {
				// 	_that.sPrefix = "";
				// }
				// _that.nodeJsUrl = _that.sPrefix + "/node";
				if (oEvent.getParameter("arguments").tireData == "selectDifferentTire") {
					_that.oTireFitmentJSONModel.refresh(true);
					_that.oTireFitmentJSONModel.updateBindings(true);
				} else {
				_that.oPriceModel = new sap.ui.model.json.JSONModel();
				_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");

				var filterData;
				if (oEvent.getParameter("arguments").modelData !== undefined) {
					_that.oModelData = JSON.parse(oEvent.getParameter("arguments").modelData);
					filterData = "?$filter=ZtireSize eq '" + _that.oModelData.ZtireSize + "'&$expand=FitmentToCharac";

				} else if (oEvent.getParameter("arguments").tireData !== undefined) {
					_that.oTireData = JSON.parse(oEvent.getParameters().arguments.tireData);
					filterData = "?$filter=ZtireSize eq '" + _that.oTireData.TIRE_SIZE + "'&$expand=FitmentToCharac";
				}
				if (filterData !== undefined) {
					sap.ui.core.BusyIndicator.show();
					// _that.oFitmentModel = new sap.ui.model.odata.ODataModel(this.nodeJsUrl + "/Z_TIRESELECTOR_SRV", true);
					_that.oFitmentModel = _that.getOwnerComponent().getModel("FitmentModel");
					_that.tempModel = new sap.ui.model.json.JSONModel();

					// _that.oGlobalBusyDialog = new sap.m.BusyDialog();

					_that.oFitmentModel.read("/ZC_FitmentSet" + filterData, {
						success: $.proxy(function (oData) {
							_that.oTireFitmentJSONModel.setData(null);
							_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							sap.ushell.components.FacetFilters.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
							_that.oTireFitmentJSONModel.updateBindings(true);
							if (oData.results.length > 0) {
								console.log("Initial load Data", oData.results[0].FitmentToCharac);
								_that.tempModel.setData(oData.results[0].FitmentToCharac);
								_that.tempModel.updateBindings(true);

								if (_that.tempModel.getData().results.length <= 0) {
									sap.m.MessageBox.error(
										"NO Data found, Please update search criteria", {
											actions: [sap.m.MessageBox.Action.CLOSE],
											onClose: function (oAction) {
												_that.oTireFitmentJSONModel.setData({});
												_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
												sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
												sap.ushell.components.FacetFilters.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
												_that.oTireFitmentJSONModel.refresh(true);
												_that.oTireFitmentJSONModel.updateBindings(true);
											}
										}
									);
								} else {
									jQuery.sap.delayedCall(500, _that, function () {
										console.log("Initial load is completed");
										_that.FitmentToCharac = {
											"results": []
										};
										if (_that.tempModel.getData().results !== undefined) {
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

												var temp = _that.tempModel.getData().results[n];
												if (_that.oProdMarkupModel.getData().results != undefined) {
													if (_that.oProdMarkupModel.getData().results.length > 0) {
														_that.oProdMarkupModel = sap.ui.getCore().getModel("ProdMarkupModel");
														for (var k = 0; k < _that.oProdMarkupModel.getData().results.length; k++) {
															// if (_that.oProdMarkupModel.getData().results[k].IsLive == "Y") {
																if (temp.TIRE_BRAND_NAME == _that.oProdMarkupModel.getData().results[k].Manufacturer_code) {
																	if (_that.oProdMarkupModel.getData().results[k].Live_Markup_Percentage != undefined) {
																		temp.Live_Markup_Percentage = _that.oProdMarkupModel.getData().results[k].Live_Markup_Percentage;
																		_that.tempModel.updateBindings(true);
																	} else {
																		temp.Live_Markup_Percentage = 0;
																		_that.tempModel.updateBindings(true);
																	}
																}
															// }
															// if (_that.ProductMarkupModel.getData().results[k].IsLive == "") {
															if (temp.TIRE_BRAND_NAME == _that.oProdMarkupModel.getData().results[k].Manufacturer_code) {
																if (_that.oProdMarkupModel.getData().results[k].Preview_Markup_Percentage != undefined) {
																	temp.Preview_Markup_Percentage = _that.oProdMarkupModel.getData().results[k].Preview_Markup_Percentage;
																	_that.tempModel.updateBindings(true);
																} else {
																	temp.Preview_Markup_Percentage = 0;
																	_that.tempModel.updateBindings(true);
																}
															}
															// }
														}
													} else {
														temp.Live_Markup_Percentage = 0;
														temp.Preview_Markup_Percentage = 0;
														_that.tempModel.updateBindings(true);
													}
												}
												console.log("Live/preview values", _that.tempModel);
											}
										}
									});

									_that.msgFlag = false;

									function getDealerNet(oMaterial) {
										// sap.ui.core.BusyIndicator.show();
										_that.Division = _that.userDetails.DealerData.Division;
										_that.Doctype = "ZAF";
										_that.SalesOrg = "7000";
										_that.DistrChan = "10";
										_that.SoldtoParty = _that.userDetails.DealerData.BusinessPartner;
										var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype +
											"' and SalesOrg eq '" + _that.SalesOrg + "' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" +
											_that.SoldtoParty + "' and Material eq '" + oMaterial + "'";

										tempData = [];
										_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");
										_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
											success: $.proxy(function (oDataPrice) {
												if (oDataPrice.results.length > 0) {
													jQuery.sap.delayedCall(0, _that, function () {
														for (var l = 0; l < oDataPrice.results.length; l++) {
															var CndType = oDataPrice.results[l].CndType;
															var Amount = oDataPrice.results[l].Amount;
															if (CndType == "ZPG4") {
																if (Amount != "") {
																	DealerNet = Amount;
																}
															}
															if (CndType == "ZPM3") {
																if (Amount != "") {
																	MSRP = Amount;
																}
															} else if (CndType == "ZPM2") {
																if (Amount != "") {
																	MSRP = Amount;
																}
															}
														}
														tempData.push({
															"DealerNet": DealerNet,
															"MSRP": MSRP,
															"oMat": oMaterial
														});
														console.log("fetched MSRp DealerNet data", tempData);
													});
												} else {
													sap.m.MessageBox.error(
														"NO Data found for Pricing"
													);
													// _that.oGlobalBusyDialog.close();
												}
											}, _that),
											error: function (oError) {
												sap.ui.core.BusyIndicator.hide();
												sap.m.MessageBox.error(
													"NO Data found for Pricing"
												);
											}
										});
									}
									// if (_that.tempModel.getData().results != undefined) {
									for (var n = 0; n < _that.tempModel.getData().results.length; n++) {
										var oMat = _that.tempModel.getData().results[n].MATERIAL;
										getDealerNet(oMat);
										console.log("dealernetPrice", tempData);
									}

									jQuery.sap.delayedCall(4000, _that, function () {
										console.log("Updated Tempdata", tempData);
										if (_that.tempModel.getData().results.length > 0) {
											for (var l = 0; l < _that.tempModel.getData().results.length; l++) {
												var checkMat = _that.tempModel.getData().results[l].MATERIAL;
												var dealerNet = _that.tempModel.getData().results[l].DealerNet;
												for (var k = 0; k < tempData.length; k++) {
													if (tempData[k].oMat === checkMat) {
														dealerNet = tempData[k].DealerNet;
														MSRP = tempData[k].MSRP;
													}
												}
												_that.tempModel.getData().results[l].DealerNet = dealerNet;
												_that.tempModel.getData().results[l].MSRP = MSRP;
												_that.tempModel.updateBindings(true);
											}
											console.log("stored dealer/MSRP", _that.tempModel);
										} else {
											sap.ui.core.BusyIndicator.hide();
											sap.m.MessageBox.error(
												"NO Data found for Pricing"
											);
										}

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

											var tempTireData = _that.tempModel.getData().results[l];
											console.log("calculating Retails", _that.tempModel.getData().results[l]);
											if (tempTireData.DealerNet !== null && tempTireData.DealerNet != undefined) {
												if (tempTireData.Live_Markup_Percentage == undefined) {
													tempTireData.Live_Markup_Percentage = 0;
												}
												// if (Number(tempTireData.DealerNet) != 0 && Number(tempTireData.Live_Markup_Percentage !=0)) {
												// 	var livemarkupval = Number(tempTireData.DealerNet) * Number(tempTireData.Live_Markup_Percentage);
												// }
												if (tempTireData.Live_Markup_Percentage != "" && tempTireData.Live_Markup_Percentage != undefined) {
													if (Number(tempTireData.DealerNet) != 0) {
														_that.tempModel.getData().results[l].Retails = Number(tempTireData.DealerNet) + Number(tempTireData.Live_Markup_Percentage);
													}
												} else {
													if (Number(tempTireData.MSRP) != 0) {
														_that.tempModel.getData().results[l].Retails = Number(tempTireData.MSRP);
													}
												}
												_that.tempModel.getData().results[l].Profit = (Number(tempTireData.Retails)) - (Number(tempTireData.DealerNet));
												_that.tempModel.updateBindings(true);
												console.log("Updated retails value", _that.tempModel);
											} else {
												_that.msgFlag = true;
												_that.tempModel.getData().results[l].Profit = 0;
												_that.tempModel.getData().results[l].Retails = 0;
												_that.tempModel.getData().results[l].DealerNet = 0;
												_that.tempModel.updateBindings(true);
											}
											_that.tempModel.updateBindings(true);
										}

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
												"MSRP": item.MSRP,
												"DealerNet": item.DealerNet,
												"Retails": item.Retails,
												"Profit": item.Profit,
												"TireSize": item.TIRE_SIZE,
												"Model": item.Model,
												"Preview_Markup_Percentage": item.Preview_Markup_Percentage,
												"Live_Markup_Percentage": item.Live_Markup_Percentage
											});
										});

										_that.oTireFitmentJSONModel.setData(_that.FitmentToCharac);
										_that.oTireFitmentJSONModel.getData().Filters = _that.Filters;
										console.log("TireFitmentJSONModel Data", _that.oTireFitmentJSONModel.getData());

										_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										sap.ushell.components.FacetFilters.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");

										_that.oTireFitmentJSONModel.refresh(true);
										_that.oTireFitmentJSONModel.updateBindings(true);
										sap.ui.core.BusyIndicator.hide();
									});

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

									function decimalFormatter(oDecVal) {
										if (oDecVal != undefined && oDecVal != null && !isNaN(oDecVal)) {
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
							} else {
								sap.m.MessageBox.error("Server Request responded with no data", {
									actions: [sap.m.MessageBox.Action.CLOSE],
									onClose: function (oAction) {
										_that.oTireFitmentJSONModel.setData({});
										_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
										_that.oTireFitmentJSONModel.refresh(true);
										_that.oTireFitmentJSONModel.updateBindings(true);
									}
								});
							}

						}, _that),
						error: function (oError) {
							sap.ui.core.BusyIndicator.hide();
							sap.m.MessageBox.error(
								"NO Data found for Fitment"
							);
						}
					});
				}
			}
		},

		decimalFormatter: function (oDecVal) {
			if (oDecVal != undefined && oDecVal != null && !isNaN(oDecVal)) {
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

		onCheckPreview: function (oCheck) {
			var Model = oCheck.getSource().getParent().getParent().getModel("TireFitmentJSONModel");
			if (Model.getData().results !== undefined) {
				var oData = Model.getData().results;
				var l;
				if (oCheck.getParameters("selected").selected == true) {
					for (l = 0; l < oData.length; l++) {
						if (oData[l].DealerNet !== null && oData[l].DealerNet != undefined && oData[l].DealerNet !== "") {
							if (oData[l].Preview_Markup_Percentage != 0 && oData[l].Preview_Markup_Percentage != undefined) {
								oData[l].Retails = Number(oData[l].DealerNet) + Number(oData[l].Preview_Markup_Percentage);
								oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);

								_that.oTireFitmentJSONModel.refresh(true);
								_that.oTireFitmentJSONModel.updateBindings(true);
								sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
							} else {
								oData[l].Retails = Number(oData[l].MSRP);
								oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);

								_that.oTireFitmentJSONModel.refresh(true);
								_that.oTireFitmentJSONModel.updateBindings(true);
								sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
							}
						}
					}
				} else {
					for (l = 0; l < oData.length; l++) {
						if (oData[l].DealerNet !== null && oData[l].DealerNet != undefined && oData[l].DealerNet !== "") {
							if (oData[l].Live_Markup_Percentage != 0 && oData[l].Live_Markup_Percentage != undefined) {
								oData[l].Retails = Number(oData[l].DealerNet) + Number(oData[l].Live_Markup_Percentage);
								oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);

								_that.oTireFitmentJSONModel.refresh(true);
								_that.oTireFitmentJSONModel.updateBindings(true);
								sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
							} else {
								oData[l].Retails = Number(oData[l].MSRP);
								oData[l].Profit = Number(oData[l].Retails) - Number(oData[l].DealerNet);

								_that.oTireFitmentJSONModel.refresh(true);
								_that.oTireFitmentJSONModel.updateBindings(true);
								sap.ushell.components.oTable.getModel("TireFitmentJSONModel").updateBindings(true);
							}
						}
					}
				}
			}
		},

		/*Functions for Table Checkbox options*/
		onCheckPress: function (oCheck) {
			if (oCheck.getParameters("selected").selected == true) {
				_that._oViewModel.setProperty("/enableDealerNet", true);
				_that._oViewModel.setProperty("/enableProfit", true);
				sap.ushell.components.oTable.getColumns()[5].setVisible(true);
				sap.ushell.components.oTable.getColumns()[6].setVisible(true);
			} else {
				oCheck.getSource().setSelected(false);
				sap.ushell.components.oTable.getColumns()[5].setVisible(false);
				sap.ushell.components.oTable.getColumns()[6].setVisible(false);
				_that._oViewModel.setProperty("/enableDealerNet", false);
				_that._oViewModel.setProperty("/enableProfit", false);
			}
		},

		onPressBreadCrumb: function (oEvtLink) {
			// var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("master");
		},

		NavBackToSearch: function () {
			sap.ushell.components.oTable.getColumns()[5].setVisible(false);
			sap.ushell.components.oTable.getColumns()[6].setVisible(false);
			sap.ushell.components.oTable.getToolbar().getContent()[0].setSelected(false);
			sap.ushell.components.oTable.getToolbar().getContent()[1].setSelected(false);
			_that.oTireFitmentJSONModel.setData(null);
			_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			sap.ushell.components.FacetFilters.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			_that.oTireFitmentJSONModel.updateBindings(true);
			_that.getRouter().navTo("master");
		},

		//Facet Filter logic starts here
		_applyFilter: function (oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var aVBoxItems = this.getView().byId("idVBox").getItems();
			var oTable = aVBoxItems[aVBoxItems.length - 1];
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
			// _that.oGlobalBusyDialog.destroy();
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
			sap.ushell.components.oTable.getColumns()[5].setVisible(false);
			sap.ushell.components.oTable.getColumns()[6].setVisible(false);
			sap.ushell.components.oTable.getToolbar().getContent()[0].setSelected(false);
			sap.ushell.components.oTable.getToolbar().getContent()[1].setSelected(false);
			_that.oTireFitmentJSONModel.setData(null);
			_that.getView().setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			sap.ushell.components.oTable.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			sap.ushell.components.FacetFilters.setModel(_that.oTireFitmentJSONModel, "TireFitmentJSONModel");
			_that.oTireFitmentJSONModel.updateBindings(true);
			_that.destroy();
		}
	});
});