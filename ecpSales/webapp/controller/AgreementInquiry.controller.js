sap.ui.define([
	"zecp/controller/BaseController"
], function (Controller) {
	"use strict";

	return Controller.extend("zecp.controller.AgreementInquiry", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.AgreementInquiry
		 */
		onInit: function () {
			var oNodeModel = new sap.ui.model.json.JSONModel();
			oNodeModel.loadData(jQuery.sap.getModulePath("zecp.utils", "/Nodes.json"));
			this.getView().setModel(oNodeModel, "ClaimModel");
			this.getView().setModel(this.getOwnerComponent().getModel("EcpSalesModel"));

			var oVehicleMaster = this.getOwnerComponent().getModel("ZVehicleMasterModel");
			this.getView().setModel(oVehicleMaster, "VinModel");

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
			
			this.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			this.getView().setModel(this.oI18nModel, "i18n");
			 var winUrl = window.location.search;
		
			if (winUrl.indexOf("=fr")>-1) {
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
		_onRoutMatched: function (oEvent) {
			var oAgrNum = oEvent.getParameters().arguments.AgrNum;
			this.getModel("LocalDataModel").setProperty("/AgreementNum", oAgrNum);
			// var oVin = oEvent.getParameters().arguments.vin;
			// var oCustomerNumber = oEvent.getParameters().arguments.customerNumber;
			// var Oodomtr = oEvent.getParameters().arguments.odometer;
			// this.getOwnerComponent().getModel("LocalDataModel").setProperty("/VinNumber", oVin);
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AgreementNumber", oAgrNum);
			// console.log(oAgrNum, oVin, oCustomerNumber);
			this.getView().byId("idAgreementDetailHeader").setTitle(this.getView().getModel("i18n").getResourceBundle().getText(
				"ECPAgreementDetails") + " - " + oAgrNum);
			//this.getView().byId("sAgreementEnq").bindElement("/zc_ecp_agreement(VIN='" + oVin + "',AgreementNumber='" + oAgrNum + "')");
			// 			this.getView().byId("sAgreementEnq").bindElement("VinModel>/zc_c_vehicle(VIN='" + oVin + "')");
			var oGetModel = this.getModel("ZVehicleMasterModel");

			var zEcpModel = this.getOwnerComponent().getModel("EcpSalesModel");
			var oBusinessModel = this.getModel("ApiBusinessModel");

			zEcpModel.read("/zc_ecp_agreement", {
				urlParameters: {
					"$filter": "AgreementNumber eq '" + oAgrNum + "'"
				},
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/AgreementInfo", data.results[0]);
					this.getView().byId("sAgreementEnq").bindElement("/zc_ecp_agreement(VIN='" + this.getModel("LocalDataModel").getProperty(
						"/AgreementInfo/VIN") + "',AgreementNumber='" + oAgrNum + "')");
					var oDealer = data.results[0].DealershipNumber;
					if (oDealer) {
						oBusinessModel.read("/A_BusinessPartner", {
							urlParameters: {
								"$filter": "BusinessPartner eq '" + oDealer + "'"
							},
							success: $.proxy(function (businessData) {

								this.getModel("LocalDataModel").setProperty("/DealerData", businessData.results[0]);
							}, this)
						});
					}
					var AgrOwnrSectonCno= data.results[0].CustomerNumber;
					if(AgrOwnrSectonCno){
						
							oBusinessModel.read("/A_BusinessPartnerAddress", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + AgrOwnrSectonCno + "' ",
							"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress,to_MobilePhoneNumber"

						},
						success: $.proxy(function (budata) {

								 this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress", budata.results[0]);
								 if(budata.results[0].to_EmailAddress.results.lentgh>0){
									this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress/EmailAddress", budata.results[0].to_EmailAddress.results[0].EmailAddress);
								 	
								 }
								  if(budata.results[0].to_PhoneNumber.results.lentgh>0){
								this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress/PhoneNumber", budata.results[0].to_PhoneNumber.results[
									0].PhoneNumber);
								  }
								  if(budata.results[0].to_FaxNumber.results.lentgh>0){
									this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress/FaxNumber", budata.results[0].to_FaxNumber.results[0]
									.FaxNumber);
								  }
							},
							this),
						error: function () {
							console.log("Error");
						}
					});
						
						
					oBusinessModel.read("/A_BusinessPartner", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + AgrOwnrSectonCno + "' "
						},
						success: $.proxy(function (bpdata) {

							this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress/FirstName", bpdata.results[0].FirstName);
							this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress/LastName", bpdata.results[0].LastName);
							this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress/BusinessPartnerCategory", bpdata.results[0].BusinessPartnerCategory);
							if(bpdata.results[0].BusinessPartnerCategory ==="1"){
									this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress_Name", bpdata.results[0].FirstName+" "+ bpdata.results[0].LastName);
									this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress_BpType", "Individual");
							}else if(bpdata.results[0].BusinessPartnerCategory ==="2"){
									this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress_Name", bpdata.results[0].OrganizationBPName1);
									this.getModel("LocalDataModel").setProperty("/AgrOwnrSectonAddress_BpType", "Organization");
							}

						}, this),
						error: function () {
							console.log("Error");
						}
					});	
					}

					zEcpModel.read("/zc_ecp_vehicle_detailSet", {
						urlParameters: {
							"$filter": "VIN eq '" + this.getModel("LocalDataModel").getProperty("/AgreementInfo/VIN") + "'"
						},
						success: $.proxy(function (vedata) {

							this.getModel("LocalDataModel").setProperty("/PricingModelData", vedata.results[0]);
							
						if(vedata.results[0].MAKE.toUpperCase() === "LEXUS"){
							this.getModel("LocalDataModel").setProperty("/printBtnState", false);
							
						}else{
							this.getModel("LocalDataModel").setProperty("/printBtnState", true);
						}

						}, this),
						error: function () {
							console.log("Error");
						}
					});

					zEcpModel.read("/zc_ecp_application", {
						urlParameters: {
							"$filter": "VIN eq '" + this.getModel("LocalDataModel").getProperty("/AgreementInfo/VIN") + "'"
						},
						success: $.proxy(function (apdata) {

							this.getModel("LocalDataModel").setProperty("/AgreementOwnerDetail", apdata.results[0]);

						}, this),
						error: function () {
							console.log("Error");
						}
					});

					oGetModel.read("/zc_c_vehicle", {

						urlParameters: {
							"$filter": "VehicleIdentificationNumber eq '" + this.getModel("LocalDataModel").getProperty("/AgreementInfo/VIN") + "' "
						},
						success: $.proxy(function (zcvedata) {

							this.getModel("LocalDataModel").setProperty("/VehicleDetails", zcvedata.results[0]);// TODO: 
							
							
							var vehcOwnrSectonCno= zcvedata.results[0].EndCustomer;
						if(vehcOwnrSectonCno){
						
							oBusinessModel.read("/A_BusinessPartnerAddress", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + vehcOwnrSectonCno + "' ",
							"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress,to_MobilePhoneNumber"

						},
						success: $.proxy(function (budata) {

								 this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress", budata.results[0]);
								 if(budata.results[0].to_EmailAddress.results.lentgh>0){
									this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/EmailAddress", budata.results[0].to_EmailAddress.results[0].EmailAddress);
								  }
								 if(budata.results[0].to_PhoneNumber.results.lentgh>0){
									this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/PhoneNumber", budata.results[0].to_PhoneNumber.results[0].PhoneNumber);
								 }
								 if(budata.results[0].to_FaxNumber.results.lentgh>0){
									this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/FaxNumber", budata.results[0].to_FaxNumber.results[0].FaxNumber);
								}
								if(budata.results[0].to_MobilePhoneNumber.results.lentgh>0){
									this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/Mobile", budata.results[0].to_MobilePhoneNumber.results[0].MobilePhoneNumber);	
							   }
							},
							this),
						error: function () {
							console.log("Error");
						}
					});
						
						oBusinessModel.read("/A_BusinessPartner", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + vehcOwnrSectonCno + "' "
						},
						success: $.proxy(function (bpdata) {

							this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/FirstName", bpdata.results[0].FirstName);
							this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/LastName", bpdata.results[0].LastName);
							this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/BusinessPartnerCategory", bpdata.results[0].BusinessPartnerCategory);
							this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/BusinessPartnerCategory", bpdata.results[0].BusinessPartnerCategory);
							if(bpdata.results[0].BusinessPartnerCategory ==="1"){
								// this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/Name", bpdata.results[0].FirstName+" "+ bpdata.results[0].LastName);
								// this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/BpType", "Individual");
								
								this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress_Name", bpdata.results[0].FirstName+" "+ bpdata.results[0].LastName);
								this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress_BpType", "Individual");

									
							}else if(bpdata.results[0].BusinessPartnerCategory ==="2"){
									this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress_Name", bpdata.results[0].OrganizationBPName1);
									this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress_BpType", "Organization");
							}
						}, this),
						error: function () {
							console.log("Error");
						}
					});	
					
					
						
						
					}
							
							
							
							
							
						}, this)
					});

					oBusinessModel.read("/A_BusinessPartnerAddress", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + this.getModel("LocalDataModel").getProperty("/AgreementInfo/DealershipNumber") + "' ",
							"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress,to_MobilePhoneNumber"

						},
						success: $.proxy(function (budata) {

								this.getModel("LocalDataModel").setProperty("/BusinessPartnerData", budata.results[0]);
								this.getModel("LocalDataModel").setProperty("/BusinessPartnerData/EmailAddress", budata.results[0].to_EmailAddress.results[
									0].EmailAddress);
								this.getModel("LocalDataModel").setProperty("/BusinessPartnerData/PhoneNumber", budata.results[0].to_PhoneNumber.results[
									0].PhoneNumber);
								this.getModel("LocalDataModel").setProperty("/BusinessPartnerData/FaxNumber", budata.results[0].to_FaxNumber.results[0]
									.FaxNumber);
							},
							this),
						error: function () {
							console.log("Error");
						}
					});

					oBusinessModel.read("/A_BusinessPartner", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + this.getModel("LocalDataModel").getProperty("/AgreementInfo/DealershipNumber") + "' "
						},
						success: $.proxy(function (bpdata) {

							this.getModel("LocalDataModel").setProperty("/BusinessPartnerName", bpdata.results[0]);

						}, this),
						error: function () {
							console.log("Error");
						}
					});

				}, this),
				error: function () {
					console.log("Error");
				}
			});

		},
		handlePressClaim: function (oEvent) {
			console.log(oEvent);
			var oDialogBox = sap.ui.xmlfragment("zecp.view.fragments.ClaimHistory", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onClose: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		onBacktoList: function () {
			this.getOwnerComponent().getRouter().navTo("AgreementInquiryList");
		},
		onSearchBackList: function () {
			this.getOwnerComponent().getModel("EcpSalesModel").refresh();
			this.getModel("LocalDataModel").setProperty("/VINAGR", "");
			this.getOwnerComponent().getRouter().navTo("AgreementInquiryList");
			this.getModel("LocalDataModel").setProperty("/rowCount", 0);
		},
		onPrintPdf: function () {
				var oAgr = this.getView().getModel("LocalDataModel").getProperty("/AgreementNum");

				var isProxy = "";
				if (window.document.domain == "localhost") {
					isProxy = "proxy";
				}
				var w = window.open(isProxy +
					"/node/ZECP_SALES_ODATA_SERVICE_SRV/zc_ecp_agreement_printSet(AGRNUM='" + oAgr + "',LANG='E')/$value",
					'_blank');
				if (w == null) {
					console.log("Error");
					//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
				}
			}
			

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