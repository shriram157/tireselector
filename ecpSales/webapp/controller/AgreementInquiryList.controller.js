sap.ui.define([
	"zecp/controller/BaseController",
], function (BaseController) {
	"use strict";

	return BaseController.extend("zecp.controller.AgreementInquiryList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.AgreementInquiryList
		 */
		onInit: function () {
			var oRowCount = {
				rowCount: 0
			};

			this.getView().setModel(new sap.ui.model.json.JSONModel(oRowCount), "RowCountModel");
			this.getView().setModel(this.getOwnerComponent().getModel("EcpSalesModel"));
			this.getDealer();
			this.getModel("LocalDataModel").setProperty("/rowCount", 0);
			
			
			this.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			this.getView().setModel(this.oI18nModel, "i18n");
			 var winUrl = window.location.search;
		
			var userLang = navigator.language || navigator.userLanguage;
			if ((winUrl.indexOf("=fr")>-1) || (userLang =="fr") ) {
			// if (winUrl.indexOf("=fr")>-1) {
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
		},
		onSelectSearchBy: function (oEvent) {
			var oSelectedIndex = oEvent.getSource().getSelectedIndex();
			if (oSelectedIndex === 1) {
				this.getView().byId("idInqLabel").setText(this.getView().getModel("i18n").getResourceBundle().getText("VIN"));
			} else {
				this.getView().byId("idInqLabel").setText(this.getView().getModel("i18n").getResourceBundle().getText("Agreement#"));
			}
		},
		onSearchInquiryList: function () {
			var oIndex = this.getView().byId("idSearchByRadio").getSelectedIndex();
			var sQuery = this.getView().byId("idVal").getValue();
			var andFilter = [];
			this.oTable = this.getView().byId("idAgreementTable");
			var oBindItems = "";
			if (oIndex === 0) {
				if (!$.isEmptyObject(sQuery)) {

					andFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("AgreementNumber", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						and: false
					});

				} else {
					andFilter = [];
				}

				oBindItems = this.oTable.getBinding("rows");
				oBindItems.filter(andFilter);
				this.getView().getModel("LocalDataModel").setProperty("/rowCount", 10);

			} else if (oIndex === 1) {
				if (!$.isEmptyObject(sQuery)) {

					andFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.Contains, sQuery)
						],
						and: false
					});
				} else {
					andFilter = [];
				}

				oBindItems = this.oTable.getBinding("rows");
				oBindItems.filter(andFilter);
				this.getView().getModel("LocalDataModel").setProperty("/rowCount", 10);
			}
		},

		onPressResetSearch: function () {
			this.getOwnerComponent().getModel("EcpSalesModel").refresh();
			this.getView().byId("idVal").setValue("");
			var oBindItems = this.oTable.getBinding("rows");
			oBindItems.filter([]);
			this.getView().getModel("LocalDataModel").setProperty("/rowCount", 0);

		},
		onNavigate: function (oEvent) {
			var obj = oEvent.getSource().getModel().getProperty(oEvent.getParameters().rowContext.sPath);
			console.log(obj);
			this.getOwnerComponent().getRouter().navTo("AgreementInquiry", {
				AgrNum: obj.AgreementNumber
			});

			//this.getView().byId("idAgreementTable").removeSelections("true");

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