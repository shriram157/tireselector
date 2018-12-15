var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History",
	'tireSelector/controller/BaseController'
], function (Controller, JSONModel, History, BaseController) {
	"use strict";

	return BaseController.extend("tireSelector.controller.tireQuotation", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tireSelector.view.tireQuotation
		 */
		onInit: function () {
			_that = this;
			_that.oGlobalBusyDialog = new sap.m.BusyDialog();

			this.getRouter().attachRouteMatched(function (oEvent) {
				var sLocation = window.location.host;
				var sLocation_conf = sLocation.search("webide");

				if (sLocation_conf == 0) {
					this.sPrefix = "/tireSelector-dest";
				} else {
					this.sPrefix = "";
				}

				this.nodeJsUrl = this.sPrefix + "/node";

				_that._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableInput: false,
					vehicleVal: sap.ushell.components.SearchOptionVehicle.getValue(),
					modelval: sap.ushell.components.ModelSeriesCombo.getValue(),
					vinVal: sap.ushell.components.SearchOptionVIN.getValue(),
					enableFTC: true,
					enablePTC: true,
					enableFee: false
				});
				_that.getView().setModel(_that._oViewModel, "propertiesModel");

				_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"));
				console.log("DealerData", _that.getView().getModel("DealerModel"));

				if (oEvent.getParameter("arguments").rowData !== undefined) {
					_that.oGlobalBusyDialog.open();
					// console.log("rowData", oEvent.getParameter("arguments").rowData);
					_that.rowData = JSON.parse(oEvent.getParameter("arguments").rowData);
					
					var oMat = _that.rowData.Material;
					// _that.RHPFlag = "";
					// _that.getPrices(oMat);
					var oMaterial = oMat;
					_that.DealerData = sap.ui.getCore().getModel("DealerModel").getData();
					// console.log("Dealer Data", _that.DealerData);
					_that.Division = _that.DealerData.attributes[0].Division;
					_that.Doctype = "ZAF";
					_that.SalesOrg = "7000";
					_that.DistrChan = "10";
					_that.SoldtoParty = _that.DealerData.attributes[0].BusinessPartnerKey;

					var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype + "' and SalesOrg eq '" +
						_that.SalesOrg +
						"' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" + _that.SoldtoParty + "' and Material eq '" + oMaterial +
						"'&$format=json";
					_that.oService = this.nodeJsUrl + "/MD_PRODUCT_FS_SRV";
					_that.oPriceServiceModel = new sap.ui.model.odata.ODataModel(_that.oService, true);
					_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
						success: $.proxy(function (oPriceData) {
							for (var n = 0; n < oPriceData.results.length; n++) {
								var CndType = oPriceData.results[n].CndType;
								if (CndType == "JRC4" || CndType == "JRC5") {
									_that.rowData.FederalTax = _that.decimalFormatter(oPriceData.results[n].Amount);
								} else if (CndType == "JRC3" || CndType == "JRC2") {
									_that.rowData.ProvincialTax = _that.decimalFormatter(oPriceData.results[n].Amount);
								}
								_that.oGlobalBusyDialog.close();
							}
						}, _that),
						error: function (oError) {
							console.log("Error in fetching ZC_PriceSet", oError);
						}
					});
				}

				jQuery.sap.delayedCall(3000, _that, function () {
					var objPrice = {};
					objPrice.otherItemPrice1 = this.getView().byId("id_OtherItemPrice").getValue();
					objPrice.otherItemPrice2 = this.getView().byId("id_OtherItem2Price").getValue();
					objPrice.otherItemPrice3 = this.getView().byId("id_OtherItem3Price").getValue();
					objPrice.otherItemPrice4 = this.getView().byId("id_OtherItem4Price").getValue();
					objPrice.MnBPrice = this.getView().byId("id_MnBPrice").getValue();
					objPrice.TiresPrice = this.getView().byId("id_tirePrice").getValue();
					objPrice.WheelsPrice = this.getView().byId("id_wheelsPrice").getValue();
					objPrice.TPMSPrice = this.getView().byId("id_TPMSPrice").getValue();
					objPrice.FIttingKitPrice = this.getView().byId("id_FittingKitPrice").getValue();
					objPrice.RHPPrice = this.getView().byId("id_RHPPrice").getValue();

					var Obj = {
						"results": [_that.rowData],
						"prices": [objPrice]
					};
					_that.oTireQuotationModel = new JSONModel();
					_that.oTireQuotationModel.setData(Obj);

					if (_that.oTireQuotationModel.getData().results[0].FederalTax = "") {
						_that._oViewModel.setProperty("/enableFTC", false);
					} else {
						_that._oViewModel.setProperty("/enableFTC", true);
					}
					if (_that.oTireQuotationModel.getData().results[0].ProvincialTax = "") {
						_that._oViewModel.setProperty("/enablePTC", false);
					} else {
						_that._oViewModel.setProperty("/enablePTC", true);

					}
					// _that.oTireQuotationModel.getData().prices=[];
					_that.getView().setModel(_that.oTireQuotationModel, "TireQuotationModel");
					console.log("TireQuotation Data", _that.oTireQuotationModel);
					// var oTable = _that.getView().byId("tableQuotation");

					_that.oTireQuotationModel.updateBindings(true);
					console.log("Tire Quote Data", _that.oTireQuotationModel.getData().results[0]);

				});

				_that.item_01 = this.getView().byId("id_OtherItemPrice");
				_that.item_02 = this.getView().byId("id_OtherItem2Price");
				_that.item_03 = this.getView().byId("id_OtherItem3Price");
				_that.item_04 = this.getView().byId("id_OtherItem4Price");

				_that.tirePrice = this.getView().byId("id_tirePrice");
				_that.wheelsPrice = this.getView().byId("id_wheelsPrice");
				_that.TPMSPrice = this.getView().byId("id_TPMSPrice");
				_that.fittingKitPrice = this.getView().byId("id_FittingKitPrice");
				_that.RHPPrice = this.getView().byId("id_RHPPrice");
				_that.MNBPrice = this.getView().byId("id_MnBPrice");
				_that.SubTotal = this.getView().byId("id_subTotal");
				_that.TotalAmount = this.getView().byId("id_total");
				_that.ProTaxCode = this.getView().byId("id_proTaxCode");
				_that.FedTaxCode = this.getView().byId("id_fedTaxCode");

				// _that.arrPrices = [];

				$.ajax({
					dataType: "json",
					url: this.nodeJsUrl + "/MD_PRODUCT_FS_SRV/ZC_Product_CategorySet?$filter=PRODH eq 'PARP10F22P101ECPRH'&$format=json",
					type: "GET",
					success: function (oDataResponse) {
						console.log("Business Partner Data", oDataResponse.d.results);
						_that.oProductCategoryModel = new JSONModel();
						_that.getView().setModel(_that.oProductCategoryModel, "ProductCategoryModel");
						_that.oProductCategoryModel.setData(oDataResponse.d);
						_that.oProductCategoryModel.updateBindings(true);
					},
					error: function (oError) {}
				});

			}, this);
			// _that.sub = Number(_that.item_01.getValue())+Number( _that.item_02.getValue()) + Number( _that.item_03.getValue()) + Number(_that.item_04.getValue()) + Number(_that.tirePrice.getValue()) + Number(_that.wheelsPrice.getValue()) + Number(_that.TPMSPrice.getValue()) + Number(_that.fittingKitPrice.getValue()) + Number(_that.RHPPrice.getValue()) +
			// 	Number(_that.MNBPrice.getValue());

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

		onPressBreadCrumb: function (oEvtLink) {
			_that.getRouter().navTo("Routemaster");
		},

		getPrices: function (oMat) {
			var oMaterial = oMat;
			_that.DealerData = sap.ui.getCore().getModel("DealerModel").getData();
			console.log("Dealer Data", _that.DealerData);
			_that.Division = _that.DealerData.attributes[0].Division;
			_that.Doctype = "ZAF";
			_that.SalesOrg = "7000";
			_that.DistrChan = "10";
			_that.SoldtoParty = _that.DealerData.attributes[0].BusinessPartnerKey;

			var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype + "' and SalesOrg eq '" + _that.SalesOrg +
				"' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" + _that.SoldtoParty + "' and Material eq '" + oMaterial +
				"'&$format=json";
			_that.oService = this.nodeJsUrl + "/MD_PRODUCT_FS_SRV";
			_that.oPriceServiceModel = new sap.ui.model.odata.ODataModel(_that.oService, true);
			_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
				success: $.proxy(function (oData) {
					console.log("Initial load price data", oData);
					_that.oPriceModel.setData(oData);
					console.log("oPriceModel data", oData);
					for (var n = 0; n < _that.oPriceModel.getData().results.length; n++) {
						var CndType = _that.oPriceModel.getData().results[n].CndType;
						if (_that.RHPFlag == "Y") {
							if (CndType == "ZPFB") { //if (CndType == "ZPEC" || CndType == "ZPEH") {
								_that.rowData.environmentalFee = _that.decimalFormatter(_that.oPriceModel.getData().results[n].Amount);
							}
						} else {
							if (CndType == "CTXJ") {
								_that.rowData.FederalTax = _that.decimalFormatter(_that.oPriceModel.getData().results[n].Amount);
							} else if (CndType == "JRC5" || CndType == "JRC4" || CndType == "JRC3" || CndType == "JRC2") {
								_that.rowData.ProvincialTax = _that.decimalFormatter(_that.oPriceModel.getData().results[n].Amount);
							}
						}
						_that.oPriceModel.updateBindings(true);
					}
				}, _that),
				error: function (oError) {
					console.log("Error in fetching ZC_PriceSet", oError);
				}
			});
		},

		onMatSelection: function (oChange) {
			_that.oGlobalBusyDialog.open();
			var oMat = oChange.getParameter("selectedItem").getProperty("key");
			// _that.RHPFlag = "Y";
			// _that.getPrices(oMat);
			var oMaterial = oMat;
			_that.DealerData = sap.ui.getCore().getModel("DealerModel").getData();
			console.log("Dealer Data", _that.DealerData);
			_that.Division = _that.DealerData.attributes[0].Division;
			_that.Doctype = "ZAF";
			_that.SalesOrg = "7000";
			_that.DistrChan = "10";
			_that.SoldtoParty = _that.DealerData.attributes[0].BusinessPartnerKey;

			var filterdata = "?$filter=Division eq '" + _that.Division + "' and DocType eq '" + _that.Doctype + "' and SalesOrg eq '" +
				_that.SalesOrg +
				"' and DistrChan eq '" + _that.DistrChan + "' and SoldtoParty eq '" + _that.SoldtoParty + "' and Material eq '" + oMaterial +
				"'&$format=json";
			_that.oService = this.nodeJsUrl + "/MD_PRODUCT_FS_SRV";
			_that.oPriceServiceModel = new sap.ui.model.odata.ODataModel(_that.oService, true);
			_that.oPriceServiceModel.read("/ZC_PriceSet" + filterdata, {
				success: $.proxy(function (oPriceData) {
					for (var n = 0; n < oPriceData.results.length; n++) {
						var CndType = oPriceData.results[n].CndType;
						if (CndType == "ZPG4") { //if (CndType == "ZPEC" || CndType == "ZPEH") {
							_that.rowData.environmentalFee = _that.decimalFormatter(oPriceData.results[n].Amount);
						}
						_that.oTireQuotationModel.getData().results[0].environmentalFee = _that.rowData.environmentalFee;
						_that.oTireQuotationModel.updateBindings(true);
						_that.oGlobalBusyDialog.close();
					}
				}, _that),
				error: function (oError) {
					console.log("Error in fetching ZC_PriceSet", oError);
				}
			});
		},

		SelectDifferentTire: function () {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("searchResultsTireNoData", {}, true);
			}
			_that.oTireQuotationModel.setData(null);
			_that.oTireQuotationModel.updateBindings(true);
		},

		generatePDF: function (oEvent) {
			// 	var item_01, item_02, item_03, item_04, QuoteDate, AfterExpiryDate, tireUnitPrice, tireQty, selectRHP, MnBPrice, wheelsUnitPrice,
			// 		wheelsQty, TPMSUnitPrice, TPMSQty, FittingKitUnitPrice, FittingKitQty;
			// 	item_01 = this.getView().byId("id_OtherItemPrice");
			// 	item_02 = this.getView().byId("id_OtherItem2Price");
			// 	item_03 = this.getView().byId("id_OtherItem3Price");
			// 	item_04 = this.getView().byId("id_OtherItem4Price");

			// 	QuoteDate = this.getView().byId("id_QuoteDate");
			// 	AfterExpiryDate = this.getView().byId("id_AfterExpiry");
			// 	tireUnitPrice = this.getView().byId("id_tireUnitPrice");
			// 	tireQty = this.getView().byId("id_tireQty");
			// 	selectRHP = this.getView().byId("id_RHP");

			// 	MnBPrice = this.getView().byId("id_MnBPrice");
			// 	wheelsUnitPrice = this.getView().byId("id_wheelsUnitPrice");
			// 	wheelsQty = this.getView().byId("id_wheelsQty");
			// 	TPMSUnitPrice = this.getView().byId("id_TPMSUnitPrice");
			// 	TPMSQty = this.getView().byId("id_TPMSQty");
			// 	FittingKitUnitPrice = this.getView().byId("id_FittingKitUnitPrice");
			// 	FittingKitQty = this.getView().byId("id_FittingKitQty");

			// 	if (item_01.getValue() == "" || item_02.getValue() == "" || item_03.getValue() == "" || item_04.getValue() == "" || QuoteDate.getValue() ==
			// 		"" || AfterExpiryDate.getValue() == "" || tireUnitPrice.getValue() ==
			// 		"" || tireQty.getValue() == "" || selectRHP.getSelectedKey() == "" || MnBPrice.getValue() == "" || wheelsUnitPrice.getValue() ==
			// 		"" || wheelsQty.getValue() == "" || TPMSUnitPrice.getValue() == "" ||
			// 		TPMSQty == "" || FittingKitUnitPrice == "" || FittingKitQty == "") {

			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00001"));

			// 		if (item_01.getValue() == "") {
			// 			item_01.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (item_02.getValue() == "") {
			// 			item_02.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (item_03.getValue() == "") {
			// 			item_03.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (item_04.getValue() == "") {
			// 			item_04.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (QuoteDate.getValue() == "") {
			// 			QuoteDate.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (AfterExpiryDate.getValue() == "") {
			// 			AfterExpiryDate.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (tireUnitPrice.getValue() == "") {
			// 			tireUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (tireQty.getValue() == "") {
			// 			tireQty.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (selectRHP.getSelectedKey() == "") {
			// 			selectRHP.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (MnBPrice.getValue() == "") {
			// 			MnBPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (wheelsUnitPrice.getValue() == "") {
			// 			wheelsUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (wheelsQty.getValue() == "") {
			// 			wheelsQty.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (TPMSUnitPrice.getValue() == "") {
			// 			TPMSUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (TPMSQty == "") {
			// 			TPMSQty.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (FittingKitUnitPrice == "") {
			// 			FittingKitUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		} else if (FittingKitQty == "") {
			// 			FittingKitQty.setValueState(sap.ui.core.ValueState.Error);
			// 		}

			// 	} else if (tireQty.getValue() <= 0) {
			// 		//Tire Quantity is not > 0 (TSE00003)
			// 		tireQty.setValueState(sap.ui.core.ValueState.Error);
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00003"));
			// 	} else if (wheelsUnitPrice.getValue() > 0 && wheelsQty == 0) {
			// 		wheelsQty.setValueState(sap.ui.core.ValueState.Error);
			// 		//Wheels Unit Price is > 0 but Wheels Quantity is 0 (TSE00004).
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00004"));
			// 	} else if (wheelsUnitPrice.getValue() == 0 && wheelsQty > 0) {
			// 		wheelsUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		//Wheels Unit Price is 0 but Wheels Quantity is > 0 (TSE00005)
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00005"));
			// 	} else if (TPMSUnitPrice.getValue() > 0 && TPMSQty == 0) {
			// 		TPMSQty.setValueState(sap.ui.core.ValueState.Error);
			// 		//TPMS Unit Price is > 0 but TPMS Quantity is 0 (TSE00006).
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00006"));
			// 	} else if (TPMSUnitPrice.getValue() == 0 && TPMSQty > 0) {
			// 		TPMSUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		//TPMS Unit Price is 0 but TPMS Quantity is > 0 (TSE00007).
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00007"));
			// 	} else if (FittingKitUnitPrice.getValue() > 0 && FittingKitQty == 0) {
			// 		FittingKitQty.setValueState(sap.ui.core.ValueState.Error);
			// 		//Fitting Kits Unit Price is > 0 but Fitting Kits Quantity is 0 (TSE00008).
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00008"));
			// 	} else if (FittingKitUnitPrice.getValue() == 0 && FittingKitQty > 0) {
			// 		FittingKitUnitPrice.setValueState(sap.ui.core.ValueState.Error);
			// 		//Fitting Kits Unit Price is 0 but Fitting Kits Quantity is > 0 (TSE00009).
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
			// 		_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00009"));
			// 	}
			// 	// else if(){
			// 	// 	//Road Hazard Protection is <> "No Thank You) and (Tire Quantity is not the same as Road Hazard Protection Quantity) (TSE00011). 
			// 	// }
			// 	else {
			// 		item_01.setValueState(sap.ui.core.ValueState.Success);
			// 		item_02.setValueState(sap.ui.core.ValueState.Success);
			// 		item_03.setValueState(sap.ui.core.ValueState.Success);
			// 		item_04.setValueState(sap.ui.core.ValueState.Success);
			// 		QuoteDate.setValueState(sap.ui.core.ValueState.Success);
			// 		AfterExpiryDate.setValueState(sap.ui.core.ValueState.Success);
			// 		tireUnitPrice.setValueState(sap.ui.core.ValueState.Success);
			// 		tireQty.setValueState(sap.ui.core.ValueState.Success);
			// 		selectRHP.setValueState(sap.ui.core.ValueState.Success);
			// 		MnBPrice.setValueState(sap.ui.core.ValueState.Success);
			// 		wheelsUnitPrice.setValueState(sap.ui.core.ValueState.Success);
			// 		wheelsQty.setValueState(sap.ui.core.ValueState.Success);
			// 		TPMSUnitPrice.setValueState(sap.ui.core.ValueState.Success);
			// 		TPMSQty.setValueState(sap.ui.core.ValueState.Success);
			// 		FittingKitUnitPrice.setValueState(sap.ui.core.ValueState.Success);
			// 		FittingKitQty.setValueState(sap.ui.core.ValueState.Success);
			// 		_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
			// 	}

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
			if (oUnit.getSource().getId().split("_")[3] == "wheelsUnitPrice") {
				_that.oWheelsUnitPrice = oUnitPrice;
			} else if (oUnit.getSource().getId().split("_")[3] == "TPMSUnitPrice") {
				_that.oTPMSUnitPrice = oUnitPrice;
			} else if (oUnit.getSource().getId().split("_")[3] == "FittingKitUnitPrice") {
				_that.oFittingKitUnitPrice = oUnitPrice;
			}
		},
		calculatePrice: function (oQty) {
			var data = _that.oTireQuotationModel.getData().prices[0];

			var oQtyVal = oQty.getParameter("newValue");
			if (oQtyVal !== undefined || oQtyVal != null || oQtyVal != "") {
				if (oQty.getSource().getId().split("_")[3] == "tireQty") {
					_that.oTirePrice = _that.getView().byId("id_tirePrice");
					_that.oTireUnitPrice = _that.getView().byId("id_tireUnitPrice").getValue();
					data.TiresPrice = Number(oQtyVal * _that.oTireUnitPrice);
					_that.oTireQuotationModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "wheelsQty") {
					_that.oWheelsePrice = _that.getView().byId("id_wheelsPrice");
					data.WheelsPrice = Number(oQtyVal * _that.oWheelsUnitPrice);
					_that.oTireQuotationModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "TPMSQty") {
					_that.oTPMSPrice = _that.getView().byId("id_TPMSPrice");
					data.TPMSPrice = Number(oQtyVal * _that.oTPMSUnitPrice);
					_that.oTireQuotationModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "FittingKitQty") {
					_that.oFittingKitPrice = _that.getView().byId("id_FittingKitPrice");
					_that.oFittingKitPrice.setValue(oQtyVal * _that.oFittingKitUnitPrice);
					data.TPMSPrice = Number(oQtyVal * _that.oFittingKitUnitPrice);
					_that.oTireQuotationModel.updateBindings(true);
				} else if (oQty.getSource().getId().split("_")[3] == "RHPsQty") {
					_that.RHPPrice = _that.getView().byId("id_RHPPrice");
					_that.oRHPUnitPrice = _that.getView().byId("id_RHPUnitPrice").getValue();
					data.RHPPrice = Number(oQtyVal * _that.oRHPUnitPrice);
					_that.oTireQuotationModel.updateBindings(true);
				}
			}

			console.log("Updated prices", _that.oTireQuotationModel.getData().prices[0]);
			var arrPrices = _that.oTireQuotationModel.getData().prices[0];
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			_that.SubTotal.setValue(_that.decimalFormatter(summed));
			_that.sub = Number(_that.SubTotal.getValue());
			// _that.sub = _that.decimalFormatter(_that.sub);
			if (_that.FedTaxCode.getValue() != "") {
				_that.sub = _that.sub + (_that.sub / 100) * Number(_that.FedTaxCode.getValue());
			}
			if (_that.ProTaxCode.getValue() != "") {
				_that.sub = _that.sub + (_that.sub / 100) * Number(_that.ProTaxCode.getValue());
			}
			_that.TotalAmount.setValue(_that.decimalFormatter((_that.sub)));
		},

		onValueChange: function (oNewValue) {
			var arrPrices = _that.oTireQuotationModel.getData().prices[0];

			if (oNewValue.getSource().getId().split("_")[3] == "MnBPrice") {
				arrPrices.MnBPrice = Number(_that.MNBPrice.getValue());
				_that.oTireQuotationModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItemPrice") {
				arrPrices.otherItemPrice1 = Number(_that.item_01.getValue());
				_that.oTireQuotationModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem2Price") {
				arrPrices.otherItemPrice2 = Number(_that.item_02.getValue());
				_that.oTireQuotationModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem3Price") {
				arrPrices.otherItemPrice3 = Number(_that.item_03.getValue());
				_that.oTireQuotationModel.updateBindings(true);
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem4Price") {
				arrPrices.otherItemPrice4 = Number(_that.item_04.getValue());
				_that.oTireQuotationModel.updateBindings(true);
			}

			console.log("Updated prices", _that.oTireQuotationModel.getData().prices[0]);
			var summed = 0;
			for (var key in arrPrices) {
				summed += Number(arrPrices[key]);
			}
			_that.SubTotal.setValue(_that.decimalFormatter(summed));
			_that.sub = Number(_that.SubTotal.getValue());
			if (_that.FedTaxCode.getValue() != "") {
				_that.sub = _that.sub + (_that.sub / 100) * Number(_that.FedTaxCode.getValue());
			}
			if (_that.ProTaxCode.getValue() != "") {
				_that.sub = _that.sub + (_that.sub / 100) * Number(_that.ProTaxCode.getValue());
			}
			_that.TotalAmount.setValue(_that.decimalFormatter((_that.sub)));
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
		onAfterRendering: function () {

		},

		onExit: function () {
			_that.oTireQuotationModel.setData(null);
			_that.oTireQuotationModel.updateBindings(true);
		}

	});

});