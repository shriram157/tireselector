var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/model/Filter',
	"sap/m/MessageBox"
], function (Controller, JSONModel, ResourceModel, BaseController, MessageToast, Filter, MessageBox) {
	"use strict";

	return BaseController.extend("tireSelector.controller.master", {
		/* Function for Initialization of model and variables for view */

		onInit: function () {
			_that = this;
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/tireSelector-dest"; //ecpSales_node_secured
				// _that.DealerData = {
				// 	"Attribute": "01",
				// 	"BusinessPartner": "2400042120",
				// 	"BusinessPartnerAddress": "3300 Steeles Ave E,Markham,CA-L3R 1G9",
				// 	"BusinessPartnerKey": "42120",
				// 	"BusinessPartnerName": "Don Valley North Toyota...",
				// 	"BusinessPartnerName2": "WEINS CANADA",
				// 	"BusinessPartnerPhone": "",
				// 	"BusinessPartnerType": "Z001",
				// 	"DealerCode": "42120",
				// 	"DealerName": "42120test",
				// 	"Division": "10",
				// 	"SearchTerm2": "42120",
				// 	"CurrentDate": new Date(),
				// 	"AddressID": "31298"
				// };
				// _that._oDealerModel = new sap.ui.model.json.JSONModel();
				// var dealer = _that.DealerData.BusinessPartner;
				// var addressID = _that.DealerData.AddressID;
				// _that.getPhoneNumber(dealer, addressID);
				// _that._oDealerModel.getData().DealerData = _that.DealerData;
				// _that._oDealerModel.updateBindings(true);
			} else {
				this.sPrefix = "";
				// this.attributeUrl = "/userDetails/attributes";
			}
			// this.sPrefix = "";
			_that.nodeJsUrl = this.sPrefix + "/node";

			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableSearchBtn: false,
				enableVin: true,
				enableTireSize: false,
				enableVehicleInputs: false,
				enableTable: false,
				enableProdMarkup: false
			});

			_that.getView().setModel(_that._oViewModel, "MasterModel");

			//appdata
			$.ajax({
				dataType: "json",
				url: "/appdata/whoAmI",
				type: "GET",
				success: function (userData) {
					console.log("User Data", userData);
					_that._oDealerModel = new sap.ui.model.json.JSONModel(userData);
					_that.userData = userData;
					if (_that.userData.userContext.userAttributes.DealerCode !== undefined) {
						_that.dealerCode = _that.userData.userContext.userAttributes.DealerCode[0];
					} else {
						_that.dealerCode = "";
					}
					_that.dealerName = _that.userData.userContext.userInfo.logonName;
					var scopes = _that.userData.userContext.scopes;
					console.log("scopes", scopes);
					var accessAll = false,
						accesslimited = false;

					for (var s = 0; s < scopes.length; s++) {
						if (scopes[s] != "openid") {
							if (scopes[s].split(".")[1] == "ManagerProductMarkups") {
								accessAll = true;
							} else if (scopes[s].split(".")[1] == "ViewTireQuotes") {
								accesslimited = true;
							}
							else{
								accessAll=false;
								accesslimited = false;
							}
						}
					}
					if (accessAll == true && accesslimited == true) {
						_that._oViewModel.setProperty("/enableProdMarkup", true);
					} else {
						_that._oViewModel.setProperty("/enableProdMarkup", false);
					}

					_that.DealerData = {};
					_that.oBusinessPartnerModel = _that.getOwnerComponent().getModel("BusinessPartnerModel");
					var queryString1 = "?$filter=SearchTerm2 eq'" + _that.dealerCode + "' &$expand=to_BusinessPartnerAddress";
					_that.oBusinessPartnerModel.read("/A_BusinessPartner" + queryString1, {
						success: $.proxy(function (oDealerData) {
							// if (oDealerData.results.length > 0) {
							console.log("Business Partner Data", oDealerData.results);
							for (var i = 0; i < oDealerData.results.length; i++) {
								var address = oDealerData.results[i].to_BusinessPartnerAddress.results[0];
								_that.DealerData.AddressID = address.AddressID;
								_that.DealerData.BusinessPartnerNo = address.BusinessPartner;
								_that.getPhoneNumber(_that.DealerData.BusinessPartnerNo, _that.DealerData.AddressID);

								_that.DealerData.BusinessPartnerAddress = address.StreetName + "," + address.CityName + "," +
									address.Country + "-" + address.PostalCode;
								_that.DealerData.BusinessPartnerPhone = "";
								_that.DealerData.Region = address.Region;
								_that._oDealerModel.getData().DealerData = _that.DealerData;
								_that._oDealerModel.updateBindings(true);
								var queryString = "?$filter=SearchTerm2 eq'" + _that.dealerCode +
									"' &$expand=to_Customer&$expand=to_BusinessPartnerAddress";
								_that.oBusinessPartnerModel.read("/A_BusinessPartner" + queryString, {
									success: $.proxy(function (oDealerData) {
										console.log("Business Partner Data", oDealerData.results);
										for (var i = 0; i < oDealerData.results.length; i++) {

											var BpLength = oDealerData.results[i].BusinessPartner.length;

											_that.getPhoneNumber(_that.DealerData.BusinessPartnerNo, _that.DealerData.AddressID);
											// _that.DealerData.BusinessPartnerFullName = oDealerData.results[i].BusinessPartnerFullName;
											// jQuery.sap.delayedCall(1000, _that, function () {
											_that.DealerData.BusinessPartnerName = oDealerData.results[i].OrganizationBPName1;
											_that.DealerData.BusinessPartnerName2 = oDealerData.results[i].OrganizationBPName2;
											_that.DealerData.BusinessPartner = oDealerData.results[i].BusinessPartner;
											_that.DealerData.BusinessPartnerKey = oDealerData.results[i].BusinessPartner.substring(5, BpLength);
											_that.DealerData.BusinessPartnerType = oDealerData.results[i].BusinessPartnerType;
											_that.DealerData.SearchTerm2 = oDealerData.results[i].SearchTerm2;

											_that._oDealerModel.getData().BusinessPartnerData = oDealerData.results;
											_that.DealerData.DealerCode = _that.dealerCode;
											_that.DealerData.DealerName = _that.dealerName;

											_that._oDealerModel.getData().DealerData = _that.DealerData;
											console.log("Dealer data fetched", _that._oDealerModel.getData().DealerData);
											_that._oDealerModel.updateBindings(true);
											_that._oDealerModel.refresh(true);

											_that.getView().setModel(_that._oDealerModel, "DealerModel");
											sap.ui.getCore().setModel(_that._oDealerModel, "DealerModel");
											_that._oDealerModel.updateBindings(true);
											_that._oDealerModel.refresh(true);

											var attributeFromSAP;
											attributeFromSAP = oDealerData.results[i].to_Customer.Attribute1;

											switch (attributeFromSAP) {
											case "01":
												_that.DealerData.Division = "10";
												_that.DealerData.Attribute = "01";
												break;
											case "02":
												_that.DealerData.Division = "20";
												_that.DealerData.Attribute = "02";
												break;
											case "03":
												_that.DealerData.Division = "Dual";
												_that.DealerData.Attribute = "03";
												break;
											case "04":
												_that.DealerData.Division = "10";
												_that.DealerData.Attribute = "04";
												break;
											case "05":
												_that.DealerData.Division = "Dual";
												_that.DealerData.Attribute = "05";
												break;
											default:
												_that.DealerData.Division = "10"; //  lets put that as a toyota dealer
												_that.DealerData.Attribute = "01";
											}
										}
									}, _that),
									error: function (oError) {
										// sap.m.MessageBox.error(
										// 	"NO Data found for BusinessPartner"
										// );
									}
								});
							}
						}, _that),
						error: function (oError) {
							// sap.m.MessageBox.error(
							// 	"NO Data found for BusinessPartner Address"
							// );
						}
					});
				},
				error: function (oError) {}
			});

			_that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");
			_that.oProdMarkupModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			console.log("XSO model data", _that.oXSOServiceModel);

			_that.oXSOServiceModel.read("/DealerMarkUp", {
				success: $.proxy(function (oData) {
					if (oData.results.length > 0) {
						console.log("XSO data", oData);
						_that.oProdMarkupModel.setData(oData);
						_that.oProdMarkupModel.updateBindings(true);
					} else {
						// sap.m.MessageBox.error(
						// 	"NO Data found for Product Markup"
						// );
					}
				}, _that),
				error: function (oError) {
					// sap.m.MessageBox.error(
					// 	"NO Data found for Product Markup"
					// );
				}
			});

			_that.oGlobalJSONModel = new sap.ui.model.json.JSONModel();
			_that.getView().setModel(_that.oGlobalJSONModel, "GlobalJSONModel");
			// _that.oGlobalJSONModel.setData();
			_that.oGlobalJSONModel.updateBindings();

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

			_that.oSearchOptionList = _that.getView().byId("searchOptionList");
			_that.oForVehicleSearchOnly = _that.getView().byId("forVehicleSearchOnly");
			_that.oSearchOptionLabel = _that.getView().byId("searchOptionLabel");
			_that.oSearchOptionVIN = _that.getView().byId("searchOptionVIN");
			_that.oSearchOptionTireSize = _that.getView().byId("searchOptionTireSize");
			_that.oModelSeriesCombo = _that.getView().byId("ModelSeriesCombo");
			_that.oVehicleSearchCombo = _that.getView().byId("VehicleSearchCombo");

			sap.ushell.components.SearchOption = _that.oSearchOptionList;
			sap.ushell.components.SearchOptionVIN = _that.oSearchOptionVIN;
			sap.ushell.components.SearchOptionTireSize = _that.oSearchOptionTireSize;
			sap.ushell.components.SearchOptionVehicle = _that.oVehicleSearchCombo;
			sap.ushell.components.ModelSeriesCombo = _that.oModelSeriesCombo;

			// _that.oForVehicleSearchOnly.setVisible(false);
			// _that.oGlobalJSONModel.getData().FitmentData=[];
			_that.oGlobalJSONModel.getData().modelDetailsData = [];
			_that.oGlobalJSONModel.getData().vehicleSeriesData = [];
			_that.oGlobalJSONModel.getData().vinData = [];

			/* JSON Model for the View */
			_that.oSelectJSONModel = new JSONModel();
			_that.getView().setModel(_that.oSelectJSONModel, "SelectJSONModel");
			sap.ui.getCore().setModel(_that.oSelectJSONModel, "SelectJSONModel");
			_that.oSelectJSONModel.getData().SearchOptionVal = "";
			/* Dummy JSON data */
			_that.objList = {
				"SearchOptionsList": [{
					SearchText: _that.oI18nModel.getResourceBundle().getText("VIN")
				}, {
					SearchText: "Vehicle Series"
				}, {
					SearchText: _that.oI18nModel.getResourceBundle().getText("TireSize")
				}]
			};

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");

			// _that.nodeJsUrl = this.sPrefix + "/node";
			_that.oSelectJSONModel.setData(_that.objList);
			_that.oSelectJSONModel.updateBindings();
			_that.oSearchOptionList.setSelectedKey(_that.oI18nModel.getResourceBundle().getText("VIN"));
			_that.oSearchOptionLabel.setText(_that.oI18nModel.getResourceBundle().getText("VIN"));
		},

		getPhoneNumber: function (dealer, addressID) {
			//A_BusinessPartnerAddress(BusinessPartner='2400042120',AddressID='31298')/to_PhoneNumber
			_that.oBusinessPartnerModel = _that.getOwnerComponent().getModel("BusinessPartnerModel");
			var queryString1 = "(BusinessPartner='" + dealer + "',AddressID='" + addressID + "')/to_PhoneNumber";
			_that.oBusinessPartnerModel.read("/A_BusinessPartnerAddress" + queryString1, {
				success: $.proxy(function (oDealerContactData) {
					// if (oDealerData.results.length > 0) {
					console.log("oDealerContactData", oDealerContactData.results);
					_that.DealerData.PhoneNumber = oDealerContactData.results[0].PhoneNumber;
				}, _that),
				error: function (oError) {
					// sap.m.MessageBox.error(
					// 	"NO Data found for BusinessPartner Phone Number"
					// );
				}
			});
		},

		_oMasterRoute: function (oRoute) {
			// sap.ui.getCore().setModel(_that._oDealerModel, "DealerModel");
			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableSearchBtn: false,
				enableVin: true,
				enableTireSize: false,
				enableVehicleInputs: false,
				enableTable: false
			});
			_that.getView().setModel(_that._oViewModel, "MasterModel");
		},

		onBeforeRendering: function () {
			_that.getOwnerComponent().getRouter().attachRoutePatternMatched(_that._oMasterRoute, _that);
		},

		handleVINSuggest: function (oEvent) {
			// var oSource = oEvent.getSource();
			var sTerm = oEvent.getParameter("suggestValue");
			_that._forhandleVINSuggesCallData(sTerm);
			// var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("VIN", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		},
		_forhandleVINSuggesCallData: function (oTerm) {
			//Z_VEHICLE_MASTER_SRV/ZC_GET_VLCVEHICLE_VIN('01010101010101010')
			$.ajax({
				url: _that.nodeJsUrl + "/Z_VEHICLE_MASTER_SRV/ZC_GET_VLCVEHICLE_VIN?$filter=startswith(VIN,'" + oTerm + "')",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					if (oDataResponse.d.results.length <= 0) {
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
						_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("NoData"));
					} else {
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
						console.log("_that.vindata", oDataResponse.d.results);
						_that.oGlobalJSONModel.getData().vinData = oDataResponse.d.results;
						_that.oGlobalJSONModel.updateBindings();
					}
				},
				error: function (oError) {
					console.log("oError", oError);
					// MessageBox.error(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
				}
			});
		},
		handleTireSizeSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("TIRE_SIZE", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);

		},
		/*Functions for searchOption value change*/
		onVehicleChange: function () {
			// _that.oGlobalBusyDialog = new sap.m.BusyDialog();
			if (!_that.oVehicleSearchCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVehicle = _that.oVehicleSearchCombo;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
			_that.ModelNodataFlag = false;
			sap.ui.core.BusyIndicator.show();

			var ModelSeriesNo = _that.oVehicleSearchCombo.getSelectedKey();
			var modelYearURl = _that.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/ZC_MODEL_DETAILS?$filter=TCISeries eq  '" + ModelSeriesNo + " '";
			$.ajax({
				url: modelYearURl,
				type: "GET",
				dataType: "json",
				success: function (oDataResponse2) {
					sap.ui.core.BusyIndicator.hide();
					if (oDataResponse2.d.results.length > 0) {
						var b = 0;
						console.log("ZC_MODEL_DETAILS Data", oDataResponse2);
						_that.oGlobalJSONModel.getData().modelDetailsData = oDataResponse2.d.results;
						// for (var i = 0; i < oDataResponse2.d.results.length; i++) {
						// 	var Modelyear = oDataResponse2.d.results[i].Modelyear;
						// 	for (var j = 0; j < _that.oGlobalJSONModel.getData().modelDetailsData.length; j++) {
						// 		if (Modelyear != _that.oGlobalJSONModel.getData().modelDetailsData[j].Modelyear) {
						// 			b++;
						// 		}
						// 	}
						// 	if (b == _that.oGlobalJSONModel.getData().modelDetailsData.length) {
						// 		_that.oGlobalJSONModel.getData().modelDetailsData.push({
						// 			"Modelyear": oDataResponse2.d.results[i].Modelyear,
						// 			"Model": oDataResponse2.d.results[i].Model,
						// 			"TCISeries": oDataResponse2.d.results[i].TCISeries,
						// 			"suffix": oDataResponse2.d.results[i].suffix,
						// 		});
						// 		_that.oGlobalJSONModel.updateBindings(true);
						// 	}
						// 	b = 0;
						// }
						// _that.oGlobalJSONModel.getData().modelDetailsData = oDataResponse2.d.results;
						_that.oGlobalJSONModel.updateBindings(true);
					} else {
						_that.ModelNodataFlag = true;
					}
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					_that.ModelNodataFlag = true;
				}
			});

			if (_that.ModelNodataFlag == true) {
				// _that.oGlobalBusyDialog.close();
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.error(
					"NO Data found"
				);
			}
		},
		onInputEntryChange: function (oEntry) {
			if (!_that.oModelSeriesCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.ModelSeriesCombo = _that.oModelSeriesCombo;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onInputEntryVIN: function (oEntry) {
			// console.log("Entry input change", oEntry);
			if (!_that.oSearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVIN = _that.oSearchOptionVIN;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onInputEntryTireSize: function (oEntry) {
			// console.log("Entry input change", oEntry);
			if (!_that.oSearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionTireSize = _that.oSearchOptionTireSize;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onComboInputChange: function (oEntry) {
			// console.log("Entry input live change", oEntry);
			if (!_that.oModelSeriesCombo.getValue() || !_that.oVehicleSearchCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVehicle = _that.oVehicleSearchCombo;
				sap.ushell.components.ModelSeriesCombo = _that.oModelSeriesCombo;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onLiveChangeVIN: function (oEntry) {
			// console.log("oEntry input live change", oEntry);
			if (!_that.oSearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVIN = _that.oSearchOptionVIN;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onLiveChangeTireSize: function (oEntry) {
			// console.log("oEntry input live change", oEntry);
			if (!_that.oSearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionTireSize = _that.oSearchOptionTireSize;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		/*Function for Change options on Search By Dropdownlist */
		changeOptionPress: function (oChangeOption) {
			// _that.oGlobalBusyDialog = new sap.m.BusyDialog();
			_that = this;
			if (sap.ushell.components.SearchOptionTireSize !== undefined) {
				sap.ushell.components.SearchOptionTireSize = "";
			}
			if (sap.ushell.components.SearchOptionVIN !== undefined) {
				sap.ushell.components.SearchOptionVIN = "";
			}
			if (sap.ushell.components.SearchOptionVehicle !== undefined) {
				sap.ushell.components.SearchOptionVehicle = "";
				sap.ushell.components.ModelSeriesCombo = "";
			}
			sap.ushell.components.SearchOption = "";

			var selectedOption = _that.oSearchOptionList.getSelectedKey();
			_that._oViewModel.setProperty("/enableTable", false);
			_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.None);
			if (selectedOption == "Vehicle Series") {
				_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.None);
				_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
				// _that.oGlobalBusyDialog.open();

				_that.ModelNodataFlag = false;
				$.ajax({
					url: _that.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields",
					type: "GET",
					dataType: "json",
					success: function (oDataResponse) {
						_that.vehicleSeriesData = {
							"results": []
						};
						if (oDataResponse.d.results.length > 0) {
							$.each(oDataResponse.d.results, function (i, item) {
								if (item.ModelSeriesNo != "") {
									_that.vehicleSeriesData.results.push({
										"ModelSeriesNo": item.ModelSeriesNo,
										"TCISeriesDescriptionEN": item.TCISeriesDescriptionEN
									});
								}
							});

							console.log("zc_mmfields Data", _that.vehicleSeriesData);
							_that.oGlobalJSONModel.getData().vehicleSeriesData = _that.vehicleSeriesData.results;
							_that.oGlobalJSONModel.updateBindings(true);
						} else {
							_that.ModelNodataFlag = true;
						}
					},
					error: function (oError) {
						_that.ModelNodataFlag = true;
					}
				});

				if (_that.ModelNodataFlag == true) {
					// _that.oGlobalBusyDialog.close();
					sap.m.MessageBox.error(
						"NO Data found"
					);
				}
			} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
				_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
			} else {
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
				$.ajax({
					dataType: "json",
					url: _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/TireSizeSet", //_that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet",
					type: "GET",
					success: function (oDataResponse) {
						if (oDataResponse.d.results.length > 0) {
							console.log("Tire Size Data", oDataResponse.d.results);
							_that.oFitmentDataModel = new JSONModel();
							_that.getView().setModel(_that.oFitmentDataModel, "FitmentDataModel");
							_that.oFitmentDataModel.setData(oDataResponse.d);
							_that.oFitmentDataModel.updateBindings();
						} else {
							// sap.m.MessageBox.error(
							// 	"NO Data found for Tire Size"
							// );
						}
					},
					error: function (oError) {
						sap.m.MessageBox.error(
							"NO Data found for Tire Size"
						);
					}
				});
			}
			_that.oSearchOptionLabel.setText(selectedOption);
			if (selectedOption == "Vehicle Series") {
				_that.oVehicleSearchCombo.setValue();
				_that.oModelSeriesCombo.setValue();
				_that._oViewModel.setProperty("/enableVehicleInputs", true);
				_that._oViewModel.setProperty("/enableVin", false);
				_that._oViewModel.setProperty("/enableTireSize", false);
			} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
				_that._oViewModel.setProperty("/enableVin", true);
				_that.oSearchOptionVIN.setValue();
				_that._oViewModel.setProperty("/enableTireSize", false);
				_that._oViewModel.setProperty("/enableVehicleInputs", false);
			} else {
				_that._oViewModel.setProperty("/enableTireSize", true);
				_that.oSearchOptionTireSize.setValue();
				_that._oViewModel.setProperty("/enableVin", false);
				_that._oViewModel.setProperty("/enableVehicleInputs", false);
			}
			_that.oSearchOptionLabel.setText(selectedOption);
		},

		/*Function for clearing search criteria when user clicks on Clear Search Fields */
		handleClearSearch: function () {
			_that = this;
			var selectedOption = _that.oSearchOptionList.getSelectedKey();
			if ((_that.oSearchOptionList.getSelectedKey() == "") && (_that.oSearchOptionTireSize.getValue() == "" || _that.oSearchOptionVIN.getValue() ==
					"" || (_that.oVehicleSearchCombo.getValue() ==
						"" && _that.oModelSeriesCombo.getValue() == ""))) {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Warning);
				_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Warning);
				_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Warning);
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Warning);
				_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.Warning);
				var msg = 'No values added';
				MessageToast.show(msg);
			} else {
				if (selectedOption == "Vehicle Series") {
					_that.oVehicleSearchCombo.setValue();
					_that.oModelSeriesCombo.setValue();
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.None);
					_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
					_that.oSearchOptionVIN.setValue();
					_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("TireSize")) {
					_that.oSearchOptionTireSize.setValue();
					_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
				}
				_that.oSearchOptionList.setSelectedKey();
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.None);
			}
			_that._oViewModel.setProperty("/enableSearchBtn", false);
		},

		/*Function for Routing/Navigating to search results */
		NavToSearchResults: function (oSearchResults) {
			_that = this;

			function validateVin(vin) {
				var re = new RegExp("[a-zA-Z0-9]{9}[a-zA-Z0-9-]{2}[0-9]{6}");
				// var re = new RegExp("^[A-HJ-NPR-Z\\d]{9}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");
				return vin.match(re);
			}
			var Searchkey = _that.oSearchOptionList.getSelectedKey();
			if ((Searchkey == _that.oI18nModel.getResourceBundle().getText("VIN") || Searchkey == "Vehicle Series") &&
				(_that.oSearchOptionTireSize.getValue() != "" || _that.oSearchOptionVIN.getValue() != "" || _that.oVehicleSearchCombo.getSelectedKey() !=
					"")) {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				if (Searchkey == "Vehicle Series") {
					// _that.oSelectJSONModel.getData().SearchOptionVal = " > [" + _that.oVehicleSearchCombo.getSelectedKey() + "] [" +_that.oModelSeriesCombo.getSelectedKey() + "]";
					// _that.oSelectJSONModel.updateBindings();
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Success);
					_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
					// _that.getRouter().navTo("searchResults");
					_that.showResultsData();
				} else {
					if (validateVin(_that.oSearchOptionVIN.getValue())) {
						// _that.oSelectJSONModel.getData().SearchOptionVal = "";
						_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Success);
						// _that.oSelectJSONModel.updateBindings();
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
						// _that.getRouter().navTo("searchResults");
						_that.showResultsData();
					} else {
						_that._oViewModel.setProperty("/enableTable", false);
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
						_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
					}
				}
			} else if (Searchkey == _that.oI18nModel.getResourceBundle().getText("TireSize") && _that.oSearchOptionTireSize.getValue() !== "") {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Success);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
				// _that.getRouter().navTo("searchResultsTireNoData");
				_that.routeToTireSelect(oSearchResults);
			} else {
				_that._oViewModel.setProperty("/enableTable", false);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00001"));
				if (_that.oSearchOptionList.getSelectedKey() == "") {
					_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Error);
				} else if ((_that.oSearchOptionTireSize.getValue() == "" || _that.oSearchOptionVIN.getValue() == "") && (_that.oSearchOptionTireSize
						.getVisible() == true || _that.oSearchOptionVIN.getVisible() == true)) {
					_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Error);
					_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Error);
				} else if (_that.oVehicleSearchCombo.getSelectedKey() == "" && _that.oVehicleSearchCombo.getVisible() == true) {
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Error);
				} else if (_that.oModelSeriesCombo.getSelectedKey() == "" && _that.oModelSeriesCombo.getVisible() == true) {
					_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.Error);
				}
				_that.oSelectJSONModel.getData().SearchOptionVal = "";
				_that.oSelectJSONModel.updateBindings();
			}
		},

		routeToTireSelect: function (oSearchResults) {
			var oTireData = oSearchResults.getSource().getModel("FitmentDataModel").getData().results;
			for (var n = 0; n < oTireData.length; n++) {
				if (sap.ushell.components.SearchOptionTireSize.getValue() == oTireData[n].TIRE_SIZE) {
					oTireData[n].FitmentToCharac = "";
					oTireData[n].__metadata = "";
					oTireData[n].TIRE_SIZE = oTireData[n].TIRE_SIZE.replace("/", "%2F");
					var oToBeRoutedTire = oTireData[n];
				}
			}
			_that.getRouter().navTo("searchResultsTireNoData", {
				tireData: JSON.stringify(oToBeRoutedTire)
			});
		},

		showResultsData: function () {
			_that._oViewModel.setProperty("/enableTable", true);
			_that.SearchResultModel = new sap.ui.model.json.JSONModel();
			_that.getView().setModel(_that.SearchResultModel, "SearchResultModel");
			var serviceURL;
			if (sap.ushell.components.SearchOptionVIN !== undefined && sap.ushell.components.SearchOptionVIN !== "") {
				if (sap.ushell.components.SearchOptionVIN.getValue() != "" || sap.ushell.components.SearchOptionVIN.getValue() !== undefined) {
					var serviceURL1 = _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_VLCVEHICLE?$filter=VHVIN eq '" + sap.ushell.components.SearchOptionVIN
						.getValue() + "'";
					$.ajax({
						dataType: "json",
						url: serviceURL1,
						type: "GET",
						success: function (oData) {
							_that.vinResultdata = {
								"results": []
							};
							console.log("VIN Search Result data", oData.d.results);
							if (oData.d.results.length > 0) {
								$.each(oData.d.results, function (i, item) {
									_that.vinResultdata.results.push({
										"modelVal": item.Model,
										"modelYearVal": item.ZZMOYR,
										"suffixVal": item.ZZSUFFIX
									});
								});
							} else {
								sap.m.MessageBox.error(
									"NO Data found, Please update search criteria", {
										actions: [sap.m.MessageBox.Action.CLOSE],
										onClose: function (oAction) {
											_that._oViewModel.setProperty("/enableSearchBtn", false);
										}
									}
								);
							}
							var v;
							_that.searchresultObj = {
								"results": []
							};
							for (v = 0; v < _that.vinResultdata.results.length; v++) {
								var modelVal = _that.vinResultdata.results[v].modelVal;
								var modelYearVal = _that.vinResultdata.results[v].modelYearVal;
								var suffixVal = _that.vinResultdata.results[v].suffixVal;
								var serviceURL2 = _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet?$filter=Zzmoyr eq '" + modelYearVal +
									"' and Model eq '" + modelVal + "' and Zzsuffix eq '" + suffixVal + "'&$format=json";
								$.ajax({
									dataType: "json",
									url: serviceURL2,
									type: "GET",
									success: function (oSearchData) {
										console.log("Search Result data", oSearchData.d.results);
										if (oSearchData.d.results.length > 0) {
											$.each(oSearchData.d.results, function (i, item) {
												_that.searchresultObj.results.push({
													"Model": item.Model,
													"Zzsuffix": item.Zzsuffix,
													"ZtireSize": item.ZtireSize,
													"ZrimSize": item.ZrimSize
												});
											});
											_that.SearchResultModel.setData(_that.searchresultObj);
											_that.SearchResultModel.updateBindings(true);
											_that.SearchResultModel.refresh(true);
										} else {
											sap.m.MessageBox.error(
												"NO Data found, Please update search criteria", {
													actions: [sap.m.MessageBox.Action.CLOSE],
													onClose: function (oAction) {
														_that._oViewModel.setProperty("/enableSearchBtn", false);
													}
												}
											);
										}
									},
									error: function (oError) {}
								});
							}
							_that.SearchResultModel.setData(_that.searchresultObj);
							_that.SearchResultModel.updateBindings(true);
							_that.SearchResultModel.refresh(true);
						},
						error: function (oError) {}
					});
				}
			} else if (sap.ushell.components.ModelSeriesCombo !== "" && sap.ushell.components.SearchOptionVehicle !== "" && sap.ushell.components
				.ModelSeriesCombo !== undefined && sap.ushell.components.SearchOptionVehicle !== undefined) {
				var modelDetailsData = _that.oGlobalJSONModel.getData().modelDetailsData;
				var a;
				// var TCIseries = sap.ushell.components.SearchOptionVehicle.getSelectedKey();
				// var modelyear = sap.ushell.components.ModelSeriesCombo.getSelectedKey();
				var flagNODATFOUND = false;
				for (a = 0; a < modelDetailsData.length; a++) {
					// if (TCIseries == modelDetailsData[a].TCISeries && modelyear == modelDetailsData[a].Modelyear) {
					var Suffix = modelDetailsData[a].suffix;
					var Modelyear = modelDetailsData[a].Modelyear;
					var Model = modelDetailsData[a].Model;
					console.log(Model + Modelyear);
					// }	Zzmoyr eq '2018' and Model eq 'DFREVT'
					serviceURL = _that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet?$filter=Zzmoyr eq '" + Modelyear + "' and Model eq '" + Model +
						"'";
					//_that.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet?$filter=Zzmoyr eq '" + modelyear + "' and Model eq '" + Model +
					//	"' and Zzsuffix eq '" + Suffix + "'&$format=json";
					$.ajax({
						dataType: "json",
						url: serviceURL,
						type: "GET",
						success: function (oData) {
							console.log("Search Result data", oData.d.results);
							if (oData.d.results.length > 0) {
								_that.SearchResultModel.setData(oData.d);
								_that.SearchResultModel.updateBindings(true);
								_that.SearchResultModel.refresh(true);
							} else {
								flagNODATFOUND = true;
							}
						},
						error: function (oError) {
							flagNODATFOUND = true;
						}
					});
				}
				if (flagNODATFOUND == true) {
					sap.m.MessageBox.error(
						"NO Data found, Please update search criteria", {
							actions: [sap.m.MessageBox.Action.CLOSE],
							onClose: function (oAction) {
								_that._oViewModel.setProperty("/enableSearchBtn", false);
							}
						}
					);
				}
			}
		},

		navToSelectTire: function (oEvtModel) {
			var oPath = oEvtModel.getSource().getModel("SearchResultModel").getProperty(oEvtModel.getSource().getBindingContext(
				"SearchResultModel").sPath);
			oPath.__metadata = "";
			oPath.FitmentToCharac = "";
			oPath.ZtireSize = oPath.ZtireSize.replace("/", "%2F");
			_that.getRouter().navTo("searchResultsTire", {
				modelData: JSON.stringify(oPath)
			});
		},

		formatTireSize: function (oSize) {
			var tireSize = oSize.replace("%2F", "/");
			return tireSize;
		},

		/*Function for Routing/Navigating from menu option as per selection */
		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_that.getRouter().navTo("");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ReportError")) {
				_that.getRouter().navTo("reportError");
			}
		},

		/*Exit Function for refreshing/resetting view */
		onExit: function () {
			_that.SearchResultModel.refresh(true);
			_that.oGlobalJSONModel.refresh(true);
			_that.oSelectJSONModel.refresh(true);
			_that.destroy();
		}
	});
});