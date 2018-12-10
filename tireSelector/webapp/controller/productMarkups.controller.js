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
			// _that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			_that.getRouter().attachRouteMatched(function (oEvent) {
				_that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");

				_that.getView().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
				// _that.getView().setModel(_that.oXSOServiceModel, "ProdMarkupModel");
				console.log("XSO model data", _that.oXSOServiceModel);

				_that.oXSOServiceModel.read("/DealerMarkUp", {
					success: $.proxy(function (oData) {
						console.log("XSO data", oData);
						_that.oProdMarkupModel.setData(oData);
						_that.oProdMarkupModel.updateBindings();
					}, _that),
					error: function (oError) {
						console.log("Error in fetching table", oError);
					}
				});
			}, _that);

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");

			if (sLocation_conf == 0) {
				_that.sPrefix = "/tireSelector-dest";
			} else {
				_that.sPrefix = "";

			}

			_that.nodeJsUrl = this.sPrefix + "/node";

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

		updateXSATable: function () {
			var modeldata = _that.oProdMarkupModel.getData().results;
			// _that.oXSOServiceModel.setUseBatch(true);
			var xsoOBJ = {};
			// for (var k = 0; k < modeldata.length; k++) {
			// console.log("K count", k);
			xsoOBJ.Dealer_Brand= "20";
			xsoOBJ.Dealer_code= "65023";
			xsoOBJ.Live_Last_Updated= "2018-11-30T00:00:00";
			xsoOBJ.Live_Last_Updated_By= "42120Test";
			xsoOBJ.Live_Markup_Percentage= "1.90";
			xsoOBJ.Manufacturer_code= "2400100314";
			xsoOBJ.Preview_Markup_Percentage= "2.50";
			xsoOBJ.User_First_Name= "FirstName";
			xsoOBJ.User_Last_Name= "lastName";
						
			// xsoOBJ.Dealer_code = "65023";
			// xsoOBJ.Dealer_Brand = "20";
			// xsoOBJ.Manufacturer_code = modeldata[0].Manufacturer_code;
			// xsoOBJ.Preview_Markup_Percentage = modeldata[0].Preview_Markup_Percentage;
			// xsoOBJ.Live_Markup_Percentage = modeldata[0].Live_Markup_Percentage;
			// xsoOBJ.Live_Last_Updated = "2018-12-03T00:00:00";
			// xsoOBJ.Live_Last_Updated_By = modeldata[0].Live_Last_Updated_By;
			// xsoOBJ.User_First_Name = "FirstName";
			// xsoOBJ.User_Last_Name = "lastName";

			console.log("xsoOBJ", xsoOBJ);
			_that.oXSOServiceModel.create("/DealerMarkUp", xsoOBJ, {
				success: $.proxy(function (oData) {
					console.log("XSO table updated", oData);
					// _that.callUpdatedProdMarkupTab();
				}, _that),
				error: function (oError) {
					console.log("Error in updating table", oError);
				}
			});
			// }

			// var content = _that.oProdMarkupModel.getData().results;
			// var newObj = [];
			// var mParams = {};
			// mParams.groupId = "1001";
			// _that.oXSOServiceModel.setUseBatch(true);
			// for (var i = 0; i < content.length; i++) {
			// 	var xsoOBJ = {};
			// 	xsoOBJ.Dealer_Brand = "20";
			// 	xsoOBJ.Dealer_code = "65023";
			// 	xsoOBJ.Live_Last_Updated = "2018-12-03T00:00:00";
			// 	xsoOBJ.Live_Last_Updated_By = content[i].Live_Last_Updated_By;
			// 	xsoOBJ.Live_Markup_Percentage = content[i].Live_Markup_Percentage;
			// 	xsoOBJ.Manufacturer_code = content[i].Manufacturer_code;
			// 	xsoOBJ.Preview_Markup_Percentage = content[i].Preview_Markup_Percentage;
			// 	xsoOBJ.User_First_Name = "FirstName";
			// 	xsoOBJ.User_Last_Name = "lastName";
			// 	newObj.push(xsoOBJ);

			// 	_that.oXSOServiceModel.create("/DealerMarkUp", xsoOBJ, mParams,
			// 		function (oData) {
			// 			console.log("XSO table updated", oData);
			// 		},
			// 		function (oError) {
			// 			console.log("Error in updating table", oError);
			// 		});
			// }
		},
		updateXSATable_old: function (oEvtPreview) {
			// var modeldata = _that.oProdMarkupModel.getData().results;
			// _that.oXSOServiceModel.setUseBatch(true);
			// var xsoOBJ = {};
			// for (var k = 0; k < modeldata.length; k++) {
			// 	console.log("K count", k);
			// xsoOBJ.Dealer_Brand = "20";
			// xsoOBJ.Dealer_code = "65023";
			// xsoOBJ.Live_Last_Updated = "2018-12-03T00:00:00";
			// xsoOBJ.Live_Last_Updated_By = modeldata[k].Live_Last_Updated_By;
			// xsoOBJ.Live_Markup_Percentage = modeldata[k].Live_Markup_Percentage;
			// xsoOBJ.Manufacturer_code = modeldata[k].Manufacturer_code;
			// xsoOBJ.Preview_Markup_Percentage = modeldata[k].Preview_Markup_Percentage;
			// xsoOBJ.User_First_Name = "FirstName";
			// xsoOBJ.User_Last_Name = "lastName";

			// console.log("xsoOBJ", xsoOBJ);
			// _that.oXSOServiceModel.create("/DealerMarkUp", xsoOBJ, {
			// 	success: $.proxy(function (oData) {
			// 		console.log("XSO table updated", oData);
			// 		// _that.callUpdatedProdMarkupTab();
			// 	}, _that),
			// 	error: function (oError) {
			// 		console.log("Error in updating table", oError);
			// 	}
			// });
			// _that.oXSOServiceModel.submitChanges();
			// _that.oXSOServiceModel.setUseBatch(false); 
			// create an entry of the Products collection with the specified properties and values
			// _that.oXSOServiceModel.createEntry("/DealerMarkUp", {
			// 	properties: {
			// 		Dealer_Brand: "20",
			// 		Dealer_code: "65023",
			// 		Live_Last_Updated: "2018-12-03T00:00:00",
			// 		Live_Last_Updated_By: modeldata[k].Live_Last_Updated_By,
			// 		Live_Markup_Percentage: modeldata[k].Live_Markup_Percentage,
			// 		Manufacturer_code: modeldata[k].Manufacturer_code,
			// 		Preview_Markup_Percentage: modeldata[k].Preview_Markup_Percentage,
			// 		User_First_Name: "FirstName",
			// 		User_Last_Name: "lastName"
			// 	}
			// });
			// binding against this entity
			// oForm.setBindingContext(oContext);
			// submit the changes (creates entity at the backend)
			// _that.oXSOServiceModel.submitChanges({
			// 	success: $.proxy(function (oData) {
			// 		console.log("XSO table updated", oData);
			// 		// _that.callUpdatedProdMarkupTab();
			// 	}, _that),
			// 	error: function (oError) {
			// 		console.log("Error in updating table", oError);
			// 	}
			// });

			var oParams = {};
			oParams.json = true;
			oParams.defaultUpdateMethod = "PUT";
			oParams.useBatch = true;

			var batchModel = new sap.ui.model.odata.v2.ODataModel("/node/tireSelector/xsodata/tireSelector_SRV.xsodata/", oParams);
			//var batchChanges = [];
			var mParams = {};
			mParams.groupId = "001";
			mParams.success = function () {
				sap.m.MessageToast.show("Create successful");
			};
			mParams.error = this.onErrorCall;
			var modelData = _that.oProdMarkupModel.getData().results;

			//create an array of batch changes and save
			_that.newMarkupList = [];
			for (var k = 0; k < modelData.length; k++) {
				var xsoOBJ = {};
				xsoOBJ.Dealer_Brand = "20";
				xsoOBJ.Dealer_code = "65023";
				xsoOBJ.Live_Last_Updated = "2018-12-03T00:00:00";
				xsoOBJ.Live_Last_Updated_By = modelData[k].Live_Last_Updated_By;
				xsoOBJ.Live_Markup_Percentage = modelData[k].Live_Markup_Percentage;
				xsoOBJ.Manufacturer_code = modelData[k].Manufacturer_code;
				xsoOBJ.Preview_Markup_Percentage = modelData[k].Preview_Markup_Percentage;
				xsoOBJ.User_First_Name = "FirstName";
				xsoOBJ.User_Last_Name = "lastName";
				_that.newMarkupList.push(xsoOBJ);
				// batchModel.create("/DealerMarkUp", xsoOBJ, mParams);
			}

			for (var i = 0; i<_that.newMarkupList.length; i++) {
				batchModel.create("/DealerMarkUp", _that.newMarkupList[i], mParams);
			}
			batchModel.submitChanges(mParams);

			//https://tireselector.cfapps.us10.hana.ondemand.com/tireSelector/xsodata/tireSelector_SRV.xsodata/

			// _that.oXSOServiceModel.create("/DealerMarkUp", xsoOBJ, null,
			// 	function (oData) {
			// 		console.log("XSO table updated", oData);
			// 	},
			// 	function (oError) {
			// 		console.log("Error in updating table", oError);
			// 	});

			// $.ajax({
			// 	url: _that.xsoUrl + "/tireSelector_SRV.xsodata/DealerMarkUp",
			// 	type: "POST",
			// 	data: xsoOBJ,
			// 	dataType: "json",
			// 	success: function (oDataResponse) {
			// 		console.log("XSO table updated", oDataResponse);
			// 	},
			// 	error: function (oError) {
			// 		console.log("Error in updating table", oError);
			// 	}
			// });
		},

		callUpdatedProdMarkupTab: function () {
			_that.oXSOServiceModel = this.getOwnerComponent().getModel("xsoOdataModel");
			// _that.getView().setModel(_that.oXSOServiceModel, "ProdMarkupModel");
			console.log("XSO model data", _that.oXSOServiceModel);

			_that.oXSOServiceModel.read("/DealerMarkUp", {
				success: $.proxy(function (oData) {
					console.log("XSO data", oData);
					_that.oProdMarkupModel.setData(oData);
					_that.oProdMarkupModel.updateBindings();
				}, _that),
				error: function (oError) {
					console.log("Error in fetching table", oError);
				}
			});
		},

		updateODataCall: function (oEvtLive) {
			sap.ui.getCore().getModel("SelectJSONModel").updateBindings();
			_that.getView().getModel("SelectJSONModel").updateBindings();
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