sap.ui.define([
	"zecp/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("zecp.controller.AgreementInquiry", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.AgreementInquiry
		 */
		onInit: function() {
			var oNodeModel = new sap.ui.model.json.JSONModel();
			oNodeModel.loadData(jQuery.sap.getModulePath("zecp.utils", "/Nodes.json"));
			this.getView().setModel(oNodeModel, "ClaimModel");
			this.getView().setModel(this.getOwnerComponent().getModel("EcpSalesModel"));

			var oVehicleMaster = this.getOwnerComponent().getModel("ZVehicleMasterModel");
			this.getView().setModel(oVehicleMaster, "VinModel");

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
		},
		_onRoutMatched: function(oEvent) {
			var oAgrNum = oEvent.getParameters().arguments.AgrNum;
			var oVin = oEvent.getParameters().arguments.vin;
			var oCustomerNumber = oEvent.getParameters().arguments.customerNumber;
			// var Oodomtr = oEvent.getParameters().arguments.odometer;
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/VinNumber", oVin);
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AgreementNumber", oAgrNum);
			console.log(oAgrNum, oVin, oCustomerNumber);
			this.getView().byId("idAgreementDetailHeader").setTitle(this.getView().getModel("i18n").getResourceBundle().getText(
				"ECPAgreementDetails") + " - " + oAgrNum);
			this.getView().byId("sAgreementEnq").bindElement("/zc_ecp_agreement(VIN='" + oVin + "',AgreementNumber='" + oAgrNum + "')");
			// 			this.getView().byId("sAgreementEnq").bindElement("VinModel>/zc_c_vehicle(VIN='" + oVin + "')");
			var oGetModel = this.getModel("ZVehicleMasterModel");
			this._oToken = oGetModel.getHeaders()['x-csrf-token'];
							$.ajaxSetup({
								headers: {
									'X-CSRF-Token': this._oToken
								}
							});
			oGetModel.read("/zc_c_vehicle", {

				urlParameters: {
					"$filter": "VehicleIdentificationNumber eq '" + oVin + "' "
				},
				success: $.proxy(function(data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/VehicleDetails", data.results[0]);
				}, this)
			});

			var oBusinessModel = this.getModel("ApiBusinessModel");
			this._oToken = oBusinessModel.getHeaders()['x-csrf-token'];
							$.ajaxSetup({
								headers: {
									'X-CSRF-Token': this._oToken
								}
							});
			oBusinessModel.read("/A_BusinessPartnerAddress", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + oCustomerNumber + "' ",
					"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress,to_MobilePhoneNumber"

				},
				success: $.proxy(function(data) {
						console.log(data);
						this.getModel("LocalDataModel").setProperty("/BusinessPartnerData", data.results[0]);
						this.getModel("LocalDataModel").setProperty("/BusinessPartnerData/EmailAddress", data.results[0].to_EmailAddress.results[0].EmailAddress);
						this.getModel("LocalDataModel").setProperty("/BusinessPartnerData/PhoneNumber", data.results[0].to_PhoneNumber.results[0].PhoneNumber);
						this.getModel("LocalDataModel").setProperty("/BusinessPartnerData/FaxNumber", data.results[0].to_FaxNumber.results[0].FaxNumber);
					},
					this),
				error: function() {
					console.log("Error");
				}
			});

			oBusinessModel.read("/A_BusinessPartner", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + oCustomerNumber + "' "
				},
				success: $.proxy(function(data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/BusinessPartnerName", data.results[0]);
				
				}, this),
				error: function() {
					console.log("Error");
				}
			});
			var zEcpModel = this.getOwnerComponent().getModel("EcpSalesModel");
				this._oToken = zEcpModel.getHeaders()['x-csrf-token'];
							$.ajaxSetup({
								headers: {
									'X-CSRF-Token': this._oToken
								}
							});
			zEcpModel.read("/zc_ecp_vehicle_detailSet", {
				urlParameters: {
					"$filter": "VIN eq '" + oVin + "'"
				},
				success: $.proxy(function(data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/PricingModelData", data.results[0]);

				}, this),
				error: function() {
					console.log("Error");
				}
			});

			zEcpModel.read("/zc_ecp_application", {
				urlParameters: {
					"$filter": "VIN eq '" + oVin + "'"
				},
				success: $.proxy(function(data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/AgreementOwnerDetail", data.results[0]);

				}, this),
				error: function() {
					console.log("Error");
				}
			});

			zEcpModel.read("/zc_ecp_agreement", {
				urlParameters: {
					"$filter": "AgreementNumber eq '" + oAgrNum + "'"
				},
				success: $.proxy(function(data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/AgreementInfo", data.results[0]);
				}, this),
				error: function() {
					console.log("Error");
				}
			});
			
			
			// 			zEcpModel.read("/zc_ecp_planpricing_dataSet", {
			// 				urlParameters: {
			// 					"$filter": "ODMTR eq '" + Oodomtr + "'"
			// 				},
			// 				success: $.proxy(function(data) {
			// 					console.log(data.results[0]);
			// 					this.getModel("LocalDataModel").setProperty("/oPlanPricingData", data.results[0]);

			// 				}, this),
			// 				error: function(err) {
			// 					console.log(err);
			// 				}
			// 			});

			// var oZdrClaimModel = this.getOwnerComponent().getModel("ZdrClaimModel");
			// 	this._oToken = zEcpModel.getHeaders()['x-csrf-token'];
			// 				$.ajaxSetup({
			// 					headers: {
			// 						'X-CSRF-Token': this._oToken
			// 					}
			// 				});
			// oZdrClaimModel.read("/ZC_CLAIM_HEAD", {
			// 	urlParameters: {
			// 		"$filter": "AgreementNumber eq '" + oAgrNum + "'",
			// 		"$expand": "to_claimitem/to_claimprice"
			// 	},
			// 	success: $.proxy(function(data) {
			// 		this.getModel("LocalDataModel").setProperty("/ClaimModelData", data.results);
			// 	}, this),
			// 	error: function() {
			// 		console.log("Error");
			// 	}
			// });

		},
		handlePressClaim: function(oEvent) {
			console.log(oEvent);
			var oDialogBox = sap.ui.xmlfragment("zecp.view.fragments.ClaimHistory", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onClose: function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		onBacktoList: function() {
			this.getOwnerComponent().getRouter().navTo("AgreementInquiryList");
		},
		onSearchBackList: function() {
				this.getOwnerComponent().getRouter().navTo("AgreementInquiryList");
				this.getModel().refresh();
			}
			// 		onPrintPdf: function() {
			// 			var zEcpModel = this.getOwnerComponent().getModel("EcpSalesModel");
			// 			zEcpModel.read("/zc_ecp_agreement", {
			// 				success: $.proxy(function(odata) {
			// 					console.log(odata);
			// 					var data = odata.results;
			// 					console.log(data);
			// 					var columns = [

		// 						{
		// 							title: "VIN",
		// 							key: "VIN"
		// 						},

		// 						{
		// 							title: "AgreementNumber",
		// 							key: "AgreementNumber"
		// 						},

		// 						{
		// 							title: "PlanType",
		// 							key: "PlanType"
		// 						},

		// 						{
		// 							title: "DealershipNumber",
		// 							key: "DealershipNumber"
		// 						},

		// 						{
		// 							title: "Applicationsubmissi",
		// 							key: "Applicationsubmissi"
		// 						}, {
		// 							title: "bcc_agr_st_cd",
		// 							key: "bcc_agr_st_cd"
		// 						}, {
		// 							title: "AgreementStatus",
		// 							key: "AgreementStatus"
		// 						}, {
		// 							title: "Autocode",
		// 							key: "Autocode"
		// 						}, {
		// 							title: "Agreementprice",
		// 							key: "Agreementprice"
		// 						}, {
		// 							title: "Surcharge",
		// 							key: "Surcharge"
		// 						}, {
		// 							title: "SurchargeFlag",
		// 							key: "SurchargeFlag"
		// 						}, {
		// 							title: "SurchargeAmount",
		// 							key: "SurchargeAmount"
		// 						}, {
		// 							title: "CustomerNumber",
		// 							key: "CustomerNumber"
		// 						}, {
		// 							title: "AgreementSaleDate",
		// 							key: "AgreementSaleDate"
		// 						}, {
		// 							title: "AgreementEffectiveDate",
		// 							key: "AgreementEffectiveDate"
		// 						}, {
		// 							title: "AgreementthruDate",
		// 							key: "AgreementthruDate"
		// 						}, {
		// 							title: "LienHolder",
		// 							key: "LienHolder"
		// 						}, {
		// 							title: "LienAmount",
		// 							key: "LienAmount"
		// 						}, {
		// 							title: "ODMTR",
		// 							key: "ODMTR"
		// 						}, {
		// 							title: "PROWNDCERT",
		// 							key: "PROWNDCERT"
		// 						}, {
		// 							title: "AmountFinanced",
		// 							key: "AmountFinanced"
		// 						}, {
		// 							title: "RetailPrice",
		// 							key: "RetailPrice"
		// 						}, {
		// 							title: "BenefitsFlag",
		// 							key: "BenefitsFlag"
		// 						}, {
		// 							title: "SalesTIN",
		// 							key: "SalesTIN"
		// 						}, {
		// 							title: "AgreementthruKMreading",
		// 							key: "AgreementthruKMreading"
		// 						}, {
		// 							title: "Deductible",
		// 							key: "Deductible"
		// 						}, {
		// 							title: "AgreementSeriesDescription",
		// 							key: "AgreementSeriesDescription"
		// 						}, {
		// 							title: "Lubricantbenefitplan",
		// 							key: "Lubricantbenefitplan"
		// 						}, {
		// 							title: "Updatetimestamp",
		// 							key: "Updatetimestamp"
		// 						}, {
		// 							title: "DealerNetAmount",
		// 							key: "DealerNetAmount"
		// 						}, {
		// 							title: "StatusKMReading",
		// 							key: "StatusKMReading"
		// 						}, {
		// 							title: "StatusDate",
		// 							key: "StatusDate"
		// 						}

		// 					];

		// 					var doc = new jsPDF('p', 'pt', 'a2');

		// 					doc.autoTable(columns, data, {});

		// 					doc.save('table.pdf');
		// 				}, this),

		// 				error: $.proxy(function() {
		// 					console.log("Some error");
		// 				}, this)
		// 			});
		// 		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zecp.view.AgreementInquiry
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zecp.view.AgreementInquiry
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zecp.view.AgreementInquiry
		 */
		//	onExit: function() {
		//
		//	}

	});

});