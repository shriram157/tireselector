sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History",
	'tireSelector/controller/BaseController',
	'sap/m/MessageToast',
], function (Controller, JSONModel, History, BaseController, MessageToast) {
	"use strict";
	var _this, sSelectedLocale, sDivision;
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

			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			if (isDivisionSent) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
				var currentImageSource;
				if (sDivision == '10') // set the toyoto logo
				{
					// DivUser = "TOY";
					currentImageSource = this.getView().byId("idLexusLogo");
					currentImageSource.setProperty("src", "images/toyota_logo_colour.png");

				} else { // set the lexus logo
					// DivUser = "LEX";
					currentImageSource = this.getView().byId("idLexusLogo");
					currentImageSource.setProperty("src", "images/LexusNew.png");
				}
			}

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
					"' and PRODH eq 'PARP10F22P101ECPRH'&?sap-client=200",
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