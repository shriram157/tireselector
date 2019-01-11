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
			// _that.userloginCount = 1;

			_that.getRouter().attachRouteMatched(function (oEvent) {

				_that._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableProdMarkup: false
				});

				_that.getView().setModel(_that._oViewModel, "propertiesModel");

				_that.oProdMarkupModel = new JSONModel();
				sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");

				_that.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
				_that.userData = sap.ui.getCore().getModel("DealerModel").getData();

				var scopes = _that.userData.userContext.scopes;

				if (scopes[1] == "tireSelectorS!t1188.ViewTireQuotes" && scopes[2] == "tireSelectorS!t1188.ManagerProductMarkups") {
					_that._oViewModel.setProperty("/enableProdMarkup", true);
				} else {
					_that._oViewModel.setProperty("/enableProdMarkup", false);
				}

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
								// DealerData.DealerCode = _that.dealerCode;
								// DealerData.DealerName = _that.dealerName;
								var data = oECCData.results[0].CategToCharac;
								$.each(data.results, function (i, item) {
									_that.tireBrandData.results.push({
										"Dealer_code": _that.userData.DealerData.DealerCode,
										"Dealer_Brand": _that.userData.DealerData.Division,
										"Manufacturer_code": item.VALUE, //TIRE_BRAND_DESCP, //length is only 10 char for  
										"Preview_Markup_Percentage": "",
										"Live_Markup_Percentage": "",
										"Live_Last_Updated": _that.oDateFormat.format(new Date()),
										"Live_Last_Updated_By": _that.userData.DealerData.DealerName,
										"User_First_Name": _that.userData.DealerData.BusinessPartnerName,
										"User_Last_Name": _that.userData.DealerData.BusinessPartnerName2
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
			var postSuccessFlag = false;
			var updateSuccessFlag = false;
			for (var i = 0; i < modelData.length; i++) { //modelData.length

				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath);
				//			var dataFromModel = oModel.getProperty(sContextPathInfo);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "Y";
					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("Post Response", oResponse);
						// updateSuccessFlag = true;
						// _that.callUpdatedProdMarkupTab();
						// Proper error handling if any thing needed. // TODO: 
					});updateSuccessFlag = true;
				} else {
					_that.newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					_that.newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					_that.newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					_that.newDataFromModel.Live_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					_that.newDataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					_that.newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					_that.newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					_that.newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					_that.newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					_that.newDataFromModel.IsLive = "Y";
					oModel2.create("/DealerMarkUp", _that.newDataFromModel, function (oResponse) { //bindingContextPath
						console.log("Post Response from ECC", oResponse);
						// postSuccessFlag = true;

					});postSuccessFlag = true;
				}
			}

			if (postSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Live Markup post is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_that.callUpdatedProdMarkupTab();
						}
					}
				);
			} else if (updateSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Live Markup update is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_that.callUpdatedProdMarkupTab();
						}
					}
				);
			}
			_that.callUpdatedProdMarkupTab();
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

			var postSuccessFlag = false;
			var updateSuccessFlag = false;
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
					dataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "";

					//  Add all the other fields that you want to update. // TODO: 
					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("updated data", oResponse);
						// updateSuccessFlag =true;
						// Proper error handling if any thing needed. // TODO: 
					});updateSuccessFlag =true;
				} else {
					_that.newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					_that.newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					_that.newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					_that.newDataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					_that.newDataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					_that.newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					_that.newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					_that.newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					_that.newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					_that.newDataFromModel.IsLive = "";

					oModel2.create("/DealerMarkUp", _that.newDataFromModel, function (oResponse) { //bindingContextPath
						console.log("Post Response from ECC", oResponse);
						// postSuccessFlag = true;
					});postSuccessFlag = true;
				}
			}
			if (postSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Preview Markup post is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_that.callUpdatedProdMarkupTab();
						}
					}
				);
			} else if (updateSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Preview Markup update is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_that.callUpdatedProdMarkupTab();
						}
					}
				);
			}
			_that.callUpdatedProdMarkupTab();
			// ===================================================== Update Functionality - End ===============================
		},
		callUpdatedProdMarkupTab: function () {
			_that.oXSOServiceModel = this.getOwnerComponent().getModel("XsodataModel");
			console.log("XSO model data", _that.oXSOServiceModel);
			var flagNoData = false;
			_that.oXSOServiceModel.read("/DealerMarkUp", {
				success: $.proxy(function (oData) {
					if(oData.results.length>0){
					console.log("XSO data", oData);
					_that.oProdMarkupModel.setData(oData);
					_that.oProdMarkupModel.updateBindings(true);
					}
					else {
						flagNoData =true;
					}
				}, _that),
				error: function (oError) {
					flagNoData =true;
				}
			});
			if (flagNoData == true) {
				sap.m.MessageBox.error(
					"No data found in Product Markup Table"
				);
			}
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