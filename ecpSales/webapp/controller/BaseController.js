sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/Device"
], function(Controller, History, Device) {
	"use strict";

	return Controller.extend("zecp.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		handleLinkPress: function(oEvent) {

			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGetText = oEvent.getSource().getText();
			// 			var oNewAppId = this.getView().byId("idNewApp");
			// 			var oViewUpdateId = this.getView().byId("idViewUpdate");
			// 			var oAgrInqId = this.getView().byId("idAgrInq");
			var oval = 404;
			if(oGetText === this.oBundle.getText("NewApplication")) {
				this.EcpFieldData = new sap.ui.model.json.JSONModel({
					ZecpVin: "",
					ZecpVehPrice: "",
					ZecpAmtFin: "",
					ZecpLienholder: "",
					ZecpLienterms: "",
					ZecpSalesTin: "",
					PrOwndCert: "",
					BccAgrmntPrcAmt: "",
					ZecpOdometer: "",
					ZecpSaleDate: ""
				});
				this.EcpFieldData.setDefaultBindingMode("TwoWay");

				this.getView().setModel(this.EcpFieldData, "EcpFieldData");
				this.getOwnerComponent().getRouter().navTo("newECPApp", {
					vin: oval,
					plan: oval,
					appId: oval,
					appType: oval,
					Odometer: oval
				});

			} else if(oGetText === this.oBundle.getText("ViewUpdateApp")) {
				this._resetView();
				this.getOwnerComponent().getRouter().navTo("ApplicationList");
				//this.getView().getModel("EcpFieldData").setData("");
			} else if(oGetText === this.oBundle.getText("AgreementInquiry")) {
				this._resetView();
				this.getOwnerComponent().getRouter().navTo("AgreementInquiryList");
				//this.getModel("ZVehicleMasterModel").refresh();
				//this.getView().getModel("EcpFieldData").setData("");
			}
		},

		_resetView: function() {
			var oSetProperty = new sap.ui.model.json.JSONModel();
			oSetProperty.setData({
				oPrimeryState: true,
				oSecondaryState: true,
				oPrimeryState01: false,
				oSecondaryState01: false,
				oSurcharge: false,
				oTab1visible: true,
				oTab2visible: false,
				oTab3visble: false,
				oTab4visble: false,
				oTab5visble: false,
				oTab6visble: false
			});
			this.getView().setModel(oSetProperty, "oSetProperty");
			this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
			this.getView().getModel("oSetProperty").setProperty("/oTab3visible", false);
			this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
			this.getView().getModel("oSetProperty").setProperty("/oTab5visible", false);
			this.getView().getModel("oSetProperty").setProperty("/oTab6visible", false);
			//sap.ui.getCore().byId("idIconTabBarNoIcons").setSelectedKey("Tab1");
			//	this.getModel("LocalDataModel").setProperty("/");
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if(sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("ApplicationList", {}, true);
			}
		}

		//     	getListRow: function(proId, control) {
		// 	//var oStandardListItem =control.getParent();

		// 	if (proId % 2 === 0) {

		// 		this.addStyleClass("evenClass");
		// 	}
		// 	else{
		// 		this.addStyleClass("oddClass");
		// 	}
		// 	return proId;
		// }

	});
});