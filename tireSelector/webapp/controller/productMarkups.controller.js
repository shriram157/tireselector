sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController',
], function (Controller, JSONModel, ResourceModel, BaseController) {
	"use strict";

	return BaseController.extend("tireSelector.controller.productMarkups", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tireSelector.view.productMarkups
		 */
		onInit: function () {
			_that.oProdMarkupModel = new JSONModel();
			this.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			// _that.SearchResultModel = sap.ui.getCore().getModel("SelectJSONModel");
			// _that.getView().setModel(_that.SearchResultModel, "SearchResultModel");
			
			_that.prodMarkupList= {
				"ProductMarkupList": [{
					"Manufacturer": "MF1",
					"Preview": "5.19",
					"Live": "5.19",
					"LastUpdated": "03.10.2018",
					"LastUpdatedBy": "Dealer1"
				}, {
					"Manufacturer": "MF2",
					"Preview": "7.99",
					"Live": "5.99",
					"LastUpdated": "03.10.2018",
					"LastUpdatedBy": "Dealer2"
				}, {
					"Manufacturer": "MF1",
					"Preview": "9.99",
					"Live": "5.19",
					"LastUpdated": "03.10.2018",
					"LastUpdatedBy": "Dealer1"
				}]
			}
			
			_that.oProdMarkupModel.setData(_that.prodMarkupList);
			_that.oProdMarkupModel.updateBindings();
			
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

		// NavBackToSearch: function () {
		// 	_that.getRouter().navTo("Routemaster");
		// 	_that.oSelectJSONModel.refresh();
		// },
		
		onPressBreadCrumb: function (oEvtLink) {
			//debugger;
			// var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("Routemaster");
		},

		updateJSONModel: function (oEvtPreview) {
			sap.ui.getCore().getModel("SelectJSONModel").updateBindings();
			_that.getView().getModel("SelectJSONModel").updateBindings();
		},

		updateODataCall: function (oEvtLive) {
			sap.ui.getCore().getModel("SelectJSONModel").updateBindings();
			_that.getView().getModel("SelectJSONModel").updateBindings();
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tireSelector.view.productMarkups
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tireSelector.view.productMarkups
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tireSelector.view.productMarkups
		 */
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
			_that.oSelectJSONModel.refresh();
		}

	});

});