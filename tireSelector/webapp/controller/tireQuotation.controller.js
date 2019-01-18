var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History",
	'tireSelector/controller/BaseController'
], function (Controller, JSONModel, History, BaseController) {
	"use strict";

	return BaseController.extend("tireSelector.controller.tireQuotation", {
		onInit: function () {
			_that = this;
			_that.oGlobalBusyDialog = new sap.m.BusyDialog();
			_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			_that.oDateFormatShort = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "MM-dd-YYYY"
			});
			_that.currDate = _that.oDateFormatShort.format(new Date());
			var expiry = new Date().setDate(new Date(_that.currDate).getDate() + 15);
			_that.expDate = _that.oDateFormatShort.format(new Date(expiry));
			_that.phoneNumber = sap.ui.getCore().getModel("DealerModel").getData().DealerData.PhoneNumber;
			_that.getView().byId("DealerPhone").setValue(_that.phoneNumber);

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/tireSelector-dest";
				_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
			} else {
				this.sPrefix = "";
				// this.attributeUrl = "/userDetails/attributes";
			}
			// this.sPrefix = "";
			this.nodeJsUrl = this.sPrefix + "/node";
			if (sap.ushell.components.SearchOptionVIN != "") {
				_that.VIN = sap.ushell.components.SearchOptionVIN.getValue();
			}
			if (sap.ushell.components.SearchOptionVehicle != "") {
				_that.Vehicle = sap.ushell.components.SearchOptionVehicle.getValue();
			}
			if (sap.ushell.components.ModelSeriesCombo != "") {
				_that.ModelYr = sap.ushell.components.ModelSeriesCombo.getValue();
			}
			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableInput: false,
				vehicleVal: _that.Vehicle,
				modelval: _that.ModelYr,
				vinVal: _that.VIN,
				CurrentDate: _that.currDate,
				expiryDate: _that.expDate,
				PhoneNumber: _that.phoneNumber
			});
			_that.getView().setModel(_that._oViewModel, "TireQuoteModel");

			_that._oViewModelTax = new sap.ui.model.json.JSONModel({
				enableFTC: false,
				enablePTC: false,
				enableFee: false,
				vehicleVal: _that.Vehicle,
				modelval: _that.ModelYr,
				vinVal: _that.VIN,
			});
			_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");

			_that.getRouter().attachRouteMatched(function (oEvent) {
				_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
				_that.userData = sap.ui.getCore().getModel("DealerModel").getData();
				_that.phoneNumber = _that.userData.DealerData.PhoneNumber;

				jQuery.sap.require("sap.ui.core.format.DateFormat");
				_that.oDateFormatShort = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "MM-dd-YYYY"
				});
				_that.currDate = _that.oDateFormatShort.format(new Date());
				var expiry = new Date().setDate(new Date(_that.currDate).getDate() + 15);
				_that.expDate = _that.oDateFormatShort.format(new Date(expiry));

				_that._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableInput: false,
					vehicleVal: _that.Vehicle,
					modelval: _that.ModelYr,
					vinVal: _that.VIN,
					enableProdMarkup: false,
					CurrentDate: _that.currDate,
					expiryDate: _that.expDate,
					PhoneNumber: _that.phoneNumber
				});
				_that.getView().setModel(_that._oViewModel, "TireQuoteModel");

				_that.oTireQuotationModel = new JSONModel();
				_that.oTirePriceModel = new JSONModel();

				_that.oTireQuotationModel.setData(null);
				_that.oTireQuotationModel.updateBindings(true);
				_that.oTireQuotationModel.refresh(true);
				_that.oTirePriceModel.setData(null);
				_that.oTirePriceModel.updateBindings(true);
				_that.oTirePriceModel.refresh(true);
				_that.getView().setModel(_that.oTireQuotationModel, "TireQuotationModel");
				_that.getView().setModel(_that.oTirePriceModel, "TirePriceModel");

				//uncomment below for cloud testing
				var scopes = _that.userData.userContext.scopes;
				// var scopes = _that.userData.userContext.scopes;
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
					_that._oViewModel.setProperty("/enableProdMarkup", true);
				} else {
					_that._oViewModel.setProperty("/enableProdMarkup", false);
				}
				// if (scopes[1] == "tireSelectorS!t1188.ViewTireQuotes" && scopes[2] == "tireSelectorS!t1188.ManagerProductMarkups") {
				// 	_that._oViewModel.setProperty("/enableProdMarkup", true);
				// } else {
				// 	_that._oViewModel.setProperty("/enableProdMarkup", false);
				// }

				_that.oGlobalBusyDialog = new sap.m.BusyDialog();

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
					// _that.oGlobalBusyDialog.open();

					// console.log("rowData", oEvent.getParameter("arguments").rowData);
					_that.rowData = JSON.parse(oEvent.getParameter("arguments").rowData);
					_that.rowData.TireSize = _that.rowData.TireSize.replace("%2F", "/");
					_that.rowData.ProvincialTax = "";
					_that.rowData.FederalTax = "";
					_that.rowData.ProvincialTaxSum = "";
					_that.rowData.FederalTaxSum = "";
					_that.rowData.EHFPriceSum = "";
					_that.rowData.Total = "";
					_that.rowData.subTotal = "";
					_that.rowData.Retails = Number(_that.rowData.Retails);

					var oMat = _that.rowData.Material;
					var oMaterial = oMat;

					_that.objPrice = {};
					_that.objPrice.otherItemPrice1 = this.getView().byId("id_OtherItemPrice").getValue();
					_that.objPrice.otherItemPrice2 = this.getView().byId("id_OtherItem2Price").getValue();
					_that.objPrice.otherItemPrice3 = this.getView().byId("id_OtherItem3Price").getValue();
					_that.objPrice.otherItemPrice4 = this.getView().byId("id_OtherItem4Price").getValue();
					_that.objPrice.MnBPrice = this.getView().byId("id_MnBPrice").getValue();
					_that.objPrice.TiresPrice = this.getView().byId("id_tirePrice").getValue();
					_that.objPrice.WheelsPrice = this.getView().byId("id_wheelsPrice").getValue();
					_that.objPrice.TPMSPrice = this.getView().byId("id_TPMSPrice").getValue();
					_that.objPrice.FittingKitPrice = this.getView().byId("id_FittingKitPrice").getValue();
					_that.objPrice.RHPPriceSum = this.getView().byId("id_RHPPrice").getValue();
					// _that.objPrice.EHFPriceSum = this.getView().byId("id_freeDescp").getValue();

					_that.Division = _that.userData.DealerData.Division;
					_that.Doctype = "ZAF";
					_that.SalesOrg = "7000";
					_that.DistrChan = "10";
					_that.SoldtoParty = _that.userData.DealerData.BusinessPartner;

					var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype + "' and SalesOrg eq '" +
						_that.SalesOrg + "' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" + _that.SoldtoParty +
						"' and Material eq '" + oMaterial + "'";
					_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");
					_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
						success: $.proxy(function (oPriceData) {
								console.log("oPriceData", oPriceData);
								for (var n = 0; n < oPriceData.results.length; n++) {
									var CndType = oPriceData.results[n].CndType;
									if (CndType == "JRC4" || CndType == "JRC5") {
										_that.oTireQuotationModel.getData().FederalTax = Number(oPriceData.results[n].Amount);
									} else if (CndType == "JRC3" || CndType == "JRC2") {
										_that.oTireQuotationModel.getData().ProvincialTax = Number(oPriceData.results[n].Amount);
									} else if (CndType == "ZPEH" || CndType == "ZPEC") { //Freight Cost
										_that.oTireQuotationModel.getData().EHFPRice = Number(oPriceData.results[n].Amount);
									}
								}
							},
							_that),
						error: function (oError) {
							console.log("Error in fetching ZC_PriceSet", oError);
						}
					});
				}

				jQuery.sap.delayedCall(0, _that, function () {
					_that.oTireQuotationModel.setData(_that.rowData);
					_that.getView().setModel(_that.oTireQuotationModel, "TireQuotationModel");
					_that.oTireQuotationModel.updateBindings(true);
					_that.oTireQuotationModel.refresh(true);
					console.log("Tire Quote Data", _that.oTireQuotationModel.getData());
					_that.oTirePriceModel.setData(_that.objPrice);
					_that.getView().setModel(_that.oTirePriceModel, "TirePriceModel");
					_that.oTirePriceModel.updateBindings(true);
					_that.oTirePriceModel.refresh(true);

					console.log("Tire Price Data", _that.oTirePriceModel.getData());
					_that.oGlobalBusyDialog.close();
				});

				_that.item_01 = this.getView().byId("id_OtherItemPrice");
				_that.item_02 = this.getView().byId("id_OtherItem2Price");
				_that.item_03 = this.getView().byId("id_OtherItem3Price");
				_that.item_04 = this.getView().byId("id_OtherItem4Price");

				_that.tirePrice = this.getView().byId("id_tirePrice");
				_that.wheelsPrice = this.getView().byId("id_wheelsPrice");
				_that.TPMSPrice = this.getView().byId("id_TPMSPrice");
				_that.FittingKitPrice = this.getView().byId("id_FittingKitPrice");
				_that.RHPPrice = this.getView().byId("id_RHPPrice");
				_that.MNBPrice = this.getView().byId("id_MnBPrice");
				_that.SubTotal = this.getView().byId("id_subTotal");
				_that.TotalAmount = this.getView().byId("id_total");
				_that.ProTaxCode = this.getView().byId("id_proTaxCode");
				_that.FedTaxCode = this.getView().byId("id_fedTaxCode");
				_that.selectRHP = this.getView().byId("id_RHP");
				_that.EnvoFee = this.getView().byId("id_freeDescp");

				$.ajax({
					dataType: "json",
					url: this.nodeJsUrl + "/MD_PRODUCT_FS_SRV/ZC_Product_CategorySet?$filter=PRODH eq 'PARP10F22P101ECPRH'&?sap-client=200",
					type: "GET",
					success: function (oDataResponse) {
						if (oDataResponse.d.results.length > 0) {
							_that.matData = {
								"results": []
							};
							$.each(oDataResponse.d.results, function (i, item) {
								if (item.MATNR != "") {
									_that.matData.results.push({
										"MATNR": item.MATNR
									});
								}
							});
							console.log("ProductCategoryModel Data", _that.matData);
							_that.oProductCategoryModel = new JSONModel();
							_that.getView().setModel(_that.oProductCategoryModel, "ProductCategoryModel");
							_that.oProductCategoryModel.setData(_that.matData);
							_that.oProductCategoryModel.getData().results.unshift({
								"MATNR": "No Thank You"
							});
							_that.oProductCategoryModel.updateBindings(true);
							if (_that.getView().byId("id_RHP") !== undefined) {
								_that.getView().byId("id_RHP").setSelectedKey(_that.getView().byId("id_RHP").getItems()[0].getKey());
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
			}, this);

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
			_that.getRouter().navTo("master");
		},

		onMatSelection: function (oChange) {
			_that.oGlobalBusyDialog.open();
			var oMat = oChange.getParameter("selectedItem").getProperty("key");
			if (oMat != "No Thank You") {
				_that.getView().byId("id_RHPsQty").setValue(_that.getView().byId("id_tireQty").getValue());
				var oMaterial = oMat;
				_that.Division = _that.userData.DealerData.Division;
				_that.Doctype = "ZAF";
				_that.SalesOrg = "7000";
				_that.DistrChan = "10";
				_that.SoldtoParty = _that.userData.DealerData.BusinessPartner;

				var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype + "' and SalesOrg eq '" +
					_that.SalesOrg + "' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" + _that.SoldtoParty + "' and Material eq '" +
					oMaterial +
					"'";
				// _that.oService = this.nodeJsUrl + "/MD_PRODUCT_FS_SRV";
				_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");
				// _that.oPriceServiceModel = new sap.ui.model.odata.ODataModel(_that.oService, true);
				_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
					success: $.proxy(function (oPriceData) {
						if (oPriceData.results.length > 0) {
							for (var n = 0; n < oPriceData.results.length; n++) {
								var CndType = oPriceData.results[n].CndType;
								if (CndType == "ZPG4") { //if (CndType == "ZPEC" || CndType == "ZPEH") {
									_that.oTireQuotationModel.getData().RHPPRice = parseFloat(oPriceData.results[n].Amount).toFixed(2);
									if (_that.oTireQuotationModel.getData().RHPPRice != "") {
										_that.oTirePriceModel.getData().RHPPriceSum = (Number(_that.oTireQuotationModel.getData().RHPPRice) * Number(_that.getView()
											.byId("id_RHPsQty").getValue())).toString();
										console.log("Updated prices", _that.oTirePriceModel.getData());
										var arrPrices = _that.oTirePriceModel.getData();
										var summed = 0;
										for (var key in arrPrices) {
											summed += Number(arrPrices[key]);
										}
										_that.oTireQuotationModel.getData().subTotal = _that.decimalFormatter(summed);
										_that.oTireQuotationModel.updateBindings(true);
										var dataRes = _that.oTireQuotationModel.getData();
										_that.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

										if (dataRes.FederalTax != "") {
											dataRes.FederalTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.FederalTax));
											_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.FederalTax);
											_that._oViewModelTax.setProperty("/enableFTC", true);
											_that.oTireQuotationModel.updateBindings(true);
											_that._oViewModelTax.updateBindings(true);
										} else {
											dataRes.FederalTaxSum = "";
											_that._oViewModelTax.setProperty("/enableFTC", false);
											_that.oTireQuotationModel.updateBindings(true);
											_that._oViewModelTax.updateBindings(true);
										}
										if (dataRes.ProvincialTax != "") {
											dataRes.ProvincialTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.ProvincialTax));
											_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.ProvincialTax);
											_that._oViewModelTax.setProperty("/enablePTC", true);
											_that.oTireQuotationModel.updateBindings(true);
											_that._oViewModelTax.updateBindings(true);
										} else {
											dataRes.ProvincialTaxSum = "";
											_that._oViewModelTax.setProperty("/enablePTC", false);
											_that.oTireQuotationModel.updateBindings(true);
											_that._oViewModelTax.updateBindings(true);
										}
										_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");
										// _that.TotalAmount.setValue(_that.decimalFormatter(_that.sub));
										dataRes.Total = _that.decimalFormatter(_that.sub);
										_that.oTirePriceModel.updateBindings(true);
										_that.oTireQuotationModel.updateBindings(true);
									}
								}
								// _that.oTireQuotationModel.getData().RHPPRice = _that.rowData.RHPPRice;
								_that.oTireQuotationModel.updateBindings(true);
								_that.oTirePriceModel.updateBindings(true);
								_that.oGlobalBusyDialog.close();
							}
						} else {
							// sap.m.MessageBox.error(
							// 	"NO Pricing data found for Material"
							// );
							_that.oGlobalBusyDialog.close();
						}
					}, _that),
					error: function (oError) {
						// sap.m.MessageBox.error(
						// 	"NO Pricing data found for Material"
						// );
						_that.oGlobalBusyDialog.close();
					}
				});
			} else {
				_that.oTireQuotationModel.getData().RHPPRice = "";
				_that.oTirePriceModel.getData().RHPPriceSum = "";
				_that.getView().byId("id_RHPsQty").setValue();
				console.log("Updated prices", _that.oTirePriceModel.getData());
				var arrPrices = _that.oTirePriceModel.getData();
				var summed = 0;
				for (var key in arrPrices) {
					summed += Number(arrPrices[key]);
				}
				_that.oTireQuotationModel.getData().subTotal = _that.decimalFormatter(summed);
				_that.oTireQuotationModel.updateBindings(true);
				var dataRes = _that.oTireQuotationModel.getData();
				_that.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

				if (dataRes.FederalTax != "") {
					dataRes.FederalTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.FederalTax));
					_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.FederalTax);
					_that._oViewModelTax.setProperty("/enableFTC", true);
					_that.oTireQuotationModel.updateBindings(true);
					_that._oViewModelTax.updateBindings(true);
				} else {
					dataRes.FederalTaxSum = "";
					_that._oViewModelTax.setProperty("/enableFTC", false);
					_that.oTireQuotationModel.updateBindings(true);
					_that._oViewModelTax.updateBindings(true);
				}
				if (dataRes.ProvincialTax != "") {
					dataRes.ProvincialTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.ProvincialTax));
					_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.ProvincialTax);
					_that._oViewModelTax.setProperty("/enablePTC", true);
					_that.oTireQuotationModel.updateBindings(true);
					_that._oViewModelTax.updateBindings(true);
				} else {
					dataRes.ProvincialTaxSum = "";
					_that._oViewModelTax.setProperty("/enablePTC", false);
					_that.oTireQuotationModel.updateBindings(true);
					_that._oViewModelTax.updateBindings(true);
				}
				_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");
				// _that.TotalAmount.setValue(_that.decimalFormatter(_that.sub));
				dataRes.Total = _that.decimalFormatter(_that.sub);
				_that.oTirePriceModel.updateBindings(true);
				_that.oTireQuotationModel.updateBindings(true);

				_that.oTireQuotationModel.updateBindings(true);
				_that.oGlobalBusyDialog.close();
			}
		},

		SelectDifferentTire: function () {
			if (_that.getView().byId("id_QuoteDate") != undefined) {
				_that.getView().byId("id_QuoteDate").setValue("");
			}
			_that.getView().byId("id_AfterExpiry").setValue("");
			_that.getView().byId("id_tireUnitPrice").setValue("");
			_that.getView().byId("id_tireQty").setValue("");
			_that.getView().byId("id_RHPUnitPrice").setValue("");
			_that.getView().byId("id_RHPsQty").setValue("");
			_that.getView().byId("id_wheelsUnitPrice").setValue("");
			_that.getView().byId("id_wheelsQty").setValue("");
			_that.getView().byId("id_TPMSUnitPrice").setValue("");
			_that.getView().byId("id_TPMSQty").setValue("");
			_that.getView().byId("id_FittingKitUnitPrice").setValue("");
			_that.getView().byId("id_FittingKitQty").setValue("");

			_that.getView().byId("wheelsText").setValue("");
			_that.getView().byId("TireTxt1").setText("");
			_that.getView().byId("TireTxt2").setText("");
			_that.getView().byId("TireTxt3").setText("");

			_that.getView().byId("tmpsTxt").setValue("");
			_that.getView().byId("fittingkitTxt").setValue("");
			_that.getView().byId("dealerTxt").setValue("");
			_that.getView().byId("valItem1").setValue("");
			_that.getView().byId("valItem2").setValue("");
			_that.getView().byId("valItem3").setValue("");
			_that.getView().byId("valItem4").setValue("");

			_that.getView().byId("id_subTotal").setValue("");
			_that.getView().byId("id_total").setValue("");
			_that.getView().byId("id_proTaxCode").setValue("");
			_that.getView().byId("id_fedTaxCode").setValue("");
			_that.getView().byId("id_freeDescp").setValue("");

			_that.oTireQuotationModel.setData(null);
			_that.oTireQuotationModel.updateBindings(true);
			_that.oTireQuotationModel.refresh(true);
			_that.oTirePriceModel.setData(null);
			_that.oTirePriceModel.updateBindings(true);
			_that.oTirePriceModel.refresh(true);

			_that.getRouter().navTo("searchResultsTireNoData", {
				tireData: "selectDifferentTire"
			});
		},

		generatePDF: function (oEvent) {
			var oTarget = this.getView(oEvent),
				sTargetId = oEvent.getSource().data("targetId");
			if (sTargetId) {
				oTarget = oTarget.byId(sTargetId);
			}

			if (oTarget) {
				var $domTarget = oTarget.$()[0],
					sTargetContent = $domTarget.innerHTML,
					sOriginalContent = document.body.innerHTML;

				document.body.innerHTML = sTargetContent;
				window.print();
				document.body.innerHTML = sOriginalContent;
			} else {
				jQuery.sap.log.error("onPrint needs a valid target container [view|data:targetId=\"SID\"]");
			}

		},

		getUnitPrice: function (oUnit) {
			var oUnitPrice = oUnit.getParameter("newValue");
			var data = _that.oTirePriceModel.getData();
			var dataRes = _that.oTireQuotationModel.getData();
			if (oUnit.getSource().getId().split("_")[3] == "tireUnitPrice") {
				if (_that.getView().byId("id_tireQty").getValue() != "") {
					data.TiresPrice = _that.decimalFormatter(Number(oUnitPrice) * Number(_that.getView().byId("id_tireQty").getValue()));
				}
			} else if (oUnit.getSource().getId().split("_")[3] == "wheelsUnitPrice") {
				if (_that.getView().byId("id_wheelsQty").getValue() != "") {
					data.WheelsPrice = _that.decimalFormatter(Number(oUnitPrice) * Number(_that.getView().byId("id_wheelsQty").getValue()));
				}
			} else if (oUnit.getSource().getId().split("_")[3] == "TPMSUnitPrice") {
				if (_that.getView().byId("id_TPMSQty").getValue() != "") {
					data.TPMSPrice = _that.decimalFormatter(Number(oUnitPrice) * Number(_that.getView().byId("id_TPMSQty").getValue()));
				}
			} else if (oUnit.getSource().getId().split("_")[3] == "FittingKitUnitPrice") {
				if (_that.getView().byId("id_FittingKitQty").getValue() != "") {
					data.FittingKitPrice = _that.decimalFormatter(Number(oUnitPrice) * Number(_that.getView().byId("id_FittingKitQty").getValue()));
				}
			}
			var arrPrices = _that.oTirePriceModel.getData();
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			dataRes.subTotal = _that.decimalFormatter(summed);
			_that.oTireQuotationModel.updateBindings(true);
			_that.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

			if (dataRes.FederalTax != "") {
				dataRes.FederalTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.FederalTax));
				_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.FederalTax);
				_that._oViewModelTax.setProperty("/enableFTC", true);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			} else {
				dataRes.FederalTaxSum = "";
				_that._oViewModelTax.setProperty("/enableFTC", false);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			}
			if (dataRes.ProvincialTax != "") {
				dataRes.ProvincialTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.ProvincialTax));
				_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.ProvincialTax);
				_that._oViewModelTax.setProperty("/enablePTC", true);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			} else {
				dataRes.ProvincialTaxSum = "";
				_that._oViewModelTax.setProperty("/enablePTC", false);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			}
			_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");
			// _that.TotalAmount.setValue(_that.decimalFormatter(_that.sub));
			dataRes.Total = _that.decimalFormatter(_that.sub);
			_that.oTirePriceModel.updateBindings(true);
			_that.oTireQuotationModel.updateBindings(true);
		},

		calculatePrice: function (oQty) {
			var data = _that.oTirePriceModel.getData();
			var dataRes = _that.oTireQuotationModel.getData();

			var oQtyVal = oQty.getParameter("newValue");
			if (oQtyVal !== undefined || oQtyVal != null || oQtyVal != "") {
				if (oQty.getSource().getId().split("_")[3] == "tireQty") {
					_that.getView().byId("id_RHPsQty").setValue(oQtyVal);
					if (_that.oTireQuotationModel.getData().RHPPRice != "") {
						data.RHPPriceSum = _that.decimalFormatter(Number(_that.oTireQuotationModel.getData().RHPPRice) * Number(_that.getView()
							.byId("id_RHPsQty").getValue())).toString();
					}
					_that.oTirePrice = _that.getView().byId("id_tirePrice");
					_that.oTireUnitPrice = _that.getView().byId("id_tireUnitPrice").getValue();
					data.TiresPrice = _that.decimalFormatter(Number(oQtyVal * _that.oTireUnitPrice));
					if (dataRes.EHFPRice != "") {
						dataRes.EHFPriceSum = _that.decimalFormatter(Number(oQtyVal * dataRes.EHFPRice));
						_that._oViewModel.setProperty("/enableFee", true);
						_that._oViewModel.updateBindings(true);
					} else {
						_that._oViewModel.setProperty("/enableFee", false);
						_that._oViewModel.updateBindings(true);
					}
					_that._oViewModel.updateBindings(true);
					_that.oTireQuotationModel.updateBindings(true);
					_that.oTirePriceModel.updateBindings(true);

				} else if (oQty.getSource().getId().split("_")[3] == "wheelsQty") {
					_that.oWheelsePrice = _that.getView().byId("id_wheelsPrice");
					_that.oWheelsUnitPrice = _that.getView().byId("id_wheelsUnitPrice").getValue();
					data.WheelsPrice = _that.decimalFormatter(Number(oQtyVal * _that.oWheelsUnitPrice));
					_that.oTireQuotationModel.updateBindings(true);
					_that.oTirePriceModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "TPMSQty") {
					_that.oTPMSPrice = _that.getView().byId("id_TPMSPrice");
					_that.oTPMSUnitPrice = _that.getView().byId("id_TPMSUnitPrice").getValue();
					data.TPMSPrice = _that.decimalFormatter(Number(oQtyVal * _that.oTPMSUnitPrice));
					_that.oTireQuotationModel.updateBindings(true);
					_that.oTirePriceModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "FittingKitQty") {
					_that.oFittingKitPrice = _that.getView().byId("id_FittingKitPrice").getValue();
					_that.oFittingKitUnitPrice = _that.getView().byId("id_FittingKitUnitPrice").getValue();
					data.FittingKitPrice = _that.decimalFormatter(Number(oQtyVal * _that.oFittingKitUnitPrice));
					_that.oTireQuotationModel.updateBindings(true);
					_that.oTirePriceModel.updateBindings(true);
				} else {
					data.RHPPriceSum = _that.oTirePriceModel.getData().RHPPriceSum;
				}
			}

			console.log("Updated prices", _that.oTirePriceModel.getData());
			var arrPrices = _that.oTirePriceModel.getData();
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			dataRes.subTotal = _that.decimalFormatter(summed);
			_that.oTireQuotationModel.updateBindings(true);
			_that.sub = Number(dataRes.subTotal) + Number(dataRes.EHFPriceSum);

			if (dataRes.FederalTax != "") {
				dataRes.FederalTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.FederalTax));
				_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.FederalTax);
				_that._oViewModelTax.setProperty("/enableFTC", true);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			} else {
				dataRes.FederalTaxSum = "";
				_that._oViewModelTax.setProperty("/enableFTC", false);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			}
			if (dataRes.ProvincialTax != "") {
				dataRes.ProvincialTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.ProvincialTax));
				_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.ProvincialTax);
				_that._oViewModelTax.setProperty("/enablePTC", true);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			} else {
				dataRes.ProvincialTaxSum = "";
				_that._oViewModelTax.setProperty("/enablePTC", false);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			}
			_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");
			// _that.TotalAmount.setValue(_that.decimalFormatter(_that.sub));
			dataRes.Total = _that.decimalFormatter(_that.sub);
			_that.oTirePriceModel.updateBindings(true);
			_that.oTireQuotationModel.updateBindings(true);

			// var CheckData = _that.oTireQuotationModel.getData();
			if (dataRes != undefined) {
				if (dataRes.FederalTax != "") {
					_that._oViewModelTax.setProperty("/enableFTC", true);
					_that._oViewModelTax.updateBindings(true);
				} else {
					_that._oViewModelTax.setProperty("/enableFTC", false);
					_that._oViewModelTax.updateBindings(true);
				}
				if (dataRes.ProvincialTax != "") {
					_that._oViewModelTax.setProperty("/enablePTC", true);
					_that._oViewModelTax.updateBindings(true);
				} else {
					_that._oViewModelTax.setProperty("/enablePTC", false);
					_that._oViewModelTax.updateBindings(true);
				}
				if (dataRes.EHFPRice != "") {
					_that._oViewModelTax.setProperty("/enableFee", true);
					_that._oViewModelTax.updateBindings(true);
				} else {
					_that._oViewModelTax.setProperty("/enableFee", false);
					_that._oViewModelTax.updateBindings(true);
				}
			}

			_that._oViewModel.updateBindings(true);
			_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");
			_that.oTireQuotationModel.updateBindings(true);
			_that.oTirePriceModel.updateBindings(true);
		},

		onValueChange: function (oNewValue) {
			var arrPrices = _that.oTirePriceModel.getData();
			var dataRes = _that.oTireQuotationModel.getData();

			if (oNewValue.getSource().getId().split("_")[3] == "MnBPrice") {
				arrPrices.MnBPrice = _that.MNBPrice.getValue();
				_that.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItemPrice") {
				arrPrices.otherItemPrice1 = _that.item_01.getValue();
				_that.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem2Price") {
				arrPrices.otherItemPrice2 = _that.item_02.getValue();
				_that.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem3Price") {
				arrPrices.otherItemPrice3 = _that.item_03.getValue();
				_that.oTirePriceModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem4Price") {
				arrPrices.otherItemPrice4 = _that.item_04.getValue();
				_that.oTirePriceModel.updateBindings(true);
			}

			console.log("Updated prices", _that.oTirePriceModel.getData());
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			// _that.SubTotal.setValue(_that.decimalFormatter(summed));
			dataRes.subTotal = _that.decimalFormatter(summed);
			_that.oTireQuotationModel.updateBindings(true);
			_that.oTirePriceModel.updateBindings(true);

			_that.sub = Number(dataRes.subTotal);
			// if (_that.FedTaxCode.getValue() != "") {
			// 	_that.sub = Number(dataRes.subTotal) + (Number(dataRes.subTotal) / 100) + Number(_that.FedTaxCode.getValue());
			// }
			// if (_that.ProTaxCode.getValue() != "") {
			// 	_that.sub = Number(dataRes.subTotal) + (Number(dataRes.subTotal) / 100) + Number(_that.ProTaxCode.getValue());
			// }
			// // _that.TotalAmount.setValue(_that.decimalFormatter(_that.sub));
			if (dataRes.FederalTax != "") {
				dataRes.FederalTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.FederalTax));
				_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.FederalTax);
				_that._oViewModelTax.setProperty("/enableFTC", true);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			} else {
				dataRes.FederalTaxSum = "";
				_that._oViewModelTax.setProperty("/enableFTC", false);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			}
			if (dataRes.ProvincialTax != "") {
				dataRes.ProvincialTaxSum = _that.decimalFormatter((_that.sub / 100) * Number(dataRes.ProvincialTax));
				_that.sub = _that.sub + (_that.sub / 100) * Number(dataRes.ProvincialTax);
				_that._oViewModelTax.setProperty("/enablePTC", true);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			} else {
				dataRes.ProvincialTaxSum = "";
				_that._oViewModelTax.setProperty("/enablePTC", false);
				_that.oTireQuotationModel.updateBindings(true);
				_that._oViewModelTax.updateBindings(true);
			}
			_that.getView().setModel(_that._oViewModelTax, "TireTaxModel");
			// _that.TotalAmount.setValue(_that.decimalFormatter(_that.sub));
			dataRes.Total = _that.decimalFormatter(_that.sub);
			_that.oTirePriceModel.updateBindings(true);
			_that.oTireQuotationModel.updateBindings(true);
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
			_that.oTireQuotationModel.setData(null);
			_that.oTireQuotationModel.updateBindings(true);
			_that.oTireQuotationModel.refresh(true);
			_that.oTirePriceModel.setData(null);
			_that.oTirePriceModel.updateBindings(true);
			_that.oTirePriceModel.refresh(true);
			_that.destroy();
		}
	});
});