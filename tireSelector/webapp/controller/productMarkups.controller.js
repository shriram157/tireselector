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
			var items = []; // intializing an array
			var oTableData = _that.oProdMarkupModel.getData().results; // getting table data
			var batchChanges = [];
			for (var i = 0; i < oTableData.length; i++) {
				items.push({
					"Dealer_Brand": "20",
					"Dealer_code": "65023",
					"Live_Last_Updated": "2018-12-03T00:00:00",
					"Live_Last_Updated_By": oTableData[i].Live_Last_Updated_By,
					"Live_Markup_Percentage": oTableData[i].Live_Markup_Percentage,
					"Manufacturer_code": oTableData[i].Manufacturer_code,
					"Preview_Markup_Percentage": oTableData[i].Preview_Markup_Percentage,
					"User_First_Name": "FirstName",
					"User_Last_Name": "lastName"
				});
				_that.oXSOServiceModel.setUseBatch(true);
				batchChanges.push(_that.oXSOServiceModel.createBatchOperation("/DealerMarkUp", "POST", items[i]));
			}
			_that.oXSOServiceModel.addBatchChangeOperations(batchChanges);
			//submit changes and refresh the table and display message
			_that.oXSOServiceModel.submitBatch(function (data) {
				_that.oXSOServiceModel.refresh();
				sap.ui.commons.MessageBox.show(data.__batchResponses[0].__changeResponses.length + " contacts created", sap.ui.commons.MessageBox
					.Icon.SUCCESS,
					"Batch Save", sap.ui.commons.MessageBox.Action.OK);
			}, function (err) {
				console.log("Error occurred ");
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