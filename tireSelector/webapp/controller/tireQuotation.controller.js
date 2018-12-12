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

			this.getRouter().attachRouteMatched(function (oEvent) {
				if (oEvent.getParameter("arguments").rowData !== undefined) {
					console.log("rowData", oEvent.getParameter("arguments").rowData);
					var rowData = oEvent.getParameter("arguments").rowData;
					//rowData {"TireFitment":"Other","TireCategory":"Winter","TireBrandDesc":"BranDescription1",
					//"LoadRate":"999","PartNumber":"12345678","DealerNet":"9.99","Profit":"15.00",
					//"Retails":"24.99","Ratings":"3"}
				}
				var Obj = {
					"data": rowData
				};
				_that.oTireQuotationModel = new JSONModel();
				_that.getView().setModel(_that.oTireQuotationModel, "TireQuotationModel");
				_that.oTireQuotationModel.setData(Obj);
				// console.log("Model",_that.oTireQuotationModel);

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

				_that.arrPrices = [];

			}, this);
			// _that.sub = Number(_that.item_01.getValue())+Number( _that.item_02.getValue()) + Number( _that.item_03.getValue()) + Number(_that.item_04.getValue()) + Number(_that.tirePrice.getValue()) + Number(_that.wheelsPrice.getValue()) + Number(_that.TPMSPrice.getValue()) + Number(_that.fittingKitPrice.getValue()) + Number(_that.RHPPrice.getValue()) +
			// 	Number(_that.MNBPrice.getValue());

			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableInput: false
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
		},
		onPressBreadCrumb: function (oEvtLink) {
			_that.getRouter().navTo("Routemaster");
		},

		SelectDifferentTire: function () {
			// 	var oHistory, sPreviousHash;
			// 	oHistory = History.getInstance();
			// 	sPreviousHash = oHistory.getPreviousHash();

			// 	if (sPreviousHash !== undefined) {
			// 		window.history.go(-1);
			// 	} else {
			this.getRouter().navTo("searchResultsTireNoData", {}, true);
			// }
		},

		generatePDF: function () {
			var item_01, item_02, item_03, item_04, QuoteDate, AfterExpiryDate, tireUnitPrice, tireQty, selectRHP, MnBPrice, wheelsUnitPrice,
				wheelsQty, TPMSUnitPrice, TPMSQty, FittingKitUnitPrice, FittingKitQty;
			item_01 = this.getView().byId("id_OtherItemPrice");
			item_02 = this.getView().byId("id_OtherItem2Price");
			item_03 = this.getView().byId("id_OtherItem3Price");
			item_04 = this.getView().byId("id_OtherItem4Price");

			QuoteDate = this.getView().byId("id_QuoteDate");
			AfterExpiryDate = this.getView().byId("id_AfterExpiry");
			tireUnitPrice = this.getView().byId("id_tireUnitPrice");
			tireQty = this.getView().byId("id_tireQty");
			selectRHP = this.getView().byId("id_RHP");

			MnBPrice = this.getView().byId("id_MnBPrice");
			wheelsUnitPrice = this.getView().byId("id_wheelsUnitPrice");
			wheelsQty = this.getView().byId("id_wheelsQty");
			TPMSUnitPrice = this.getView().byId("id_TPMSUnitPrice");
			TPMSQty = this.getView().byId("id_TPMSQty");
			FittingKitUnitPrice = this.getView().byId("id_FittingKitUnitPrice");
			FittingKitQty = this.getView().byId("id_FittingKitQty");

			if (item_01.getValue() == "" || item_02.getValue() == "" || item_03.getValue() == "" || item_04.getValue() == "" || QuoteDate.getValue() ==
				"" || AfterExpiryDate.getValue() == "" || tireUnitPrice.getValue() ==
				"" || tireQty.getValue() == "" || selectRHP.getSelectedKey() == "" || MnBPrice.getValue() == "" || wheelsUnitPrice.getValue() ==
				"" || wheelsQty.getValue() == "" || TPMSUnitPrice.getValue() == "" ||
				TPMSQty == "" || FittingKitUnitPrice == "" || FittingKitQty == "") {

				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00001"));

				if (item_01.getValue() == "") {
					item_01.setValueState(sap.ui.core.ValueState.Error);
				} else if (item_02.getValue() == "") {
					item_02.setValueState(sap.ui.core.ValueState.Error);
				} else if (item_03.getValue() == "") {
					item_03.setValueState(sap.ui.core.ValueState.Error);
				} else if (item_04.getValue() == "") {
					item_04.setValueState(sap.ui.core.ValueState.Error);
				} else if (QuoteDate.getValue() == "") {
					QuoteDate.setValueState(sap.ui.core.ValueState.Error);
				} else if (AfterExpiryDate.getValue() == "") {
					AfterExpiryDate.setValueState(sap.ui.core.ValueState.Error);
				} else if (tireUnitPrice.getValue() == "") {
					tireUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				} else if (tireQty.getValue() == "") {
					tireQty.setValueState(sap.ui.core.ValueState.Error);
				} else if (selectRHP.getSelectedKey() == "") {
					selectRHP.setValueState(sap.ui.core.ValueState.Error);
				} else if (MnBPrice.getValue() == "") {
					MnBPrice.setValueState(sap.ui.core.ValueState.Error);
				} else if (wheelsUnitPrice.getValue() == "") {
					wheelsUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				} else if (wheelsQty.getValue() == "") {
					wheelsQty.setValueState(sap.ui.core.ValueState.Error);
				} else if (TPMSUnitPrice.getValue() == "") {
					TPMSUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				} else if (TPMSQty == "") {
					TPMSQty.setValueState(sap.ui.core.ValueState.Error);
				} else if (FittingKitUnitPrice == "") {
					FittingKitUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				} else if (FittingKitQty == "") {
					FittingKitQty.setValueState(sap.ui.core.ValueState.Error);
				}

			} else if (tireQty.getValue() <= 0) {
				//Tire Quantity is not > 0 (TSE00003)
				tireQty.setValueState(sap.ui.core.ValueState.Error);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00003"));
			} else if (wheelsUnitPrice.getValue() > 0 && wheelsQty == 0) {
				wheelsQty.setValueState(sap.ui.core.ValueState.Error);
				//Wheels Unit Price is > 0 but Wheels Quantity is 0 (TSE00004).
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00004"));
			} else if (wheelsUnitPrice.getValue() == 0 && wheelsQty > 0) {
				wheelsUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				//Wheels Unit Price is 0 but Wheels Quantity is > 0 (TSE00005)
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00005"));
			} else if (TPMSUnitPrice.getValue() > 0 && TPMSQty == 0) {
				TPMSQty.setValueState(sap.ui.core.ValueState.Error);
				//TPMS Unit Price is > 0 but TPMS Quantity is 0 (TSE00006).
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00006"));
			} else if (TPMSUnitPrice.getValue() == 0 && TPMSQty > 0) {
				TPMSUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				//TPMS Unit Price is 0 but TPMS Quantity is > 0 (TSE00007).
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00007"));
			} else if (FittingKitUnitPrice.getValue() > 0 && FittingKitQty == 0) {
				FittingKitQty.setValueState(sap.ui.core.ValueState.Error);
				//Fitting Kits Unit Price is > 0 but Fitting Kits Quantity is 0 (TSE00008).
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00008"));
			} else if (FittingKitUnitPrice.getValue() == 0 && FittingKitQty > 0) {
				FittingKitUnitPrice.setValueState(sap.ui.core.ValueState.Error);
				//Fitting Kits Unit Price is 0 but Fitting Kits Quantity is > 0 (TSE00009).
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00009"));
			}
			// else if(){
			// 	//Road Hazard Protection is <> "No Thank You) and (Tire Quantity is not the same as Road Hazard Protection Quantity) (TSE00011). 
			// }
			else {
				item_01.setValueState(sap.ui.core.ValueState.Success);
				item_02.setValueState(sap.ui.core.ValueState.Success);
				item_03.setValueState(sap.ui.core.ValueState.Success);
				item_04.setValueState(sap.ui.core.ValueState.Success);
				QuoteDate.setValueState(sap.ui.core.ValueState.Success);
				AfterExpiryDate.setValueState(sap.ui.core.ValueState.Success);
				tireUnitPrice.setValueState(sap.ui.core.ValueState.Success);
				tireQty.setValueState(sap.ui.core.ValueState.Success);
				selectRHP.setValueState(sap.ui.core.ValueState.Success);
				MnBPrice.setValueState(sap.ui.core.ValueState.Success);
				wheelsUnitPrice.setValueState(sap.ui.core.ValueState.Success);
				wheelsQty.setValueState(sap.ui.core.ValueState.Success);
				TPMSUnitPrice.setValueState(sap.ui.core.ValueState.Success);
				TPMSQty.setValueState(sap.ui.core.ValueState.Success);
				FittingKitUnitPrice.setValueState(sap.ui.core.ValueState.Success);
				FittingKitQty.setValueState(sap.ui.core.ValueState.Success);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
			}

		},

		getUnitPrice: function (oUnit) {
			var oUnitPrice = oUnit.getParameter("newValue");
			// if (oUnit.getSource().getId().split("_")[3] == "tireUnitPrice") {
			// 	_that.oTireUnitPrice = oUnitPrice;
			// } else 
			if (oUnit.getSource().getId().split("_")[3] == "wheelsUnitPrice") {
				_that.oWheelsUnitPrice = oUnitPrice;
			} else if (oUnit.getSource().getId().split("_")[3] == "TPMSUnitPrice") {
				_that.oTPMSUnitPrice = oUnitPrice;
			} else if (oUnit.getSource().getId().split("_")[3] == "FittingKitUnitPrice") {
				_that.oFittingKitUnitPrice = oUnitPrice;
			} else if (oUnit.getSource().getId().split("_")[3] == "RHPUnitPrice") {
				_that.oRHPUnitPrice = oUnitPrice;
			}
		},
		calulcatePrice: function (oQty) {
			var oQtyVal = oQty.getParameter("newValue");
			if (oQty.getSource().getId().split("_")[3] == "tireQty") {
				_that.oTirePrice = _that.getView().byId("id_tirePrice");
				_that.oTireUnitPrice = _that.getView().byId("id_tireUnitPrice");
				_that.oTirePrice.setValue(oQtyVal * _that.oTireUnitPrice.getValue());
				_that.arrPrices.push(Number(_that.oTirePrice.getValue()));
			} else if (oQty.getSource().getId().split("_")[3] == "wheelsQty") {
				_that.oWheelsePrice = _that.getView().byId("id_wheelsPrice");
				_that.oWheelsePrice.setValue(oQtyVal * _that.oWheelsUnitPrice);
				if (_that.oWheelsePrice.getValue() !== undefined) {
					_that.arrPrices.push(Number(_that.oWheelsePrice.getValue()));
				}
			} else if (oQty.getSource().getId().split("_")[3] == "TPMSQty") {
				_that.oTPMSPrice = _that.getView().byId("id_TPMSPrice");
				_that.oTPMSPrice.setValue(oQtyVal * _that.oTPMSUnitPrice);
				if (_that.oTPMSPrice.getValue() !== undefined) {
					_that.arrPrices.push(Number(_that.oTPMSPrice.getValue()));
				}
			} else if (oQty.getSource().getId().split("_")[3] == "FittingKitQty") {
				_that.oFittingKitPrice = _that.getView().byId("id_FittingKitPrice");
				_that.oFittingKitPrice.setValue(oQtyVal * _that.oFittingKitUnitPrice);
				if (_that.oFittingKitPrice.getValue() !== undefined) {
					_that.arrPrices.push(Number(_that.oFittingKitPrice.getValue()));
				}
			} else if (oQty.getSource().getId().split("_")[3] == "RHPsQty") {
				_that.RHPPrice = _that.getView().byId("id_RHPPrice");
				_that.RHPPrice.setValue(oQtyVal * _that.oRHPUnitPrice);
				if (_that.RHPPrice.getValue() !== undefined) {
					_that.arrPrices.push(Number(_that.RHPPrice.getValue()));
				}
			}
			var sum = _that.arrPrices.reduce(function (a, b) {
				return a + b;
			}, 0);
			_that.SubTotal.setValue(sum);
		},

		onValueChange: function (oNewValue) {
			console.log("subTotal value", _that.SubTotal.getValue());
			if (oNewValue.getSource().getId().split("_")[3] == "MnBPrice") {
				_that.arrPrices.push(Number(_that.MNBPrice.getValue()));
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItemPrice") {
				_that.arrPrices.push(Number(_that.item_01.getValue()));
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem2Price") {
				_that.arrPrices.push(Number(_that.item_02.getValue()));
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem3Price") {
				_that.arrPrices.push(Number(_that.item_03.getValue()));
			} else if (oNewValue.getSource().getId().split("_")[3] == "OtherItem4Price") {
				_that.arrPrices.push(Number(_that.item_04.getValue()));
			} 
			// else if (oNewValue.getSource().getId().split("_")[3] == "fedTaxCode") {
			// 	_that.Total = _that.sub + (_that.sub / 100) * Number(_that.FedTaxCode.getValue());
			// } else if (oNewValue.getSource().getId().split("_")[3] == "proTaxCode") {
			// 	_that.Total = +_that.sub + (_that.sub / 100) * Number(_that.FedTaxCode.getValue());
			// }
			var sum = _that.arrPrices.reduce(function (a, b) {
				return a + b;
			}, 0);
			_that.SubTotal.setValue(sum);
			_that.TotalAmount.setValue(Number(_that.SubTotal.getValue()));
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

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tireSelector.view.tireQuotation
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tireSelector.view.tireQuotation
		 */
		onAfterRendering: function () {
			// var oAgreement = _that.getView().byId("styleCustomFontColor");
			// console.log("Agreement", oAgreement);
			// var oAgreementText = oAgreement.getProperty("text");
			// console.log("Agreement Text", oAgreementText);
			// jQuery(document).ready(function () {
			// 	var text = jQuery(".styleCustomFontColor").get()[0].innerText.split(":");
			// 	text[0].fontcolor("#FC121D");
			// });
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tireSelector.view.tireQuotation
		 */
		//	onExit: function() {
		//
		//	}

	});

});