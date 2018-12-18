var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController'
], function (Controller, JSONModel, ResourceModel, BaseController) {
	"use strict";

	return BaseController.extend("tireSelector.controller.productMarkups", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tireSelector.view.productMarkups
		 */
		onInit: function () {
			_that = this;
			_that.oProdMarkupModel = new JSONModel();
			sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");

			_that.getRouter().attachRouteMatched(function (oEvent) {
				var sLocation = window.location.host;
				var sLocation_conf = sLocation.search("webide");

				// if (sLocation_conf == 0) {
				// 	_that.sPrefix = "/TireSelector_Xsodata";
				// } else {
				// 	_that.sPrefix = "";
				// }
				// this.XSJsUrl = this.sPrefix + "/xsodata";
				// changed by ray 
				//_that.oService = "https://tireselector-xsjs.cfapps.us10.hana.ondemand.com/tireSelector/xsodata/tireSelector_SRV.xsodata";
				_that.oService = "/tireSelector/xsodata/tireSelector_SRV.xsodata";
				_that.oXSOServiceModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);

				// _that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");

				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				// _that.getView().setModel(_that.oXSOServiceModel, "ProdMarkupModel");
				console.log("XSO model data", _that.oXSOServiceModel);

				_that.oXSOServiceModel.read("/DealerMarkUp", {
					success: $.proxy(function (oData) {
						console.log("XSO data", oData);
						_that.oProdMarkupModel.setData(oData);
						_that.oProdMarkupModel.updateBindings(true);
					}, _that),
					error: function (oError) {
						console.log("Error in fetching table", oError);
					}
				});
			}, _that);

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

		updateXSALiveTable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			// var oModel = this.getOwnerComponent().getModel("XsodataModel");

			var oModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);
			var modelData = _that.oProdMarkupModel.getData().results;
			var UserData = sap.ui.getCore().getModel("DealerModel").getData().attributes[0];

			for (var i = 0; i < modelData.length; i++) {

				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				//Define group ID
				// oModel.setDeferredGroups(["submitChangeGroup"]);		

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath);
				//			var dataFromModel = oModel.getProperty(sContextPathInfo);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Live_Last_Updated = "2018-12-03T00:00:00";
					dataFromModel.Live_Last_Updated_By = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(" ")[1];
					dataFromModel.User_First_Name = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(" ")[1];
					dataFromModel.User_Last_Name = UserData.BusinessPartnerName.split(" ")[2] + " " + UserData.BusinessPartnerName.split(" ")[3];
					dataFromModel.IsLive = "Y";
					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("Post Response from ECC", oResponse);
						_that.callUpdatedProdMarkupTab();
						// Proper error handling if any thing needed. // TODO: 
					});
				} else {
					// insert logic goes here. 
				}
			}
			// ===================================================== Update Functionality - End ===============================
		},

		updateXSATable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			// var oModel = this.getOwnerComponent().getModel("XsodataModel");

			var oModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);
			var modelData = _that.oProdMarkupModel.getData().results;
			var UserData = sap.ui.getCore().getModel("DealerModel").getData().attributes[0];

			for (var i = 0; i < modelData.length; i++) {

				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				//Define group ID
				// oModel.setDeferredGroups(["submitChangeGroup"]);		

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath);
				//			var dataFromModel = oModel.getProperty(sContextPathInfo);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Live_Last_Updated = "2018-12-03T00:00:00";
					dataFromModel.Live_Last_Updated_By = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(" ")[1];
					dataFromModel.User_First_Name = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(" ")[1];
					dataFromModel.User_Last_Name = UserData.BusinessPartnerName.split(" ")[2] + " " + UserData.BusinessPartnerName.split(" ")[3];
					dataFromModel.IsLive = "Y";
					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("Post Response from ECC", oResponse);
						_that.callUpdatedProdMarkupTab();
						// Proper error handling if any thing needed. // TODO: 
					});
				} else {
					// insert logic goes here. 
				}
			}
			// ===================================================== Update Functionality - End ===============================
		},
		callUpdatedProdMarkupTab: function () {
			// _that.oXSOServiceModel = this.getOwnerComponent().getModel("xsoOdataModel");
			// _that.getView().setModel(_that.oXSOServiceModel, "ProdMarkupModel");

			_that.oXSOServiceModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);
			console.log("XSO model data", _that.oXSOServiceModel);

			_that.oXSOServiceModel.read("/DealerMarkUp", {
				success: $.proxy(function (oData) {
					console.log("XSO data", oData);
					_that.oProdMarkupModel.setData(oData);
					_that.oProdMarkupModel.updateBindings(true);
				}, _that),
				error: function (oError) {
					console.log("Error in fetching table", oError);
				}
			});
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

		onExit: function () {
			_that.destroy();
			_that.oSelectJSONModel.refresh();
		}

	});

});