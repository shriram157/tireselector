sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History",
	'tireSelector/controller/BaseController',
	'sap/m/MessageToast',
	"sap/m/PDFViewer",
], function (Controller, JSONModel, History, BaseController, MessageToast, PDFViewer) {
	"use strict";
	var _this, sSelectedLocale, sDivision, DivUser;
	return BaseController.extend("tireSelector.controller.tireQuotation", {
		onInit: function () {
			_this = this;
			_this.oGlobalBusyDialog = new sap.m.BusyDialog();
			_this.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			_this.oDateFormatShort = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MM-dd-YYYY"
			});
			_this.currDate = _this.oDateFormatShort.format(new Date());
			var expiry = new Date().setDate(new Date(_this.currDate).getDate() + 14);
			_this.expDate = _this.oDateFormatShort.format(new Date(expiry));
			_this.phoneNumber = sap.ushell.components.dealerPhoneNumber;
			_this.getView().byId("DealerPhone").setValue(_this.phoneNumber);

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/tireSelector-dest";
				_this.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			} else {
				this.sPrefix = "";
				// this.attributeUrl = "/userDetails/attributes";
			}
			// this.sPrefix = "";
			this.nodeJsUrl = this.sPrefix + "/node";
			_this._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableInput: false,
				CurrentDate: _this.currDate,
				expiryDate: _this.expDate,
				PhoneNumber: _this.phoneNumber
			});
			_this.getView().setModel(_this._oViewModel, "TireQuoteModel");

			_this.getView().byId("nameMandat").setRequired = false;
			_this.getView().byId("addressMandat").setRequired = false;
			_this.getView().byId("postalCodeMandat").setRequired = false;
			_this.getView().byId("phoneMandat").setRequired = false;

			_this._oViewModelTax = new sap.ui.model.json.JSONModel({
				enableFTC: false,
				enablePTC: false,
				enableFee: false,
			});
			_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
			// _this.getOwnerComponent().getRouter().attachRoutePatternMatched(_this._oQuoteRoute, _this);
			sap.ui.core.UIComponent.getRouterFor(_this).attachRoutePatternMatched(_this._oQuoteRoute, _this);

			_this.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			_this.getView().setModel(_this.oI18nModel, "i18n");

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "EN"; // default is english 
			}
			if (sSelectedLocale == "fr") {
				_this.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				this.getView().setModel(_this.oI18nModel, "i18n");
				this.sCurrentLocale = 'FR';
			} else {
				_this.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				this.getView().setModel(_this.oI18nModel, "i18n");
				this.sCurrentLocale = 'EN';
			}
			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			if (isDivisionSent) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
				var currentImageSource;
				if (sDivision == '10') // set the toyoto logo
				{
					DivUser = "TOY";
					currentImageSource = this.getView().byId("idLexusLogo");
					currentImageSource.setProperty("src", "images/toyota_logo_colour.png");

				} else { // set the lexus logo
					DivUser = "LEX";
					currentImageSource = this.getView().byId("idLexusLogo");
					currentImageSource.setProperty("src", "images/LexusNew.png");
				}
			}
			// if (window.location.search == "?language=fr") {
			// 	_this.oI18nModel = new sap.ui.model.resource.ResourceModel({
			// 		bundleUrl: "i18n/i18n.properties",
			// 		bundleLocale: ("fr")
			// 	});
			// 	_this.getView().setModel(_this.oI18nModel, "i18n");
			// 	_this.sCurrentLocale = 'FR';
			// } else {
			// 	_this.oI18nModel = new sap.ui.model.resource.ResourceModel({
			// 		bundleUrl: "i18n/i18n.properties",
			// 		bundleLocale: ("en")
			// 	});
			// 	_this.getView().setModel(_this.oI18nModel, "i18n");
			// 	_this.sCurrentLocale = 'EN';
			// }
		},
		textCount: function (count) {
			debugger;
			var oTextArea = count.getSource();
			var iValueLength = oTextArea.getValue().length + " " + _this.oI18nModel.getResourceBundle().getText("characters");
			_this.getView().byId("textCount").setText(iValueLength);
		},
		handleQuoteDateChange: function (expChange) {
			var expiry = new Date().setDate(new Date(expChange.getParameter("newValue")).getDate() + 14);
			_this.expDate = _this.oDateFormatShort.format(new Date(expiry));
			_this._oViewModel.getData().expiryDate = _this.oDateFormatShort.format(new Date(expiry));
		},
		_oQuoteRoute: function (oEvent) {
			_this.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			_this.userData = sap.ui.getCore().getModel("DealerModel").getData();
			_this.phoneNumber = sap.ushell.components.dealerPhoneNumber;

			jQuery.sap.require("sap.ui.core.format.DateFormat");
			_this.oDateFormatShort = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MM-dd-YYYY"
			});
			_this.currDate = _this.oDateFormatShort.format(new Date());
			var expiry = new Date().setDate(new Date(_this.currDate).getDate() + 15);
			_this.expDate = _this.oDateFormatShort.format(new Date(expiry));

			_this._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableInput: false,
				enableProdMarkup: false,
				CurrentDate: _this.currDate,
				expiryDate: _this.expDate,
				PhoneNumber: _this.phoneNumber
			});
			_this.getView().setModel(_this._oViewModel, "TireQuoteModel");

			//START: uncomment below for cloud testing
			var scopes = _this.userData.userContext.scopes;
			console.log("scopes", scopes);
			var accessAll = false,
				accesslimited = false;

			for (var s = 0; s < scopes.length; s++) {
				if (scopes[s] != "openid") {
					if (scopes[s].split(".")[1] == "ManagerProductMarkups") {
						accessAll = true;
					} else if (scopes[s].split(".")[1] == "ViewTireQuotes") {
						accesslimited = true;
					} else {
						accessAll = false;
						accesslimited = false;
					}
				}
			}
			if (accessAll == true && accesslimited == true) {
				_this._oViewModel.setProperty("/enableProdMarkup", true);
			} else {
				_this._oViewModel.setProperty("/enableProdMarkup", false);
			}
			//END: uncomment below for cloud testing
			_this.oGlobalBusyDialog = new sap.m.BusyDialog();

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

			if (oEvent.getParameter("arguments").rowData !== undefined) {
				_this.rowData = {};

				// console.log("rowData", oEvent.getParameter("arguments").rowData);
				_this.rowData = JSON.parse(oEvent.getParameter("arguments").rowData);
				_this.rowData.VIN = _this.rowData.VIN;
				_this.rowData.VModelYear = _this.rowData.VModelYear;
				_this.rowData.VehicleSeries = _this.rowData.VehicleSeries;
				_this.rowData.VehicleSeriesDescp = _this.rowData.VehicleSeriesDescp;
				_this.rowData.TireSize = _this.rowData.TireSize.replace("%2F", "/");
				_this.rowData.MatDesc_EN = _this.rowData.MatDesc_EN.replace("%2F", "/");
				_this.rowData.TireLoad = _this.rowData.TireLoad.replace("%2F", "/");
				_this.rowData.TireSpeed = _this.rowData.TireSpeed.replace("%2F", "/");
				_this.rowData.ProvincialTax = "";
				_this.rowData.FederalTax = "";
				_this.rowData.ProvincialTaxSum = "";
				_this.rowData.FederalTaxSum = "";
				_this.rowData.EHFPriceSum = "";
				_this.rowData.Total = "";
				_this.rowData.subTotal = "";
				_this.rowData.Retails = _this.decimalFormatter(_this.rowData.Retails);
				_this.rowData.CustName = "";
				_this.rowData.CustAddress = "";
				_this.rowData.CustPostalCode = "";
				_this.rowData.CustPhone = "";

				var oMat = _this.rowData.Material;
				var oMaterial = oMat;

				_this.objPrice = {};
				_this.objPrice.otherItemPrice1 = "";
				_this.objPrice.otherItemPrice2 = "";
				_this.objPrice.otherItemPrice3 = "";
				_this.objPrice.otherItemPrice4 = "";
				_this.objPrice.MnBPrice = "";
				_this.objPrice.TiresPrice = "";
				_this.objPrice.WheelsPrice = "";
				_this.objPrice.TPMSPrice = "";
				_this.objPrice.FittingKitPrice = "";
				_this.objPrice.RHPPriceSum = "";

				_this.Division = _this.userData.DealerData.Division;
				_this.Doctype = "ZAF";
				_this.SalesOrg = "7000";
				_this.DistrChan = "10";
				_this.SoldtoParty = _this.userData.DealerData.BusinessPartner;

				var filterdata = "?$filter=Division eq '" + _this.Division + "' and DocType eq '" + _this.Doctype + "' and SalesOrg eq '" +
					_this.SalesOrg + "' and DistrChan eq '" + _this.DistrChan + "' and SoldtoParty eq '" + _this.SoldtoParty +
					"' and Material eq '" + oMaterial + "'";
				_this.oPriceServiceModel = _this.getOwnerComponent().getModel("PriceServiceModel");
				_this.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
					success: $.proxy(function (oPriceData) {
							console.log("oPriceData", oPriceData);
							for (var n = 0; n < oPriceData.results.length; n++) {
								var CndType = oPriceData.results[n].CndType;
								if (CndType == "JRC4" || CndType == "JRC5") {
									_this.oTireQuotationModel.getData().FederalTax = Number(oPriceData.results[n].Amount);
								} else if (CndType == "JRC3" || CndType == "JRC2") {
									_this.oTireQuotationModel.getData().ProvincialTax = Number(oPriceData.results[n].Amount);
								} else if (CndType == "ZPOF") { //Freight Cost
									_this.oTireQuotationModel.getData().EHFPRice = Number(oPriceData.results[n].Amount);
									// _this.oTireQuotationModel.getData().Crcy = oPriceData.results[n].Crcy;
								}
								/* changes done for defect number:
								else if (CndType == "ZPEH" || CndType == "ZPEC") { //Freight Cost
									_this.oTireQuotationModel.getData().EHFPRice = Number(oPriceData.results[n].Amount);
									// _this.oTireQuotationModel.getData().Crcy = oPriceData.results[n].Crcy;
								}*/
							}
						},
						_this),
					error: function (oError) {
						console.log("Error in fetching ZC_PriceSet", oError);
					}
				});
			}

			jQuery.sap.delayedCall(0, _this, function () {
				_this.oTireQuotationModel = new JSONModel();
				_this.oTirePriceModel = new JSONModel();
				_this.oTireQuotationModel.setData(_this.rowData);
				_this.getView().setModel(_this.oTireQuotationModel, "TireQuotationModel");
				_this.oTireQuotationModel.updateBindings(true);
				_this.oTireQuotationModel.refresh(true);
				console.log("Tire Quote Data", _this.oTireQuotationModel.getData());
				_this.oTirePriceModel.setData(_this.objPrice);
				_this.getView().setModel(_this.oTirePriceModel, "TirePriceModel");
				_this.oTirePriceModel.updateBindings(true);
				_this.oTirePriceModel.refresh(true);
				console.log("Tire Price Data", _this.oTirePriceModel.getData());
				_this.oGlobalBusyDialog.close();
			});

			//_this.sCurrentLocale
			//MD_PRODUCT_FS_SRV/ZC_Product_CategorySet?$filter=LANGUAGE eq 'E' and PRODH eq 'PARP10F22P101ECPRH'&$format=json
			var Lang;
			if (_this.sCurrentLocale == 'EN') {
				Lang = "E";
			} else {
				Lang = "F";
			}
			$.ajax({
				dataType: "json",
				url: this.nodeJsUrl + "/MD_PRODUCT_FS_SRV/ZC_Product_CategorySet?$filter=LANGUAGE eq '" + Lang +
					"' and PRODH eq 'PARP10F22P101ECPRH'",
				type: "GET",
				success: function (oDataResponse) {
					if (oDataResponse.d.results.length > 0) {
						_this.matData = {
							"results": []
						};
						$.each(oDataResponse.d.results, function (i, item) {
							if (item.MATNR != "" && (item.MATNR == "C0WGITRHP3" || item.MATNR == "C0WGITRHP4")) {
								//item.PRODH == "C0WGITRHP3" || item.PRODH == "C0WGITRHP4" these two conditions are added
								_this.matData.results.push({
									"MATNR": item.MATNR,
									"MATNR_DESC": item.MATNR_DESC
								});
							}
						});
						console.log("ProductCategoryModel Data", _this.matData);
						_this.oProductCategoryModel = new JSONModel();
						_this.getView().setModel(_this.oProductCategoryModel, "ProductCategoryModel");
						_this.oProductCategoryModel.setData(_this.matData);
						_this.oProductCategoryModel.getData().results.unshift({
							"MATNR": "No Thank You",
							"MATNR_DESC": "No Thank You"
						});
						_this.oProductCategoryModel.updateBindings(true);
						if (_this.getView().byId("id_RHP") !== undefined) {
							_this.getView().byId("id_RHP").setSelectedKey(_this.getView().byId("id_RHP").getItems()[0].getKey());
						}
					} else {
						// sap.m.MessageBox.error(
						// 	"NO Material found for category PRODH"
						// );
					}
				},
				error: function (oError) {
					// sap.m.MessageBox.error(
					// 	"NO Material found for category PRODH"
					// );
				}
			});
		},

		ChangeLabelMandatory: function (oChange) {
			_this.getView().byId("nameMandat").setRequired = true;
			_this.getView().byId("addressMandat").setRequired = true;
			_this.getView().byId("postalCodeMandat").setRequired = true;
			_this.getView().byId("phoneMandat").setRequired = true;
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

		onPressBreadCrumb: function (oEvtLink) {
			sap.ui.core.UIComponent.getRouterFor(_this).navTo("master");
		},

		onMatSelection: function (oChange) {
			_this.oGlobalBusyDialog.open();
			var oMat = oChange.getParameter("selectedItem").getProperty("key");
			if (oMat != "No Thank You") {
				_this.getView().byId("id_RHPsQty").setValue(_this.getView().byId("id_tireQty").getValue());
				var oMaterial = oMat;
				_this.Division = _this.userData.DealerData.Division;
				_this.Doctype = "ZAF";
				_this.SalesOrg = "7000";
				_this.DistrChan = "10";
				_this.SoldtoParty = _this.userData.DealerData.BusinessPartner;

				var filterdata = "?$filter=Division eq '" + _this.Division + "' and DocType eq '" + _this.Doctype + "' and SalesOrg eq '" +
					_this.SalesOrg + "' and DistrChan eq '" + _this.DistrChan + "' and SoldtoParty eq '" + _this.SoldtoParty + "' and Material eq '" +
					oMaterial +
					"'";
				// _this.oService = this.nodeJsUrl + "/MD_PRODUCT_FS_SRV";
				_this.oPriceServiceModel = _this.getOwnerComponent().getModel("PriceServiceModel");
				// _this.oPriceServiceModel = new sap.ui.model.odata.ODataModel(_this.oService, true);
				_this.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
					success: $.proxy(function (oPriceData) {
						if (oPriceData.results.length > 0) {
							for (var n = 0; n < oPriceData.results.length; n++) {
								var CndType = oPriceData.results[n].CndType;
								if (CndType == "ZPG4") { //if (CndType == "ZPEC" || CndType == "ZPEH") {
									_this.oTireQuotationModel.getData().RHPPRice = parseFloat(oPriceData.results[n].Amount).toFixed(2);
									if (_this.oTireQuotationModel.getData().RHPPRice != "") {
										_this.oTirePriceModel.getData().RHPPriceSum = (Number(_this.oTireQuotationModel.getData().RHPPRice) * Number(_this.getView()
											.byId("id_RHPsQty").getValue())).toString();
										console.log("Updated prices", _this.oTirePriceModel.getData());
										var arrPrices = _this.oTirePriceModel.getData();
										var summed = 0;
										for (var key in arrPrices) {
											summed += Number(arrPrices[key]);
										}
										_this.oTireQuotationModel.getData().subTotal = _this.decimalFormatter(summed);
										_this.oTireQuotationModel.updateBindings(true);
										var dataRes = _this.oTireQuotationModel.getData();
										_this.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

										if (dataRes.FederalTax != "") {
											dataRes.FederalTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.FederalTax));
											_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.FederalTax);
											_this._oViewModelTax.setProperty("/enableFTC", true);
											_this.oTireQuotationModel.updateBindings(true);
											_this._oViewModelTax.updateBindings(true);
										} else {
											dataRes.FederalTaxSum = "";
											_this._oViewModelTax.setProperty("/enableFTC", false);
											_this.oTireQuotationModel.updateBindings(true);
											_this._oViewModelTax.updateBindings(true);
										}
										if (dataRes.ProvincialTax != "") {
											dataRes.ProvincialTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.ProvincialTax));
											_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.ProvincialTax);
											_this._oViewModelTax.setProperty("/enablePTC", true);
											_this.oTireQuotationModel.updateBindings(true);
											_this._oViewModelTax.updateBindings(true);
										} else {
											dataRes.ProvincialTaxSum = "";
											_this._oViewModelTax.setProperty("/enablePTC", false);
											_this.oTireQuotationModel.updateBindings(true);
											_this._oViewModelTax.updateBindings(true);
										}
										_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
										// _this.TotalAmount.setValue(_this.decimalFormatter(_this.sub));
										dataRes.Total = _this.decimalFormatter(_this.sub);
										_this.oTirePriceModel.updateBindings(true);
										_this.oTireQuotationModel.updateBindings(true);
									}
								}
								// _this.oTireQuotationModel.getData().RHPPRice = _this.rowData.RHPPRice;
								_this.oTireQuotationModel.updateBindings(true);
								_this.oTirePriceModel.updateBindings(true);
								_this.oGlobalBusyDialog.close();
							}
						} else {
							// sap.m.MessageBox.error(
							// 	"NO Pricing data found for Material"
							// );
							_this.oGlobalBusyDialog.close();
						}
					}, _this),
					error: function (oError) {
						// sap.m.MessageBox.error(
						// 	"NO Pricing data found for Material"
						// );
						_this.oGlobalBusyDialog.close();
					}
				});
			} else {
				_this.oTireQuotationModel.getData().RHPPRice = "";
				_this.oTirePriceModel.getData().RHPPriceSum = "";
				_this.getView().byId("id_RHPsQty").setValue();
				console.log("Updated prices", _this.oTirePriceModel.getData());
				var arrPrices = _this.oTirePriceModel.getData();
				var summed = 0;
				for (var key in arrPrices) {
					summed += Number(arrPrices[key]);
				}
				_this.oTireQuotationModel.getData().subTotal = _this.decimalFormatter(summed);
				_this.oTireQuotationModel.updateBindings(true);
				var dataRes = _this.oTireQuotationModel.getData();
				_this.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

				if (dataRes.FederalTax != "") {
					dataRes.FederalTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.FederalTax));
					_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.FederalTax);
					_this._oViewModelTax.setProperty("/enableFTC", true);
					_this.oTireQuotationModel.updateBindings(true);
					_this._oViewModelTax.updateBindings(true);
				} else {
					dataRes.FederalTaxSum = "";
					_this._oViewModelTax.setProperty("/enableFTC", false);
					_this.oTireQuotationModel.updateBindings(true);
					_this._oViewModelTax.updateBindings(true);
				}
				if (dataRes.ProvincialTax != "") {
					dataRes.ProvincialTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.ProvincialTax));
					_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.ProvincialTax);
					_this._oViewModelTax.setProperty("/enablePTC", true);
					_this.oTireQuotationModel.updateBindings(true);
					_this._oViewModelTax.updateBindings(true);
				} else {
					dataRes.ProvincialTaxSum = "";
					_this._oViewModelTax.setProperty("/enablePTC", false);
					_this.oTireQuotationModel.updateBindings(true);
					_this._oViewModelTax.updateBindings(true);
				}
				_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
				// _this.TotalAmount.setValue(_this.decimalFormatter(_this.sub));
				dataRes.Total = _this.decimalFormatter(_this.sub);
				_this.oTirePriceModel.updateBindings(true);
				_this.oTireQuotationModel.updateBindings(true);

				_this.oTireQuotationModel.updateBindings(true);
				_this.oGlobalBusyDialog.close();
			}
		},

		SelectDifferentTire: function () {
			if (_this.getView().byId("ID_SeriesYear") != undefined) {
				_this.getView().byId("ID_SeriesYear").setValue("");
			}
			if (_this.getView().byId("ID_VINQuote") != undefined) {
				_this.getView().byId("ID_VINQuote").setValue("");
			}
			if (_this.getView().byId("id_QuoteDate") != undefined) {
				_this.getView().byId("id_QuoteDate").setValue("");
			}
			if (_this.getView().byId("id_AfterExpiry") != undefined) {
				_this.getView().byId("id_AfterExpiry").setValue("");
			}
			if (_this.getView().byId("id_tireUnitPrice") != undefined) {
				_this.getView().byId("id_tireUnitPrice").setValue("");
			}
			if (_this.getView().byId("id_tireQty") != undefined) {
				_this.getView().byId("id_tireQty").setValue("");
			}
			if (_this.getView().byId("id_RHPUnitPrice") != undefined) {
				_this.getView().byId("id_RHPUnitPrice").setValue("");
			}
			if (_this.getView().byId("id_RHPsQty") != undefined) {
				_this.getView().byId("id_RHPsQty").setValue("");
			}
			if (_this.getView().byId("id_wheelsUnitPrice") != undefined) {
				_this.getView().byId("id_wheelsUnitPrice").setValue("");
			}
			if (_this.getView().byId("id_wheelsQty") != undefined) {
				_this.getView().byId("id_wheelsQty").setValue("");
			}
			if (_this.getView().byId("id_TPMSUnitPrice") != undefined) {
				_this.getView().byId("id_TPMSUnitPrice").setValue("");
			}
			if (_this.getView().byId("id_TPMSQty") != undefined) {
				_this.getView().byId("id_TPMSQty").setValue("");
			}
			if (_this.getView().byId("id_FittingKitUnitPrice") != undefined) {
				_this.getView().byId("id_FittingKitUnitPrice").setValue("");
			}
			if (_this.getView().byId("id_FittingKitQty") != undefined) {
				_this.getView().byId("id_FittingKitQty").setValue("");
			}
			// _this.getView().byId("id_FittingKitQty").setValue("");
			if (_this.getView().byId("wheelsText") != undefined) {
				_this.getView().byId("wheelsText").setValue("");
			}
			if (_this.getView().byId("TireTxt1") != undefined) {
				_this.getView().byId("TireTxt1").setText("");
			}
			if (_this.getView().byId("TireTxt2") != undefined) {
				_this.getView().byId("TireTxt3").setText("");
			}
			if (_this.getView().byId("TireTxt3") != undefined) {
				_this.getView().byId("TireTxt3").setText("");
			}
			if (_this.getView().byId("tmpsTxt") != undefined) {
				_this.getView().byId("tmpsTxt").setValue("");
			}
			if (_this.getView().byId("fittingkitTxt") != undefined) {
				_this.getView().byId("fittingkitTxt").setValue("");
			}
			if (_this.getView().byId("dealerTxt") != undefined) {
				_this.getView().byId("dealerTxt").setValue("");
			}
			if (_this.getView().byId("valItem1") != undefined) {
				_this.getView().byId("valItem1").setValue("");
			}
			if (_this.getView().byId("valItem2") != undefined) {
				_this.getView().byId("valItem2").setValue("");
			}
			if (_this.getView().byId("valItem3") != undefined) {
				_this.getView().byId("valItem3").setValue("");
			}
			if (_this.getView().byId("valItem4") != undefined) {
				_this.getView().byId("valItem4").setValue("");
			}
			if (_this.getView().byId("id_subTotal") != undefined) {
				_this.getView().byId("id_subTotal").setValue("");
			}
			if (_this.getView().byId("id_total") != undefined) {
				_this.getView().byId("id_total").setValue("");
			}
			if (_this.getView().byId("id_proTaxCode") != undefined) {
				_this.getView().byId("id_proTaxCode").setValue("");
			}
			if (_this.getView().byId("id_fedTaxCode") != undefined) {
				_this.getView().byId("id_fedTaxCode").setValue("");
			}
			if (_this.getView().byId("id_freeDescp") != undefined) {
				_this.getView().byId("id_freeDescp").setValue("");
			}
			_this.rowData = {};
			_this.oTireQuotationModel.setData(null);
			_this.oTirePriceModel.setData(null);
			_this.oTireQuotationModel.updateBindings(true);
			_this.oTireQuotationModel.refresh(true);
			_this.oTirePriceModel.updateBindings(true);
			_this.oTirePriceModel.refresh(true);
			sap.ui.core.UIComponent.getRouterFor(_this).navTo("searchResultsFromQuote");

			// _this.getRouter().navTo("searchResultsTireNoData", {
			// 	tireData: "selectDifferentTire"
			// });
		},

		generatePDF: function (oEvent) {

			var ModelData = oEvent.getSource().getParent().getParent().getModel("TireQuotationModel").getData();
			var ModelData2 = oEvent.getSource().getParent().getParent().getModel("TirePriceModel").getData();
			var ModelData3 = oEvent.getSource().getParent().getParent().getModel("TireQuoteModel").getData();
			if (this.userData.DealerData.Region != undefined) {
				var Region = this.userData.DealerData.Region;
			} else {
				Region = "";
			}

    
			var headers = {
				'x-odata-custom-RHP_PLN_DESC': this.getView().byId("id_RHP").getSelectedKey(),
				'x-odata-custom-RHP_UNIT': this.getView().byId("id_RHPUnitPrice").getValue(),
				'x-odata-custom-RHP_QTY': this.getView().byId("id_RHPsQty").getValue(),
				'x-odata-custom-RHP_PRICE': ModelData2.RHPPriceSum,
				'x-odata-custom-WAERS': 'CAD',
				'x-odata-custom-MTBL_PRICE': ModelData2.MnBPrice,
				'x-odata-custom-WHEELS_DESC': this.getView().byId("wheelsText").getValue(),
				'x-odata-custom-WHEELS_UNIT': this.getView().byId("id_wheelsUnitPrice").getValue(),
				'x-odata-custom-WHEELS_QTY': this.getView().byId("id_wheelsQty").getValue(),
				'x-odata-custom-WHEELS_PRICE': ModelData2.WheelsPrice,
				'x-odata-custom-TPMS_DESC: this.getView().byId("tmpsTxt").getValue(),
				'x-odata-custom-TPMS_UNIT': this.getView().byId("id_TPMSUnitPrice").getValue(),
				'x-odata-custom-TPMS_QTY': this.getView().byId("id_TPMSQty").getValue(),
				'x-odata-custom-TPMS_PRICE': ModelData2.TPMSPrice,
				'x-odata-custom-FIT_DESC': this.getView().byId("fittingkitTxt").getValue(),
				'x-odata-custom-FIT_UNIT': this.getView().byId("id_FittingKitUnitPrice").getValue(),
				'x-odata-custom-FIT_QTY': this.getView().byId("id_FittingKitQty").getValue(),
				'x-odata-custom-FIT_PRICE': ModelData2.FittingKitPrice,
				'x-odata-custom-OTH_ITMS_1': this.getView().byId("valItem1").getValue(),
				'x-odata-custom-OTH_ITMS_1_PR': ModelData2.otherItemPrice1,
				'x-odata-custom-OTH_ITMS_2': this.getView().byId("valItem2").getValue(),
				'x-odata-custom-OTH_ITMS_2_PR': ModelData2.otherItemPrice2,
				'x-odata-custom-OTH_ITMS_3': this.getView().byId("valItem3").getValue(),
				'x-odata-custom-OTH_ITMS_3_PR': ModelData2.otherItemPrice3,
				'x-odata-custom-OTH_ITMS_4': this.getView().byId("valItem4").getValue(),
				'x-odata-custom-OTH_ITMS_4_PR': ModelData2.otherItemPrice4,
				'x-odata-custom-SUB_TOTAL': ModelData.subTotal,
				'x-odata-custom-ENV_FEE_COST': ModelData.EHFPRice,
				'x-odata-custom-ENV_FEE': ModelData.EHFPriceSum,
				'x-odata-custom-GST': ModelData.FederalTaxSum,
				'x-odata-custom-PST': ModelData.ProvincialTaxSum,
				'x-odata-custom-TOTAL': ModelData.Total,
				'x-odata-custom-TIRE_DESC': ModelData.TireBrand + " " + ModelData.MatDesc_EN + " " + ModelData.TireCategory,
				'x-odata-custom-TIRE_SIZE_INFO': ModelData.TireSize + " " + ModelData.TireLoad + " " + ModelData.TireSpeed,
				'x-odata-custom-UNIT': ModelData.Retails,
				'x-odata-custom-QUANTITY': this.getView().byId("id_tireQty").getValue(),
				'x-odata-custom-PRICE': ModelData2.TiresPrice,
				'x-odata-custom-DLR_TEL': ModelData3.PhoneNumber,
				'x-odata-custom-VEHICLE_DES': ModelData.VehicleSeriesDescp,
				'x-odata-custom-VIN_NUM ': ModelData.VIN,
				'x-odata-custom-QUOTE_DATE ': ModelData3.CurrentDate,
				'x-odata-custom-OFFER_EXP_DT': ModelData3.expiryDate,
				'x-odata-custom-CUST_NAME': ModelData.CustName,
				'x-odata-custom-CUST_ADD_L1': ModelData.CustAddress,
				'x-odata-custom-CUST_ADD_L2  ': '',
				"x-odata-custom-CUST_ADD_L3": ModelData.CustPostalCode,
				'x-odata-custom-CUST_TEL': ModelData.CustPhone,
				'x-odata-custom-logo_info': sDivision
			};
			$.each(headers, function (key, value) {
				if (value === "" || value === null || value === undefined) {
					delete headers[key];
				}
			});

			console.log("Headers", headers);

			var that = this;
			this.oPDFModel = new sap.ui.model.odata.ODataModel(this.nodeJsUrl + "/ZSD_TIRE_QUOTATION_PDF_SRV_01", true);
			this.oPDFModel.setHeaders(headers);
			this.oPDFModel.setUseBatch(false);

			this.oPDFModel.read("/zc_tirequoteSet(DLR_NAME='" + this.userData.DealerData.BusinessPartnerName + "',DLR_ADD_L1='" + this.userData.DealerData
				.BusinessPartnerAddress + "',DLR_ADD_L2='" + Region + "')/$value", {
					success: function (oData, oResponse) {
						console.log("oData", oResponse);
						// window.open(oResponse.requestUri);
						var oHTML = new sap.ui.core.HTML({});
						oHTML.setContent("<iframe src=" + oResponse.requestUri + " width='700' height='700'></iframe>");
						// that.addContent(oHTML);
						sap.m.URLHelper.redirect( oResponse.requestUri, true );
					},
					error: function (oError) {
						console.log("oError", oError);
					}
				});
			// this.oPDFModel = new sap.ui.model.odata.v2.ODataModel(this.nodeJsUrl + "/ZSD_TIRE_QUOTATION_PDF_SRV_01", true);
			// this.oPDFModel.setUseBatch(false);
			// this.oPDFModel.setHeaders(headers);
			// this.oPDFModel.read("/zc_tirequoteSet(DlrName='" + this.userData.DealerData.BusinessPartnerName + "',DlrAddL1='" + this.userData.DealerData.BusinessPartnerAddress +"',DlrAddL2='" + Region + "')/$value", {
			// 		success: function (oData, oResponse) {
			// 			MessageToast.show("First Call success");
			// 			var htmlText = '<embed width=100% height=100%' + ' type="application/pdf"' + ' src="data:application/pdf,' + escape(oData) +
			// 				'"></embed>';
			// 			that._pdfViewer = new PDFViewer();
			// 			that.getView().addDependent(that._pdfViewer);
			// 			that._pdfViewer.setSource(htmlText);
			// 			that._pdfViewer.setTitle("Tire Quotation");
			// 			that._pdfViewer.open();
			// 		},
			// 		error: function (oError) {
			// 			var htmlText = '<embed width=100% height=100%' + ' type="application/pdf"' + ' src="data:application/pdf,' + escape(oError.responseText) +
			// 				'"></embed>';
			// 			that._pdfViewer = new PDFViewer();
			// 			that.getView().addDependent(that._pdfViewer);
			// 			that._pdfViewer.setSource(htmlText);
			// 			that._pdfViewer.setTitle("Tire Quotation");
			// 			that._pdfViewer.open();
			// 		}
			// 	});
		},

		changeUnitPrice: function (oUnitPrice) {
			//_this.oTireQuotationModel.getData().Retails = _this.decimalFormatter(oUnitPrice);
			_this.oTirePriceModel.updateBindings(true);
		},

		getUnitPrice: function (oUnit) {
			var oUnitPrice = oUnit.getSource().getValue();
			var data = _this.oTirePriceModel.getData();
			var dataRes = _this.oTireQuotationModel.getData();
			if (oUnit.getSource().getId().split("_")[3] == "tireUnitPrice") {
				_this.oTireQuotationModel.getData().Retails = parseFloat(oUnitPrice).toFixed(2);
				if (_this.getView().byId("id_tireQty").getValue() != "") {
					data.TiresPrice = _this.decimalFormatter(Number(oUnitPrice) * Number(_this.getView().byId("id_tireQty").getValue()));
				}
			} else if (oUnit.getSource().getId().split("_")[3] == "wheelsUnitPrice") {
				if (_this.getView().byId("id_wheelsQty").getValue() != "") {
					data.WheelsPrice = _this.decimalFormatter(Number(oUnitPrice) * Number(_this.getView().byId("id_wheelsQty").getValue()));
				}
			} else if (oUnit.getSource().getId().split("_")[3] == "TPMSUnitPrice") {
				if (_this.getView().byId("id_TPMSQty").getValue() != "") {
					data.TPMSPrice = _this.decimalFormatter(Number(oUnitPrice) * Number(_this.getView().byId("id_TPMSQty").getValue()));
				}
			} else if (oUnit.getSource().getId().split("_")[3] == "FittingKitUnitPrice") {
				if (_this.getView().byId("id_FittingKitQty").getValue() != "") {
					data.FittingKitPrice = _this.decimalFormatter(Number(oUnitPrice) * Number(_this.getView().byId("id_FittingKitQty").getValue()));
				}
			}
			var arrPrices = _this.oTirePriceModel.getData();
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			dataRes.subTotal = _this.decimalFormatter(summed);
			//_this.oTireQuotationModel.getData().Retails = oUnitPrice;
			_this.oTireQuotationModel.updateBindings(true);
			_this.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

			if (dataRes.FederalTax != "") {
				dataRes.FederalTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.FederalTax));
				_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.FederalTax);
				_this._oViewModelTax.setProperty("/enableFTC", true);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			} else {
				dataRes.FederalTaxSum = "";
				_this._oViewModelTax.setProperty("/enableFTC", false);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			}
			if (dataRes.ProvincialTax != "") {
				dataRes.ProvincialTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.ProvincialTax));
				_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.ProvincialTax);
				_this._oViewModelTax.setProperty("/enablePTC", true);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			} else {
				dataRes.ProvincialTaxSum = "";
				_this._oViewModelTax.setProperty("/enablePTC", false);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			}
			_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
			// _this.TotalAmount.setValue(_this.decimalFormatter(_this.sub));
			dataRes.Total = _this.decimalFormatter(_this.sub);
			_this.oTirePriceModel.updateBindings(true);
			_this.oTireQuotationModel.updateBindings(true);
		},

		calculatePrice: function (oQty) {
			var data = _this.oTirePriceModel.getData();
			var dataRes = _this.oTireQuotationModel.getData();

			var oQtyVal = oQty.getParameter("newValue");
			if (oQtyVal !== undefined || oQtyVal != null || oQtyVal != "") {
				if (oQty.getSource().getId().split("_")[3] == "tireQty") {
					if (_this.getView().byId("id_RHP").getSelectedKey() != "No Thank You") {
						_this.getView().byId("id_RHPsQty").setValue(oQtyVal);
						if (_this.oTireQuotationModel.getData().RHPPRice != "") {
							data.RHPPriceSum = _this.decimalFormatter(Number(_this.oTireQuotationModel.getData().RHPPRice) * Number(_this.getView()
								.byId("id_RHPsQty").getValue())).toString();
						}
					}
					// _this.oTirePrice = _this.getView().byId("id_tirePrice");
					_this.oTireUnitPrice = _this.getView().byId("id_tireUnitPrice").getValue();
					data.TiresPrice = _this.decimalFormatter(Number(oQtyVal * _this.oTireUnitPrice));
					if (dataRes.EHFPRice != "") {
						dataRes.EHFPriceSum = _this.decimalFormatter(Number(oQtyVal * dataRes.EHFPRice));
						_this._oViewModel.setProperty("/enableFee", true);
						_this._oViewModel.updateBindings(true);
					} else {
						_this._oViewModel.setProperty("/enableFee", false);
						_this._oViewModel.updateBindings(true);
					}
					_this._oViewModel.updateBindings(true);
					_this.oTireQuotationModel.updateBindings(true);
					_this.oTirePriceModel.updateBindings(true);

				} else if (oQty.getSource().getId().split("_")[3] == "wheelsQty") {
					_this.oWheelsePrice = _this.getView().byId("id_wheelsPrice");
					_this.oWheelsUnitPrice = _this.getView().byId("id_wheelsUnitPrice").getValue();
					data.WheelsPrice = _this.decimalFormatter(Number(oQtyVal * _this.oWheelsUnitPrice));
					_this.oTireQuotationModel.updateBindings(true);
					_this.oTirePriceModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "TPMSQty") {
					_this.oTPMSPrice = _this.getView().byId("id_TPMSPrice");
					_this.oTPMSUnitPrice = _this.getView().byId("id_TPMSUnitPrice").getValue();
					data.TPMSPrice = _this.decimalFormatter(Number(oQtyVal * _this.oTPMSUnitPrice));
					_this.oTireQuotationModel.updateBindings(true);
					_this.oTirePriceModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "FittingKitQty") {
					_this.oFittingKitPrice = _this.getView().byId("id_FittingKitPrice").getValue();
					_this.oFittingKitUnitPrice = _this.getView().byId("id_FittingKitUnitPrice").getValue();
					data.FittingKitPrice = _this.decimalFormatter(Number(oQtyVal * _this.oFittingKitUnitPrice));
					_this.oTireQuotationModel.updateBindings(true);
					_this.oTirePriceModel.updateBindings(true);
				} else {
					data.RHPPriceSum = _this.oTirePriceModel.getData().RHPPriceSum;
				}
			}

			console.log("Updated prices", _this.oTirePriceModel.getData());
			var arrPrices = _this.oTirePriceModel.getData();
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			dataRes.subTotal = _this.decimalFormatter(summed);
			_this.oTireQuotationModel.updateBindings(true);
			_this.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

			if (dataRes.FederalTax != "") {
				dataRes.FederalTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.FederalTax));
				_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.FederalTax);
				_this._oViewModelTax.setProperty("/enableFTC", true);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			} else {
				dataRes.FederalTaxSum = "";
				_this._oViewModelTax.setProperty("/enableFTC", false);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			}
			if (dataRes.ProvincialTax != "") {
				dataRes.ProvincialTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.ProvincialTax));
				_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.ProvincialTax);
				_this._oViewModelTax.setProperty("/enablePTC", true);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			} else {
				dataRes.ProvincialTaxSum = "";
				_this._oViewModelTax.setProperty("/enablePTC", false);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			}
			_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
			// _this.TotalAmount.setValue(_this.decimalFormatter(_this.sub));
			dataRes.Total = _this.decimalFormatter(_this.sub);
			_this.oTirePriceModel.updateBindings(true);
			_this.oTireQuotationModel.updateBindings(true);

			// var CheckData = _this.oTireQuotationModel.getData();
			if (dataRes != undefined) {
				if (dataRes.FederalTax != "") {
					_this._oViewModelTax.setProperty("/enableFTC", true);
					_this._oViewModelTax.updateBindings(true);
				} else {
					_this._oViewModelTax.setProperty("/enableFTC", false);
					_this._oViewModelTax.updateBindings(true);
				}
				if (dataRes.ProvincialTax != "") {
					_this._oViewModelTax.setProperty("/enablePTC", true);
					_this._oViewModelTax.updateBindings(true);
				} else {
					_this._oViewModelTax.setProperty("/enablePTC", false);
					_this._oViewModelTax.updateBindings(true);
				}
				if (dataRes.EHFPRice != "") {
					_this._oViewModelTax.setProperty("/enableFee", true);
					_this._oViewModelTax.updateBindings(true);
				} else {
					_this._oViewModelTax.setProperty("/enableFee", false);
					_this._oViewModelTax.updateBindings(true);
				}
			}

			_this._oViewModel.updateBindings(true);
			_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
			_this.oTireQuotationModel.updateBindings(true);
			_this.oTirePriceModel.updateBindings(true);
		},

		onValueChange: function (oNewValue) {
			var arrPrices = _this.oTirePriceModel.getData();
			var dataRes = _this.oTireQuotationModel.getData();

			if (oNewValue.getSource().getId().split("_")[3] == "MnBPrice") {
				arrPrices.MnBPrice = _this.getView().byId("id_MnBPrice").getValue();
				_this.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItemPrice") {
				arrPrices.otherItemPrice1 = _this.getView().byId("id_OtherItemPrice").getValue();
				_this.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem2Price") {
				arrPrices.otherItemPrice2 = _this.getView().byId("id_OtherItem2Price").getValue();
				_this.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem3Price") {
				arrPrices.otherItemPrice3 = _this.getView().byId("id_OtherItem3Price").getValue();
				_this.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem4Price") {
				arrPrices.otherItemPrice4 = _this.getView().byId("id_OtherItem4Price").getValue();
				_this.oTirePriceModel.updateBindings(true);
			}

			console.log("Updated prices", _this.oTirePriceModel.getData());
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			// _this.SubTotal.setValue(_this.decimalFormatter(summed));
			dataRes.subTotal = _this.decimalFormatter(summed);
			_this.oTireQuotationModel.updateBindings(true);
			_this.oTirePriceModel.updateBindings(true);

			_this.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);
			if (dataRes.FederalTax != "") {
				dataRes.FederalTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.FederalTax));
				_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.FederalTax);
				_this._oViewModelTax.setProperty("/enableFTC", true);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			} else {
				dataRes.FederalTaxSum = "";
				_this._oViewModelTax.setProperty("/enableFTC", false);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			}
			if (dataRes.ProvincialTax != "") {
				dataRes.ProvincialTaxSum = _this.decimalFormatter((_this.sub / 100) * Number(dataRes.ProvincialTax));
				_this.sub = _this.sub + (_this.sub / 100) * Number(dataRes.ProvincialTax);
				_this._oViewModelTax.setProperty("/enablePTC", true);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			} else {
				dataRes.ProvincialTaxSum = "";
				_this._oViewModelTax.setProperty("/enablePTC", false);
				_this.oTireQuotationModel.updateBindings(true);
				_this._oViewModelTax.updateBindings(true);
			}
			_this.getView().setModel(_this._oViewModelTax, "TireTaxModel");
			// _this.TotalAmount.setValue(_this.decimalFormatter(_this.sub));
			dataRes.Total = _this.decimalFormatter(_this.sub);
			_this.oTirePriceModel.updateBindings(true);
			_this.oTireQuotationModel.updateBindings(true);
		},

		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _this.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_this.getRouter().navTo("master");
			} else if (_oSelectedScreen == _this.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_this.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _this.oI18nModel.getResourceBundle().getText("ReportError")) {
				_this.getRouter().navTo("reportError");
			}
		},
		onAfterRendering: function () {

		},
		onExit: function () {
			_this.oTireQuotationModel.refresh(true);
			_this.oTirePriceModel.refresh(true);
			_this.destroy();
		}
	});
});