var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController'
], function (Controller, JSONModel, ResourceModel, BaseController) {
	"use strict";

	return BaseController.extend("tireSelector.controller.searchResults", {
		// https://fioridev1.dev.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_MASTER_SRV/
		// https://fioridev1.dev.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/
		// https://fioridev1.dev.toyota.ca:44300/sap/opu/odata/sap/Z_TIRESELECTOR_SRV/
		onInit: function () {
			_that = this;

			_that.getRouter().attachRouteMatched(function (oEvent) {
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
				
				var breadCrumbVal = this.getView().byId("ID_curCrumbText");
				var SearchOptionVIN = sap.ushell.components.SearchOptionVIN.getValue();
				var SearchOptionTireSize = sap.ushell.components.SearchOptionTireSize.getValue();
				var ModelSeriesCombo = sap.ushell.components.ModelSeriesCombo.getValue();
				var SearchOptionVehicle = sap.ushell.components.SearchOptionVehicle.getValue();
				
				if(sap.ushell.components.SearchOptionVIN.getValue()!== "" && sap.ushell.components.SearchOptionVIN.getValue() !== undefined ) {
					breadCrumbVal.setCurrentLocationText(_that.oI18nModel.getResourceBundle().getText("SelectModel"));
				}
				else {
					breadCrumbVal.setCurrentLocationText(_that.oI18nModel.getResourceBundle().getText("SelectModel") +"> [" + SearchOptionVehicle + "] [" + ModelSeriesCombo + "]");
				}
				_that.SelectJSONModel = sap.ui.getCore().getModel("SelectJSONModel");
				_that.getView().setModel(_that.SelectJSONModel, "SelectJSONModel");

				_that.SearchResultModel = new sap.ui.model.json.JSONModel();
				_that.getView().setModel(_that.SearchResultModel, "SearchResultModel");

				var sLocation = window.location.host;
				var sLocation_conf = sLocation.search("webide");

				if (sLocation_conf == 0) {
					this.sPrefix = "/tireSelector-dest";
				} else {
					this.sPrefix = "";
				}
				this.nodeJsUrl = this.sPrefix + "/node";
				_that.getView().setModel(_that.SearchResultModel, "SearchResultModel");

				if (SearchOptionVIN !== "" || SearchOptionVIN !== undefined) {
					var serviceURL = this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet";
					// var serviceURL = "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_TIRESELECTOR_SRV/ZC_FitmentSet";
				} else {
					var serviceURL = this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet(Zzmoyr='" + SearchOptionVehicle + "',Model='" +
						ModelSeriesCombo + "',Zzsuffix='')";
					// var serviceURL = "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_TIRESELECTOR_SRV/ZC_FitmentSet(Zzmoyr='" +
					// ModelSeriesCombo + "',Model='',Zzsuffix='')";
				}
				// _that.serviceURL = this.nodeJsUrl + "/Z_VEHICLE_FITMENT_SRV/";
				//Z_VEHICLE_FITMENT_SRV/ZC_FitmentSet(Zzmoyr='2018',Model='DFREVT',Zzsuffix='BM')
				// _that.SearchResultModel.getData().FitmentData = [];
				$.ajax({
					dataType: "json",
					url: serviceURL,
					type: "GET",
					success: function (oData) {
						console.log("Search Result data", oData.d.results);
						_that.SearchResultModel.setData(oData.d);
						_that.SearchResultModel.updateBindings();
					},
					error: function (oError) {}
				});

			}, _that);
		},

		onPressBreadCrumb: function (oEvtLink) {
			//debugger;
			var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("Routemaster");
		},

		NavBackToSearch: function () {
			sap.ushell.components.SearchOptionVIN.setValue("");
			sap.ushell.components.SearchOptionTireSize.setValue("");
			sap.ushell.components.ModelSeriesCombo.setSelectedKey();
			sap.ushell.components.SearchOptionVehicle.setSelectedKey();
			_that.getRouter().navTo("Routemaster");
		},

		navToSelectTire: function (oEvtModel) {
			this.getRouter().navTo("searchResultsTire", {
				modelData: oEvtModel.getSource().getModel("SearchResultModel").getProperty(oEvtModel.getSource().getBindingContext(
					"SearchResultModel").sPath).Model
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
			_that.SearchResultModel.refresh();
		}

	});

});