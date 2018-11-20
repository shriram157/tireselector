var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History",
	'app/toyota/tireselector/ui5_tireselector/controller/BaseController',
], function (Controller, JSONModel, History, BaseController) {
	"use strict";

	return BaseController.extend("app.toyota.tireselector.ui5_tireselector.controller.tireQuotation", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.tireQuotation
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
				
			}, this);

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
		},
		onPressBreadCrumb: function (oEvtLink) {
			// var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("Routemaster");
		},

		SelectDifferentTire: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("ApplicationList", {}, true);
			}
		},
		NavBackToSearch: function () {
			_that.getRouter().navTo("Routemaster");
			sap.ushell.components.SearchOptionVal.setValue("");
			sap.ushell.components.ModelSeriesCombo.setSelectedKey();
			sap.ushell.components.SearchOptionVal2.setSelectedKey();
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
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.tireQuotation
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.tireQuotation
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
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.tireQuotation
		 */
		//	onExit: function() {
		//
		//	}

	});

});