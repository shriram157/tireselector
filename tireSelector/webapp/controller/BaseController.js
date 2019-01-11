var _that;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/Device"
], function (Controller, History, Device) {
	"use strict";

	return Controller.extend("tireSelector.controller.BaseController", {
		
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		
		getModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onShareEmailPress: function () {
			$.ajax({
				dataType: "json",
				url: "/appdata/whoAmI",
				type: "GET",
				success: function (userData) {
					_that.email = userData.userInfo.email;
					_that.logonName = userData.userInfo.logonName;
				},
				error: function (oError) {}
			});
			var dealer = {
				name: _that.logonName,
				email: _that.email
			};
			sap.m.URLHelper.triggerEmail(dealer.email);
		}
	});
});