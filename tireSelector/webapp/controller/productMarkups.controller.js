var _localScope;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController',
	"sap/ui/core/routing/History",
	'sap/ui/model/Filter',
], function (Controller, JSONModel, ResourceModel, BaseController, History, Filter) {
	"use strict";

	return BaseController.extend("tireSelector.controller.productMarkups", {
		onInit: function () {
			_localScope = this;
			// _localScope.userloginCount = 1;

			_localScope.getRouter().attachRouteMatched(function (oEvent) {
				_localScope._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableProdMarkup: false
				});

				_localScope.getView().setModel(_localScope._oViewModel, "propertiesModel");

				_localScope.oProdMarkupModel = new JSONModel();
				sap.ui.getCore().setModel(_localScope.oProdMarkupModel, "ProdMarkupModel");
				_localScope.getView().setModel(_localScope.oProdMarkupModel, "ProdMarkupModel");

				_localScope.getView().setModel(sap.ui.getCore().getModel("DealerModel"), "DealerModel");
				_localScope.userData = sap.ui.getCore().getModel("DealerModel").getData();

				var scopes = _localScope.userData.userContext.scopes;

				if (scopes[1] == "tireSelectorS!t1188.ViewTireQuotes" && scopes[2] == "tireSelectorS!t1188.ManagerProductMarkups") {
					_localScope._oViewModel.setProperty("/enableProdMarkup", true);
				} else {
					_localScope._oViewModel.setProperty("/enableProdMarkup", false);
				}

				jQuery.sap.require("sap.ui.core.format.DateFormat");
				_localScope.oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:MM:ss"
				});

				function callECCData() {
					// "/ZC_Product_CategorySet?$filter=PRODH eq 'PARP05' and CHARAC eq 'TIRE_BRAND_NAME' and CLASS eq 'TIRE_INFORMATION' &$expand=CategToCharac&$format=json", {
					_localScope.oProdMarkupModel.setData();
					_localScope.oProdMarkupModel.updateBindings(true);
					_localScope.oPriceServiceModel = _localScope.getOwnerComponent().getModel("PriceServiceModel");
					_localScope.oPriceServiceModel.read("/ZC_TireBrandSet?$format=json", {
						success: $.proxy(function (data) {
							_localScope.tireBrandData = {
								"results": []
							};
							// var data = oECCData.results[0].CategToCharac;
							$.each(data.results, function (i, item) {
								_localScope.tireBrandData.results.push({
									"Dealer_code": _localScope.userData.DealerData.DealerCode,
									"Dealer_Brand": _localScope.userData.DealerData.Division,
									"Manufacturer_code": item.VALUE, //TIRE_BRAND_DESCP, //length is only 10 char for  
									"Preview_Markup_Percentage": "0.00",
									"Live_Markup_Percentage": "MSRP",
									"Live_Last_Updated": _localScope.oDateFormat.format(new Date()),
									"Live_Last_Updated_update":"",
									"Live_Last_Updated_By": _localScope.userData.DealerData.DealerName,
									"User_First_Name": _localScope.userData.DealerData.BusinessPartnerName,
									"User_Last_Name": _localScope.userData.DealerData.BusinessPartnerName2
								});
							});
							_localScope.oProdMarkupModel.setData(_localScope.tireBrandData);
							_localScope.oProdMarkupModel.updateBindings(true);
							console.log("ECC Manufaturer Data", _localScope.oProdMarkupModel);
						}, _localScope),
						error: function (oError) {
							console.log("Error in fetching table", oError);
						}
					});
				}

				_localScope.oXSOServiceModel = _localScope.getOwnerComponent().getModel("XsodataModel");
				_localScope.oXSOServiceModel.read("/DealerMarkUp", {
					success: $.proxy(function (oData) {
						console.log("XSO data", oData);
						if (oData.results.length == 0) {
							callECCData();
						} else {
							_localScope.oProdMarkupModel.setData(oData);
							_localScope.oProdMarkupModel.updateBindings(true);
						}
					}, _localScope),
					error: function (oError) {
						console.log("Error in fetching table", oError);
					}
				});

				_localScope.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties"
				});
				_localScope.getView().setModel(_localScope.oI18nModel, "i18n");

				if (window.location.search == "?language=fr") {
					_localScope.oI18nModel = new sap.ui.model.resource.ResourceModel({
						bundleUrl: "i18n/i18n.properties",
						bundleLocale: ("fr")
					});
					_localScope.getView().setModel(_localScope.oI18nModel, "i18n");
					_localScope.sCurrentLocale = 'FR';
				} else {
					_localScope.oI18nModel = new sap.ui.model.resource.ResourceModel({
						bundleUrl: "i18n/i18n.properties",
						bundleLocale: ("en")
					});
					_localScope.getView().setModel(_localScope.oI18nModel, "i18n");
					_localScope.sCurrentLocale = 'EN';
				}

			}, _localScope);

		},

		onPressBreadCrumb: function (oEvtLink) {
			_localScope.getRouter().navTo("master");
		},

		// onBrandSearch: function (oQuery) {
		// 	_localScope.ProdMarkupsTable = _localScope.getView().byId("ID_ProdMarkupsTable");
		// 	_localScope.oBinding = _localScope.ProdMarkupsTable.getBinding("items");
		// 	var aFilters = [];
		// 	var sQuery = oQuery.getSource().getValue();
		// 	if (sQuery && sQuery.length > 0) {
		// 		aFilters = new Filter([
		// 			new Filter("Manufacturer_code", sap.ui.model.FilterOperator.Contains, sQuery)
		// 		], false);
		// 		_localScope.oBinding.filter(aFilters);
		// 	} else {
		// 		_localScope.oBinding.filter([]);
		// 	}
		// },

		// updatePostdate:function(oUpdatedDate) {
		// 	// var ModelData = _localScope.oProdMarkupModel.getData().results;
		// 	oUpdatedDate.getSource().getBindingContext("ProdMarkupModel").getProperty(oUpdatedDate.getSource().getBindingContext("ProdMarkupModel").getPath()).Live_Last_Updated = new Date();
		// 	_localScope.oProdMarkupModel.updateBindings(true);
		// }, 

		updatePostdateLive: function (oUpdatedDate) {
			_localScope.oProdMarkupModel.getProperty(oUpdatedDate.getSource().getBindingContext("ProdMarkupModel").getPath()).Live_Last_Updated_update =
				new Date();
				console.log("updated date",_localScope.oProdMarkupModel.getProperty(oUpdatedDate.getSource().getBindingContext("ProdMarkupModel").getPath()).Live_Last_Updated_update);
			_localScope.oProdMarkupModel.updateBindings(true);
			_localScope.oProdMarkupModel.refresh(true);
		},

		updateXSALiveTable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			var oModel = this.getOwnerComponent().getModel("XsodataModel");
			// var Model2 = this.getOwnerComponent().getModel("XsodataModelPost");
			var modelData = _localScope.oProdMarkupModel.getData().results;
			var postSuccessFlag = false;
			var updateSuccessFlag = false;
			for (var i = 0; i < modelData.length; i++) { //modelData.length
				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";
				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";

				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath);

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					if (modelData[i].Live_Last_Updated_update !== "" && modelData[i].Live_Last_Updated_update != undefined) {
						dataFromModel.Live_Last_Updated = new Date(modelData[i].Live_Last_Updated_update);
					} 
					else {
						dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					}
					// dataFromModel.Live_Last_Updated = new Date(modelData[i].Live_Last_Updated);
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "Y";

					oModel.update(bindingContextPath, dataFromModel, null, function (oResponse) {
						console.log("Post Response", oResponse);
						updateSuccessFlag = true;
					});
					// updateSuccessFlag = true;
				} else {
					var newDataFromModel = {};
					newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					newDataFromModel.Live_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					newDataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					if (modelData[i].Live_Last_Updated_update !== "") {
						newDataFromModel.Live_Last_Updated = new Date(modelData[i].Live_Last_Updated_update);
					} 
					else {
						newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					}
					// newDataFromModel.Live_Last_Updated = new Date(modelData[i].Live_Last_Updated);
					newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					newDataFromModel.IsLive = "Y";
					oModel.create("/DealerMarkUp", newDataFromModel, null, {
						success: function (oData, oResponse) {
							postSuccessFlag = true;
						},
						error: function (oError) {
							postSuccessFlag = false;
						}
					});
					// postSuccessFlag = true;
				}
			}

			if (postSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Live Markup post is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			} else if (updateSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Live Markup update is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			}
			_localScope.callUpdatedProdMarkupTab();
			// ===================================================== Update Functionality - End ===============================
		},

		updateXSATable: function () {
			// ========================================Insert Functionality using xsodata=================================Begin
			// ================================================== Update Functionality - Begin =================================
			var oModel = this.getOwnerComponent().getModel("XsodataModel");
			// var Model2 =this.getOwnerComponent().getModel("XsodataModelPost");
			var modelData = _localScope.oProdMarkupModel.getData().results;

			var postSuccessFlag = false;
			var updateSuccessFlag = false;
			for (var i = 0; i < modelData.length; i++) { //modelData.length
				var sPrikamryKeyofObject = "Dealer_code='" + modelData[i].Dealer_code + "',Dealer_Brand='" + modelData[i].Dealer_Brand +
					"',Manufacturer_code='" + modelData[i].Manufacturer_code + "'";

				var sContextPathInfo = "/DealerMarkUp(" + sPrikamryKeyofObject + ")";
				var bindingContext = oModel.getContext(sContextPathInfo);
				var bindingContextPath = bindingContext.getPath();
				var dataFromModel = bindingContext.getModel().getProperty(bindingContextPath); //bindingContext.getModel().getContext(bindingContextPath); //Updated by RT 20-12-2018 //bindingContext.getModel().getProperty(bindingContextPath); 

				if (dataFromModel) {
					dataFromModel.Live_Markup_Percentage = modelData[i].Live_Markup_Percentage;
					dataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					dataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					dataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					dataFromModel.User_First_Name = modelData[i].User_First_Name;
					dataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					dataFromModel.IsLive = "";

					oModel.update(bindingContextPath, dataFromModel, null, {
						success: function (oData, oResponse) {
							updateSuccessFlag = true;
						},
						error: function (oError) {
							updateSuccessFlag = false;
						}
					});
					// updateSuccessFlag = true;
				} else {
					var newDataFromModel = {};
					newDataFromModel.Dealer_code = modelData[i].Dealer_code;
					newDataFromModel.Dealer_Brand = modelData[i].Dealer_Brand;
					newDataFromModel.Manufacturer_code = modelData[i].Manufacturer_code;
					newDataFromModel.Live_Markup_Percentage = "MSRP";
					newDataFromModel.Preview_Markup_Percentage = modelData[i].Preview_Markup_Percentage;
					newDataFromModel.Live_Last_Updated = modelData[i].Live_Last_Updated;
					newDataFromModel.Live_Last_Updated_By = modelData[i].Live_Last_Updated_By;
					newDataFromModel.User_First_Name = modelData[i].User_First_Name;
					newDataFromModel.User_Last_Name = modelData[i].User_Last_Name;
					newDataFromModel.IsLive = "";
					oModel.create("/DealerMarkUp", newDataFromModel, null, {
						success: function (oData, oResponse) {
							postSuccessFlag = true;
						},
						error: function (oError) {
							postSuccessFlag = false;
						}
					});
					// postSuccessFlag = true;
				}
			}
			if (postSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Preview Markup post is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			} else if (updateSuccessFlag == true) {
				sap.m.MessageBox.success(
					"Preview Markup update is successful", {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (oAction) {
							_localScope.callUpdatedProdMarkupTab();
						}
					}
				);
			}
			_localScope.callUpdatedProdMarkupTab();
			// ===================================================== Update Functionality - End ===============================
		},
		callUpdatedProdMarkupTab: function () {
			_localScope.oXSOServiceModel = this.getOwnerComponent().getModel("XsodataModel");
			console.log("XSO model data", _localScope.oXSOServiceModel);
			var flagNoData = false;
			_localScope.oXSOServiceModel.read("/DealerMarkUp", {
				success: $.proxy(function (oData) {
					if (oData.results.length > 0) {
						console.log("XSO data", oData);
						_localScope.oProdMarkupModel.setData(oData);
						_localScope.oProdMarkupModel.updateBindings(true);
					} else {
						flagNoData = true;
					}
				}, _localScope),
				error: function (oError) {
					flagNoData = true;
				}
			});
			if (flagNoData == true) {
				// sap.m.MessageBox.error(
				// 	"No data found in Product Markup Table"
				// );
			}
		},

		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _localScope.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_localScope.getRouter().navTo("master");
			} else if (_oSelectedScreen == _localScope.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_localScope.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _localScope.oI18nModel.getResourceBundle().getText("ReportError")) {
				_localScope.getRouter().navTo("reportError");
			}
		},

		BackToHistory: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				sap.ui.core.UIComponent.getRouterFor(_localScope).navTo("master");
			}
		},

		onExit: function () {
			_localScope.destroy();
			_localScope.oSelectJSONModel.refresh();
		}

	});
});