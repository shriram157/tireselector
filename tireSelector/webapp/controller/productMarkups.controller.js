var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController'
], function (Controller, JSONModel, ResourceModel, BaseController) {
	"use strict";

	return BaseController.extend("tireSelector.controller.productMarkups", {
		onInit: function () {
			_that = this;
			// _that.oProdMarkupModel = new JSONModel();
			// sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			// _that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			_that.userloginCount = 0;

			_that.getRouter().attachRouteMatched(function (oEvent) {

				_that.oProdMarkupModel = new JSONModel();
				sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");

				_that.oService = "https://tireselector-xsjs.cfapps.us10.hana.ondemand.com/tireSelector/xsodata/tireSelector_SRV.xsodata";
				_that.oXSOServiceModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);

				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				// _that.getView().setModel(_that.oXSOServiceModel, "ProdMarkupModel");
				console.log("XSO model data", _that.oXSOServiceModel);

				if (_that.userloginCount == 0) {
					_that.oPriceServiceModel = _that.getOwnerComponent().getModel("PriceServiceModel");
					_that.oPriceServiceModel.read(
						"/ZC_Product_CategorySet?$filter=PRODH eq 'PARP05' and CHARAC eq 'TIRE_BRAND_NAME' and CLASS eq 'TIRE_INFORMATION' &$expand=CategToCharac&$format=json", {
							success: $.proxy(function (oECCData) {
								_that.tireBrandData = {
									"results": []
								};
								console.log("ECC manufacturer Data", oECCData);
								var data = oECCData.results[0].CategToCharac;
								$.each(data.results, function (i, item) {
									_that.tireBrandData.results.push({
										"Dealer_code": "2400034030",
										"Dealer_Brand": "10",
										"Manufacturer_code": "TireBrand", //length is only 10 char for item.CHARAC
										"Preview_Markup_Percentage": "",
										"Live_Markup_Percentage": "",
										"Live_Last_Updated": "2018-12-20T00:00:00",
										"Live_Last_Updated_By": "DonValley",
										"User_First_Name": "Aarti",
										"User_Last_Name": "Dhamat"
									});
								});
								_that.oProdMarkupModel.setData(_that.tireBrandData);
								_that.oProdMarkupModel.updateBindings(true);
								console.log("ECC Manufaturer Data", _that.oProdMarkupModel);
							}, _that),
							error: function (oError) {
								console.log("Error in fetching table", oError);
							}
						});
				}

				// var sLocation = window.location.host;
				// var sLocation_conf = sLocation.search("webide");

				// if (sLocation_conf == 0) {
				// 	_that.sPrefix = "/TireSelector_Xsodata";
				// } else {
				// 	_that.sPrefix = "";
				// }
				// this.XSJsUrl = this.sPrefix + "/xsodata";
				else {
					// _that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");
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
				}
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
			_that.getRouter().navTo("master");
		},

		updateXSALiveTable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			// var oModel = this.getOwnerComponent().getModel("XsodataModel");

			var oModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);
			var modelData = _that.oProdMarkupModel.getData().results;
			var UserData = sap.ui.getCore().getModel("DealerModel").getData().attributes[0];

			for (var i = 0; i < modelData.length; i++) { //modelData.length

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
			_that.newDataFromModel = {};

			for (var i = 0; i < 5; i++) { //modelData.length

				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				//Define group ID
				// oModel.setDeferredGroups(["submitChangeGroup"]);		

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getContext(bindingContextPath); //bindingContext.getModel().getProperty(bindingContextPath);
				//			var dataFromModel = oModel.getProperty(sContextPathInfo);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Live_Last_Updated = "2018-12-03T00:00:00";
					dataFromModel.Live_Last_Updated_By = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(" ")[1];
					dataFromModel.User_First_Name = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(" ")[1];
					dataFromModel.User_Last_Name = UserData.BusinessPartnerName.split(" ")[2] + " " + UserData.BusinessPartnerName.split(" ")[3];
					dataFromModel.IsLive = "";
					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("Post Response from ECC", oResponse);
						_that.callUpdatedProdMarkupTab();
						// Proper error handling if any thing needed. // TODO: 
					});
				} else {

					// _that.newDataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					// _that.newDataFromModel.Preview_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					// _that.newDataFromModel.Live_Last_Updated = "2018-12-03T00:00:00";
					// _that.newDataFromModel.Live_Last_Updated_By = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(
					// 	" ")[1];
					// _that.newDataFromModel.User_First_Name = UserData.BusinessPartnerName.split(" ")[0] + " " + UserData.BusinessPartnerName.split(
					// 	" ")[1];
					// _that.newDataFromModel.User_Last_Name = UserData.BusinessPartnerName.split(" ")[2] + " " + UserData.BusinessPartnerName.split(" ")[
					// 	3];
					// _that.newDataFromModel.IsLive = "";
					// //  Add all the other fields that you want to update. // TODO: 
					// oModel.update(bindingContextPath, _that.newDataFromModel, null, function (oResponse) {
					// 	console.log("Post Response from ECC", oResponse);
					// 	_that.callUpdatedProdMarkupTab();
					// 	// Proper error handling if any thing needed. // TODO: 
					// });
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
				_that.getRouter().navTo("master");
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