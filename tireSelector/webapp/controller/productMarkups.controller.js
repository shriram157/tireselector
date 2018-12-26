var _that, receivedData;
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
			// _that.userloginCount = 1;

			_that.getRouter().attachRouteMatched(function (oEvent) {

				_that.oProdMarkupModel = new JSONModel();
				sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");

				_that.userData = sap.ui.getCore().getModel("DealerModel").getData();
				_that.dealerCode = _that.userData.userContext.userAttributes.DealerCode[0];
				_that.UserName = _that.userData.userContext.userInfo.logonName;

				_that.oBusinessPartnerModel = _that.getOwnerComponent().getModel("BusinessPartnerModel");
				var queryString = "/?$format=json&$filter=SearchTerm2 eq'" + _that.dealerCode + "' &$expand=to_Customer";
				_that.oBusinessPartnerModel.read("/A_BusinessPartner" + queryString, {
					success: $.proxy(function (oDealerData) {
						console.log("Business Partner Data", oDealerData.results);
						for (var i = 0; i < oDealerData.results.length; i++) {
							receivedData = {};

							var BpLength = oDealerData.results[i].BusinessPartner.length;
							receivedData.BusinessPartnerFullName = oDealerData.results[i].BusinessPartnerFullName;
							receivedData.BusinessPartnerName = oDealerData.results[i].OrganizationBPName1;
							receivedData.BusinessPartnerName2 = oDealerData.results[i].OrganizationBPName2;
							receivedData.BusinessPartnerKey = oDealerData.results[i].BusinessPartner;
							receivedData.BusinessPartner = oDealerData.results[i].BusinessPartner.substring(5, BpLength);
							receivedData.BusinessPartnerType = oDealerData.results[i].BusinessPartnerType;
							receivedData.SearchTerm2 = oDealerData.results[i].SearchTerm2;

							var attributeFromSAP;
							attributeFromSAP = oDealerData.results[i].to_Customer.Attribute1;

							switch (attributeFromSAP) {
							case "01":
								receivedData.Division = "10";
								receivedData.Attribute = "01";
								break;
							case "02":
								receivedData.Division = "20";
								receivedData.Attribute = "02";
								break;
							case "03":
								receivedData.Division = "Dual";
								receivedData.Attribute = "03";
								break;
							case "04":
								receivedData.Division = "10";
								receivedData.Attribute = "04";
								break;
							case "05":
								receivedData.Division = "Dual";
								receivedData.Attribute = "05";
								break;
							default:
								receivedData.Division = "10"; //  lets put that as a toyota dealer
								receivedData.Attribute = "01";
							}
						}
					}, _that),
					error: function (oError) {
						console.log("Error in fetching data", oError);
					}
				});
				console.log("receivedData", receivedData);
				jQuery.sap.require("sap.ui.core.format.DateFormat");
				_that.oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:MM:ss"
				});

				function callECCData() {
					_that.oProdMarkupModel.setData();
					_that.oProdMarkupModel.updateBindings(true);
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
										"Dealer_code": _that.dealerCode,
										"Dealer_Brand": receivedData.Division,
										"Manufacturer_code": item.CHARAC, //TIRE_BRAND_DESCP, //length is only 10 char for  
										"Preview_Markup_Percentage": "",
										"Live_Markup_Percentage": "",
										"Live_Last_Updated": _that.oDateFormat.format(new Date()),
										"Live_Last_Updated_By": receivedData.BusinessPartnerFullName,
										"User_First_Name": receivedData.BusinessPartnerName,
										"User_Last_Name": receivedData.BusinessPartnerName2
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

				_that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");
				_that.oXSOServiceModel.read("/DealerMarkUp", {
					success: $.proxy(function (oData) {
						console.log("XSO data", oData);
						if (oData.results.length == 0) {
							callECCData();
						} else {
							_that.oProdMarkupModel.setData(oData);
							_that.oProdMarkupModel.updateBindings(true);
						}
					}, _that),
					error: function (oError) {
						console.log("Error in fetching table", oError);
					}
				});

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

			}, _that);

		},

		onPressBreadCrumb: function (oEvtLink) {
			_that.getRouter().navTo("master");
		},

		updateXSALiveTable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			var oModel = this.getOwnerComponent().getModel("XsodataModel");
			var oModel2 = this.getOwnerComponent().getModel("XsodataModelPost");

			// var oModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);
			var modelData = _that.oProdMarkupModel.getData().results;
			// var UserData = sap.ui.getCore().getModel("DealerModel").getData().attributes[0];

			for (var i = 0; i < modelData.length; i++) { //modelData.length

				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath);
				//			var dataFromModel = oModel.getProperty(sContextPathInfo);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "Y";
					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("Post Response", oResponse);
						_that.callUpdatedProdMarkupTab();
						// Proper error handling if any thing needed. // TODO: 
					});
				} else {
					_that.newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					_that.newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					_that.newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					_that.newDataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					_that.newDataFromModel.Preview_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					_that.newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					_that.newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					_that.newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					_that.newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					_that.newDataFromModel.IsLive = "Y";
					oModel2.create("/DealerMarkUp", _that.newDataFromModel, function (oResponse) { //bindingContextPath
						console.log("Post Response from ECC", oResponse);
						_that.callUpdatedProdMarkupTab();
					});
				}
			}
			// ===================================================== Update Functionality - End ===============================
		},

		updateXSATable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			var oModel = this.getOwnerComponent().getModel("XsodataModel");
			var oModel2 = this.getOwnerComponent().getModel("XsodataModelPost");

			// var oModel2 = new sap.ui.model.odata.ODataModel(_that.oService, true);
			// oModel.setUseBatch(false);
			var modelData = _that.oProdMarkupModel.getData().results;
			// var UserData = sap.ui.getCore().getModel("DealerModel").getData().attributes[0];
			_that.newDataFromModel = {};

			for (var i = 0; i < modelData.length; i++) { //modelData.length

				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				//Define group ID
				// oModel.setDeferredGroups(["submitChangeGroup"]);		

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath); //bindingContext.getModel().getContext(bindingContextPath); //Updated by RT 20-12-2018 //bindingContext.getModel().getProperty(bindingContextPath); 
				//			var dataFromModel = oModel.getProperty(sContextPathInfo);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "";

					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("updated data", oResponse);
						_that.callUpdatedProdMarkupTab();
						// Proper error handling if any thing needed. // TODO: 
					});
				} else {
					_that.newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					_that.newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					_that.newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					_that.newDataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					_that.newDataFromModel.Preview_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					_that.newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					_that.newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					_that.newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					_that.newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					_that.newDataFromModel.IsLive = "";

					oModel2.create("/DealerMarkUp", _that.newDataFromModel, function (oResponse) { //bindingContextPath
						console.log("Post Response from ECC", oResponse);
						_that.callUpdatedProdMarkupTab();
					});
				}
			}
			// ===================================================== Update Functionality - End ===============================
		},
		callUpdatedProdMarkupTab: function () {
			_that.oXSOServiceModel = this.getOwnerComponent().getModel("xsoOdataModel");
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