sap.ui.define([
	"zecp/controller/BaseController",
], function(BaseController) {
	"use strict";

	return BaseController.extend("zecp.controller.AgreementInquiryList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.AgreementInquiryList
		 */
		onInit: function() {
			this.getView().setModel(this.getOwnerComponent().getModel("EcpSalesModel"));
		},
		onSelectSearchBy: function(oEvent) {
			var oSelectedIndex = oEvent.getSource().getSelectedIndex();
			if(oSelectedIndex === 1) {
				this.getView().byId("idInqLabel").setText(this.getView().getModel("i18n").getResourceBundle().getText("VIN"));
			} else {
				this.getView().byId("idInqLabel").setText(this.getView().getModel("i18n").getResourceBundle().getText("Agreement#"));
			}
		},
		onSearchInquiryList: function() {
			var oIndex = this.getView().byId("idSearchByRadio").getSelectedIndex();
			var sQuery = this.getView().byId("idVal").getValue();
			var andFilter = [];
			this.oTable = this.getView().byId("idAgreementTable");
			var oBindItems = "";
			if(oIndex === 0) {
				if(!$.isEmptyObject(sQuery)) {

					andFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("AgreementNumber", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						and: false
					});

				} else {
					andFilter = [];
				}

				oBindItems = this.oTable.getBinding("items");
				oBindItems.filter(andFilter);

			} else if(oIndex === 1) {
				if(!$.isEmptyObject(sQuery)) {

					andFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						and: false
					});
				} else {
					andFilter = [];
				}

				oBindItems = this.oTable.getBinding("items");
				oBindItems.filter(andFilter);

			}
		},

		onPressResetSearch: function() {
			this.getOwnerComponent().getModel("EcpSalesModel").refresh();
			this.getView().byId("idVal").setValue("");
			var oBindItems = this.oTable.getBinding("items");
			oBindItems.filter([]);

		},
		onNavigate: function(oEvent) {
			var obj = oEvent.getSource().getModel().getProperty(oEvent.getSource().getSelectedContextPaths()[0]);
			console.log(obj);
			this.getOwnerComponent().getRouter().navTo("AgreementInquiry", {
				AgrNum: obj.AgreementNumber,
				vin: obj.VIN,
				customerNumber: obj.CustomerNumber,
				odometer: obj.ODMTR
			});

			this.getView().byId("idAgreementTable").removeSelections("true");

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zecp.view.AgreementInquiryList
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zecp.view.AgreementInquiryList
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zecp.view.AgreementInquiryList
		 */
		//	onExit: function() {
		//
		//	}

	});

});