var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'app/toyota/tireselector/ui5_tireselector/controller/BaseController'
], function (Controller, JSONModel, ResourceModel, BaseController) {
	"use strict";

	return BaseController.extend("app.toyota.tireselector.ui5_tireselector.controller.searchResults", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.searchResults
		 */
		onInit: function () {
			_that = this;
			
			var SearchOptionVIN = sap.ushell.components.SearchOptionVIN.getValue();
			var SearchOptionTireSize = sap.ushell.components.SearchOptionTireSize.getValue();
			var ModelSeriesCombo = sap.ushell.components.ModelSeriesCombo.getValue();
			var ModelSeriesCombo = sap.ushell.components.SearchOptionVehicle;
			
			_that.SearchResultModel = sap.ui.getCore().getModel("SelectJSONModel");
			_that.getView().setModel(_that.SearchResultModel, "SearchResultModel");
			_that.SearchResultModel.updateBindings();
			
			_that.serviceURL = "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_FITMENT_SRV/";
			//Z_VEHICLE_FITMENT_SRV/ZC_FitmentSet(Zzmoyr='2018',Model='DFREVT',Zzsuffix='BM')
			_that.SearchResultModel.getData().FitmentData = [];
			$.ajax({
				dataType: "json",
				url: _that.serviceURL + "ZC_FitmentSet",
				type: "GET",
				success: function (oData) {
					console.log("Ajax data", oData.d.results);
					_that.SearchResultModel.getData().FitmentData = oData.d.results;
					_that.SearchResultModel.updateBindings();
				},
				error: function (oError) {}
			});
			
			
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
			//debugger;
			var oSelectedLink = oEvtLink.getSource().getProperty("text");
			_that.getRouter().navTo("Routemaster");
		},

		NavBackToSearch: function () {
			_that.getRouter().navTo("Routemaster");
			_that.SearchResultModel.getData().SearchOptionVal = _that.oI18nModel.getResourceBundle().getText("SelectModel");
			_that.SearchResultModel.updateBindings();
			sap.ushell.components.SearchOptionVIN.setValue("");
			sap.ushell.components.SearchOptionTireSize.setValue("");
			sap.ushell.components.ModelSeriesCombo.setSelectedKey();
			sap.ushell.components.SearchOptionVehicle.setSelectedKey();
		},

		navToSelectTire: function (oEvtModel) {
			this.getRouter().navTo("searchResultsTire", {
				modelData: oEvtModel.getSource().getModel("SearchResultModel").getProperty(oEvtModel.getSource().getBindingContext(
					"SearchResultModel").sPath).Model
			});
		},

		// onPrintBtnPress: function (oEvent) {
		// 	// var oTarget = this.getView();
		// 	//idSearchresultsTable
		// 	var oTarget = this.getView(),
		// 		sTargetId = oEvent.getSource().data("targetId");

		// 	if (sTargetId) {
		// 		oTarget = oTarget.byId(sTargetId);
		// 	}

		// 	if (oTarget) {
		// 		var $domTarget = oTarget.$()[0],
		// 			sTargetContent = $domTarget.innerHTML,
		// 			sOriginalContent = document.body.innerHTML;

		// 		document.body.innerHTML = sTargetContent;
		// 		window.print();
		// 		document.body.innerHTML = sOriginalContent;
		// 	} else {
		// 		jQuery.sap.log.error("onPrint needs a valid target container [view|data:targetId=\"SID\"]");
		// 	}
		// },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.searchResults
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.searchResults
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf app.toyota.tireselector.ui5_tireselector.view.searchResults
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
			_that.SearchResultModel.refresh();
		}

	});

});