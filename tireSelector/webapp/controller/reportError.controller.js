var _scopeLocal; 
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("tireSelector.controller.reportError", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tireSelector.view.reportError
		 */
		onInit: function () {
			_scopeLocal.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/_scopeLocal.oI18nModelproperties"
			});
			_scopeLocal.getView().setModel(_scopeLocal.oI18nModel, "i18n");

			if (window.location.search == "?language=fr") {
				_scopeLocal.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				_scopeLocal.getView().setModel(_scopeLocal.oI18nModel, "i18n");
				_scopeLocal.sCurrentLocale = 'FR';
			} else {
				_scopeLocal.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				_scopeLocal.getView().setModel(_scopeLocal.oI18nModel, "i18n");
				_scopeLocal.sCurrentLocale = 'EN';
			}
		},
		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _scopeLocal.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_scopeLocal.getRouter().navTo("master");
			} else if (_oSelectedScreen == _scopeLocal.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_scopeLocal.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _scopeLocal.oI18nModel.getResourceBundle().getText("ReportError")) {
				_scopeLocal.getRouter().navTo("reportError");
			}
		},
		NavBackToSearch: function () {
			// _scopeLocal.oSelectJSONModel.refresh();
			_scopeLocal.getRouter().navTo("master");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tireSelector.view.reportError
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tireSelector.view.reportError
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tireSelector.view.reportError
		 */
		onExit: function () {
			_scopeLocal.destroy();
		}

	});

});