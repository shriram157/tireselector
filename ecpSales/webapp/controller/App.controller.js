sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("zecp.controller.App", {
		onInit: function () {
			var winUrl = window.location.search;
			this.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			this.getView().setModel(this.oI18nModel, "i18n");

			if (winUrl.indexOf("=fr") > -1) {
				this.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				this.getView().setModel(this.oI18nModel, "i18n");
				this.sCurrentLocale = 'FR';
			} else {
				this.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				this.getView().setModel(this.oI18nModel, "i18n");
				this.sCurrentLocale = 'EN';
			}
			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			var oLexusLogo = this.getView().byId("idLexusLogo");
			var oToyotaLogo = this.getView().byId("idToyotaLogo");
			if (isDivisionSent) {
				this.sDivision = window.location.search.match(/Division=([^&]*)/i)[1];

				if (this.sDivision == "10") // set the Toyoto logo
				{
					oToyotaLogo.setProperty("visible", true);
					oLexusLogo.setProperty("visible", false);
				} else if (this.sDivision == "20") // set the Lexus logo
				{
					oToyotaLogo.setProperty("visible", false);
					oLexusLogo.setProperty("visible", true);
				} else { // set the lexus logo
					oToyotaLogo.setProperty("visible", true);
					oLexusLogo.setProperty("visible", true);
				}

			} else {
				oToyotaLogo.setProperty("visible", true);
				oLexusLogo.setProperty("visible", true);
			}

		}
	});
});