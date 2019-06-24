sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	'sap/ui/model/Filter',
	"zecp/controller/BaseController",
	'sap/m/MessageBox'
], function (Button, Dialog, Label, MessageToast, Text, Filter, Controller, MessageBox) {
	"use strict";

	return Controller.extend("zecp.controller.newECPApp", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.newECPApp
		 */
		onInit: function () {
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(2018, 1, 1),
				secondDateValueDRS2: new Date(),
				dateCurrent: new Date()
			});
			this.getView().setModel(oDateModel, "DateModel");
			this.getView().setModel(this.getOwnerComponent().getModel("EcpSalesModel"));
			var oVehicleMaster = this.getOwnerComponent().getModel("ZVehicleMasterModel");
			this.getView().setModel(oVehicleMaster, "VinModel");

			this._getPropetyData();

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._oRouteNewECP, this);
			// var oEventBus = sap.ui.getCore().getEventBus();
			// oEventBus.publish("newECPApp", "Binded", this.onSelectiDealer, this);

			this.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			this.getView().setModel(this.oI18nModel, "i18n");
			var winUrl = window.location.search;

			var userLang = navigator.language || navigator.userLanguage;
			if ((winUrl.indexOf("=fr") > -1) || (userLang == "fr")) {
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

		_fnDateFormat02: function (elm) {

			var oNumTime = elm.getTime();

			var saleTime = "\/Date(" + oNumTime + ")\/";

			return saleTime;
		},

		_fnDateFormat: function (elm) {

			var oNumTime = elm.getTime();

			var saleTime = "\/Date(" + oNumTime + ")\/";
			//var oTotalTime = saleTime.replace(/\s+/g, '');
			return saleTime;
		},
		onAppTabChange: function (oEvent) {
			if (oEvent.oCustomEvtObj) {
				var selectedKeyTab = Event.key;
			}
		},
		_oRouteNewECP: function (oEvent) {

			this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
			this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
			this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
			this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
			this.getModel("LocalDataModel").setProperty("/printBtnState", true);
			this.getModel("LocalDataModel").setProperty("/odometerState", "None");

			this.oAppId = oEvent.getParameters().arguments.appId;
			this.getModel("LocalDataModel").setProperty("/currentIssueDealer", oEvent.getParameters().arguments.ODealer);
			this.getDealer();
			//this.getModel("LocalDataModel").setProperty("/enabledNext01", true);
			if (this.oAppId != 404 && this.oAppId != undefined) {
				this.getView().getModel("oSetProperty").setProperty("/oTab1visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab3visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
				this.getView().getModel("oSetProperty").setProperty("/oTab5visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab6visible", false);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");
				this.getView().getModel("oSetProperty").setProperty("/oPrimeryState01", true);
				this.getView().getModel("oSetProperty").setProperty("/oSecondaryState01", true);
				this.getView().getModel("oSetProperty").setProperty("/oPrimeryState", false);
				this.getView().getModel("oSetProperty").setProperty("/oSecondaryState", true);
				this.getView().getModel("oSetProperty").setProperty("/backToList", false);
				this.getView().getModel("oSetProperty").setProperty("/backPrimery", false);
				this.getView().getModel("oSetProperty").setProperty("/backSecondary", true);
				this.getView().getModel("oSetProperty").setProperty("/saleDat01Visible", false);
				this.getView().getModel("oSetProperty").setProperty("/saleDat02Visible", true);

				var oZECPModel = this.getModel("EcpSalesModel");
				this._oToken = oZECPModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				var oVehicleMaster = this.getView().getModel("VinModel");
				var oBusinessModel = this.getModel("ApiBusinessModel");
				oZECPModel.read("/zc_ecp_application", {
					urlParameters: {
						"$filter": "InternalApplicationID eq '" + this.oAppId + "' "
					},
					success: $.proxy(function (data) {

						this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData", data.results[0]);
						this.getView().getModel("oSetProperty").setProperty("/oPlan", this.getModel("LocalDataModel").getProperty(
							"/ApplicationOwnerData/ECPPlanCode"));
						this.getView().getModel("oSetProperty").setProperty("/oOdometer", this.getModel("LocalDataModel").getProperty(
							"/ApplicationOwnerData/Odometer"));
						this.getView().getModel("oSetProperty").setProperty("/oAppType", this.getModel("LocalDataModel").getProperty(
							"/ApplicationOwnerData/AgreementType"));

						// ApplicationOwnerData_Name

						if (data.results[0].BusinessIndividual.toUpperCase() === "BUSINESS") {

							this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData/ApplicationOwnerData_Name", data.results[0].CompanyName);
							this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData/ApplicationOwnerData_BpType", this.getView().getModel(
									"i18n").getResourceBundle()
								.getText("Organization"));

						} else {
							this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData/ApplicationOwnerData_Name", data.results[0].CustomerName +
								" " + data.results[0].CustomerLastName);
							this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData/ApplicationOwnerData_BpType", this.getView().getModel(
									"i18n").getResourceBundle()
								.getText("Individual")); // added translation
						}

						oVehicleMaster.read("/zc_c_vehicle", {
							urlParameters: {
								"$filter": "VehicleIdentificationNumber eq '" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/VIN") +
									"' "
							},
							success: $.proxy(function (vData) {
								this.getModel("LocalDataModel").setProperty("/VehicleDetails", vData.results[0]);
								oBusinessModel.read("/A_BusinessPartnerAddress", {
									urlParameters: {
										"$filter": "BusinessPartner eq '" + this.getModel("LocalDataModel").getProperty("/VehicleDetails/EndCustomer") +
											"' ",
										"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress"
									},
									success: $.proxy(function (businessA) {
										this.getModel("LocalDataModel").setProperty("/OwnerData", businessA.results[0]);
										if (businessA.results != "") {
											if (businessA.results[0].to_EmailAddress.results.length > 0) {
												this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", businessA.results[0].to_EmailAddress.results[
													0].EmailAddress);
											} else {
												this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", "");
											}

											if (businessA.results[0].to_PhoneNumber.results.length > 0) {
												this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", businessA.results[0].to_PhoneNumber.results[
													0].PhoneNumber);
											} else {
												this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", "");

											}
											if (businessA.results[0].to_FaxNumber.results.length > 0) {
												this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", businessA.results[0].to_FaxNumber.results[
													0].FaxNumber);
											} else {
												this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", "");

											}
										}
									}, this),
									error: function () {
										console.log("Error");
									}
								});

								oBusinessModel.read("/A_BusinessPartner", {
									urlParameters: {
										"$filter": "BusinessPartner eq '" + this.getModel("LocalDataModel").getProperty("/VehicleDetails/EndCustomer") +
											"' "
									},
									success: $.proxy(function (businessB) {

										this.getModel("LocalDataModel").setProperty("/AgreementOwnerName", businessB.results[0]);

										this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/FirstName", businessB.results[0].FirstName);
										this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/LastName", businessB.results[0].LastName);
										this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/BusinessPartnerCategory", businessB.results[
											0].BusinessPartnerCategory);
										this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/BusinessPartnerCategory", businessB.results[
											0].BusinessPartnerCategory);
										if (businessB.results[0].BusinessPartnerCategory === "1") {
											// this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/Name", bpdata.results[0].FirstName+" "+ bpdata.results[0].LastName);
											// this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/BpType", "Individual");

											this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_Name", businessB.results[0].FirstName +
												" " + businessB.results[
													0].LastName);
											this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_BpType", this.getView().getModel("i18n").getResourceBundle()
												.getText("Individual")); // added translation

										} else if (businessB.results[0].BusinessPartnerCategory === "2") {
											this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_Name", businessB.results[0].OrganizationBPName1);
											this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_BpType", "Organization");
										}

									}, this),
									error: function () {
										console.log("Error");
									}
								});
							}, this)
						});

						oZECPModel.read("/zc_ecp_crud_operationsSet", {
							urlParameters: {
								"$filter": "ZecpVin eq '" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/VIN") +
									"'and ZecpIntApp eq '" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/InternalApplicationID") +
									"'"
							},
							success: $.proxy(function (crdata) {
								var EcpFieldData = new sap.ui.model.json.JSONModel(crdata.results[0]);
								EcpFieldData.setDefaultBindingMode("TwoWay");
								this.getView().setModel(EcpFieldData, "EcpFieldData");
								this.getValidPlanSet(EcpFieldData);
								this.updateTHazBenFlag();
								var oSelectedPlan = this.getView().getModel("EcpFieldData").getProperty("/ZecpPlancode");
								var isUsedPrimPlan = this.check4PrimUsedVehiclePlan(oSelectedPlan);
								if (isUsedPrimPlan) {
									this.getView().getModel("oSetProperty").setProperty("/notUsedPrimPlan", false);
									this.oECPData.ZecpPlanpurchprice = "0.01";
								} else {
									this.getView().getModel("oSetProperty").setProperty("/notUsedPrimPlan", true);
								}

							}, this),
							error: function (err) {
								console.log(err);
							}
						});

						oZECPModel.read("/zc_ecp_planpricing_dataSet", {
							urlParameters: {
								"$filter": "MGANR eq '" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/ECPPlanCode") +
									"'and ODMTR eq'" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/Odometer") + "'and VIN eq '" +
									this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/VIN") +
									"'and ZECPAGRTYPE eq'" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/AgreementType") + "'"
							},
							success: $.proxy(function (pdata) {
								this.getModel("LocalDataModel").setProperty("/oPlanPricingData", pdata.results[0]);
							}, this),
							error: function (err) {
								console.log(err);
							}
						});
						var winUrl = window.location.search;
						var userLang = navigator.language || navigator.userLanguage;
						var vHsetLanKey = 'EN';
						if ((winUrl.indexOf("=fr") > -1) || (userLang == "fr")) {
							vHsetLanKey = 'FR';
						}
						oZECPModel.read("/zc_ecp_vehicle_detailSet", {
							urlParameters: {
								"$filter": "VIN eq '" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/VIN") + "' and  SPRAS eq '" +
									vHsetLanKey + "'"
							},
							success: $.proxy(function (vedata) {
								this.getModel("LocalDataModel").setProperty("/PricingModelData", vedata.results[0]);
								//Check and Update Tire Hazard and Benifit Falg for DMS App: Defet ID = 9616
								this.updateTHazBenFlag();

							}, this),
							error: function () {
								console.log("Error");
							}
						});

						if (this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/Source") == "DMS") {

							this.getView().getModel("oSetProperty").setProperty("/oAgrOwnerDMS", true);
							this.getView().getModel("oSetProperty").setProperty("/backBtnP", false);
						} else {
							this.getView().getModel("oSetProperty").setProperty("/oAgrOwnerDMS", false);
							this.getView().getModel("oSetProperty").setProperty("/backBtnP", true);
						}

					}, this),
					error: function (err) {
						console.log(err);
					}
				});

			} else {

				this.EcpFieldData = new sap.ui.model.json.JSONModel({
					DBOperation: "",
					BPTYPE: "",
					ZecpIntApp: "",
					ZecpMake: "",
					ZecpAppNum: "",
					ZecpVin: "",
					ZecpAgrNum: "",
					ZecpDealcode: "",
					ZecpAppStat: "",
					ZecpSaleDate: "",
					ZecpOdometer: "",
					ZecpAgrType: "",
					ZecpEffDate: "",
					ZecpExpDate: "",
					ZecpDealName: "",
					ZecpSurchrgFl: "",
					ZecpPreowned: "",
					ZecpCustNum: "",
					ZecpCustName: "",
					ZecpMidName: "",
					ZecpLastName: "",
					ZecpBusPhone: "",
					ZecpEmail: "",
					ZecpSubDate: "",
					ZecpAutocode: "",
					ZecpVehPrice: "",
					ZecpAmtFin: "",
					ZecpLienholder: "",
					ZecpLienterms: "",
					ZecpPlancode: "",
					ZecpRetPrice: "",
					ZecpDefSurchrg: "",
					ZecpVehSurchrgAmt: "",
					ZecpListpurprice: "",
					ZecpVehsurchrg: "",
					ZecpRoadhazard: "",
					ZecpBenefitsFlg: "",
					BccAgrmntSaleDt: "",
					ZecpSource: "",
					ZecpDatecreated: "",
					ZecpLastupdate: "",
					ZecpSaletype: "",
					ZecpFueltype: "",
					ZecpCylnum: "",
					ZecpAdddata1: "",
					ZecpAdddata2: "",
					ZecpAdddata3: "",
					ZecpAdddata4: "",
					ZecpAdddata5: "",
					ZecpCompName: "",
					ZecpAddress: "",
					ZecpCity: "",
					ZecpProvince: "",
					ZecpPostalcode: "",
					ZecpHomePhone: "",
					ZecpBusExt: "",
					ZecpBusOrInd: "",
					ZecpModelcode: "",
					BccEcpAgrmntNum: "",
					BccVin: "",
					BccPlanCd: "",
					BccAplDlrshpNum: "",
					BccAgrStCd: "",
					AgrStDt: "",
					BccAgrEvTypCd: "",
					BccVoasPartNum: "",
					BccAgrmntDlrNum: "",
					BccEcpAutoCd: "",
					BccAgrmntExtcntr: "",
					BccAgrmntPrcAmt: "",
					Dedctble: "",
					VehSurchLst: "",
					BccDtSrchrgFlg: "",
					BccDefSrchrgAmt: "",
					BccAgrmntYrCd: "",
					BccAgrmntSerNo: "",
					BccVehSrchrgFlg: "",
					BccVehSrchrgAmt: " ",
					BccDlrCommsnAmt: " ",
					BccCdbCustNum: "",
					BccAgrmntThruKm: " ",
					BccLubBnftFlg: "",
					BccVehStsKm: " ",
					BccAgrmntDlrPfl: "",
					BccPlnLienHldr: "",
					BccPlnLienTrmth: " ",
					BccPlnLienAmt: " ",
					BccDlrNetDebamt: " ",
					BccNetDebAmt: " ",
					BccNetGwDebAmt: " ",
					BccNetGwCreAmt: " ",
					BccNetGwOffCre: " ",
					BccNetRecvryDeb: " ",
					BccCncTsfFee: " ",
					BccCustRfndAmt: " ",
					BccAdjstdAdmAmt: " ",
					BccAdjstdFdAmt: " ",
					BccAdjstdRapAmt: " ",
					BccAdjstdSurAmt: " ",
					BccAgrActSrDes: "",
					BccAdjstrCmnts: "",
					BccUsrCalAmtflg: "",
					BccRdHzrd: "",
					RdHzrdExpDt: "",
					Odmtr: "",
					TrnfrOdometer: "",
					TrnfrDate: "",
					TrnfrFee: "",
					PrOwndCert: "",
					PrVendorFlag: "",
					BccInscTrnmtFl: "",
					BccRdsdTrnmtFl: "",
					BccMktngTrnmtFl: "",
					BccDlrDebGst: " ",
					BccDlrDebPst: " ",
					BccCustRfndGst: " ",
					BccCustRfndPst: " ",
					BccFinclAjstrId: "",
					BccDebitRequest: "",
					BccCreditRequest: "",
					BccCrtrUserid: "",
					BccCrtnTmstmp: "",
					BccLstUpdPltf: "",
					BccLstUpdPgmid: "",
					BccLstUpdUserid: "",
					BccLstUpdTmstmp: "",
					ZamtFincd: " ",
					ZretailPrice: " ",
					ZbenefitFlag: "",
					ZecpRoadhazard1: "", //Added new entity for translation
					ZbenefitFlag1: "", //Added new entity for translation
					ZecpPlanpurchprice: ""

				});

				this.getView().getModel("oSetProperty").setProperty("/oTab1visible", true);
				this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab3visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab5visible", false);
				this.getView().getModel("oSetProperty").setProperty("/oTab6visible", false);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab1");
				this.getView().getModel("oSetProperty").setProperty("/oPrimeryState01", false);
				this.getView().getModel("oSetProperty").setProperty("/oSecondaryState01", false);
				this.getView().getModel("oSetProperty").setProperty("/oPrimeryState", true);
				this.getView().getModel("oSetProperty").setProperty("/oSecondaryState", true);
				this.getView().getModel("oSetProperty").setProperty("/backToList", true);
				this.getView().getModel("oSetProperty").setProperty("/backPrimery", true);
				this.getView().getModel("oSetProperty").setProperty("/backSecondary", false);
				this.EcpFieldData.setDefaultBindingMode("TwoWay");
				this.getView().getModel("oSetProperty").setProperty("/notUsedPrimPlan", true);
			}

			this.getView().setModel(this.EcpFieldData, "EcpFieldData");

		},
		updateTHazBenFlag: function () {
			// var sourceType = this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData").Source;
			var pricingModelData = this.getModel("LocalDataModel").getProperty("/PricingModelData");
			var oECPData = this.getView().getModel("EcpFieldData").getData();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (pricingModelData && oECPData) {

				var oSDateTime = new Date(oECPData.ZecpSaleDate).getTime();
				var oRegDate = new Date(pricingModelData.REG_DATE).getTime();
				var DifferTime = (oSDateTime - oRegDate);
				var oOdoVal = oECPData.ZecpOdometer;

				if (DifferTime <= 94670778000 && oOdoVal <= 50000) {
					this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "Yes");
					this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard1", oBundle.getText("Yes"));
				} else if (DifferTime > 94670778000 || oOdoVal > 50000) {
					this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "No");
					this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard1", oBundle.getText("No"));
				}

				var oDay = this.getModel("LocalDataModel").getProperty("/PricingModelData/B_DAYS");
				var oDayMili = parseInt(oDay) * 1000 * 60 * 60 * 24;
				if (oECPData.ZecpAgrType === oBundle.getText("NEWVEHICLEAGREEMENT")) {
					if (DifferTime < oDayMili) {
						this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "Yes");
						this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", oBundle.getText("Yes"));
					} else if (DifferTime > oDayMili) {
						this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "No");
						this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", oBundle.getText("No"));
					}
				} else {
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "No");
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", oBundle.getText("No"));
				}

			}
		},

		handleValueHelp: function (oController) {

			this.inputId = oController.getParameters().id;

			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zecp.view.fragments.VinListDialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// open value help dialog
			this._valueHelpDialog.open();
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new Filter(
					"VIN",
					sap.ui.model.FilterOperator.EQ, sValue
				);

				evt.getSource().getBinding("items").filter([oFilter]);
			} else {
				evt.getSource().getBinding("items").filter([]);
			}
		},

		_handleValueHelpClose: function (evt) {
			this.oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = this.oSelectedItem.getTitle();
			if (this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		verifyVinDealer: function (vinID) {
			var oZECPModel = this.getModel("EcpSalesModel");

			oZECPModel.read("/zc_ecp_vehicle_detailSet", {
				urlParameters: {
					"$filter": "VIN eq '" + vinID + "'"
				},
				success: $.proxy(function (vedata) {
					if ((window.location.href.search("Division=10") > 0)) {
						if (vedata.results[0].MAKE.toUpperCase() === "TOYOTA") {
							//	valid toyota dealer and VIN
							this._deferVINDealer.resolve();
						} else {
							this._deferVINDealer.reject();
							//	return false;
							//not valid VIN for TOYATA dealer
						}
					}
					if ((window.location.href.search("Division=20") > 0)) {
						if (vedata.results[0].MAKE.toUpperCase() === "LEXUS") {
							//	valid LEXUS dealer and VIN
							this._deferVINDealer.resolve();;
						} else {
							this._deferVINDealer.reject();
							//not valid VIN for LEXUS dealer
						}
					}
					this._deferVINDealer.resolve();

				}, this),
				error: function () {
					console.log("Error");
				}
			});

		},
		OnNextStep2: function () {

			this.oECPData = this.getView().getModel("EcpFieldData").getData();
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oVin = this.getView().byId("idVinNum");
			var oVal = oVin.getValue();
			oVin.setValueState(sap.ui.core.ValueState.None);
			var oZECPModel = this.getModel("EcpSalesModel");

			oZECPModel.read("/zc_ecp_valid_vinsSet", {
				urlParameters: {
					"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'"
				},
				success: $.proxy(function (vinData) {
					var oVinLength = vinData.results.length;
					if (oVinLength > 0) {
						//this.getModel("LocalDataModel").setProperty("/enabledNext01", true);
						oZECPModel.read("/zc_ecp_valid_plansSet", {
							urlParameters: {
								"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'"
							},
							success: $.proxy(function (data) {
								this.oFlag = data.results[0].ZZEXT_FLG;
								if (this.oFlag === "YES") {
									this.getView().getModel("oSetProperty").setProperty("/oFlag", true);

								} else {
									this.getView().getModel("oSetProperty").setProperty("/oFlag", false);
								}
							}, this),
							error: function () {
								//console.log("Error");
							}
						});

						var winUrl = window.location.search;
						var userLang = navigator.language || navigator.userLanguage;
						var vHset_lanKey = 'EN';
						if ((winUrl.indexOf("=fr") > -1) || (userLang == "fr")) {
							vHset_lanKey = 'FR';
						}

						oZECPModel.read("/zc_ecp_vehicle_detailSet", {
							urlParameters: {
								"$filter": "VIN eq '" + this.oECPData.ZecpVin + "' and  SPRAS eq '" + vHset_lanKey + "'"
							},
							success: $.proxy(function (data) {

								this.getModel("LocalDataModel").setProperty("/PricingModelData", data.results[0]);

								if (data.results[0].REG_DATE != "" || data.results[0].REG_DATE != undefined) {
									this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
									this.BccAgrmntPrtDt = data.results[0].REG_DATE;

								} else {
									this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
									this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("InvalidRegistrationDate"));
									this.getView().byId("idNewECPMsgStrip").setType("Error");
								}
								if (data.results[0].MAKE != "" || data.results[0].MAKE != undefined) {
									this.oECPData.ZecpMake = data.results[0].MAKE;
								}
								if (data.results[0].VEHICLEMODEL != "" || data.results[0].VEHICLEMODEL != undefined) {
									this.oECPData.ZecpModelcode = data.results[0].VEHICLEMODEL;
								}

								if (data.results[0].ZAUTO_CODE != "" || data.results[0].ZAUTO_CODE != undefined) {
									this.oECPData.ZecpAutocode = data.results[0].ZAUTO_CODE;
								}

							}, this),
							error: $.proxy(function () {

								var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
								MessageBox.error(
									this.oBundle.getText("InvalidRegistrationDate"), {

										styleClass: bCompact ? "sapUiSizeCompact" : "",
										onClose: function (sAction) {
											MessageToast.show(sAction);
										}
									}
								);

								console.log("Error");
							}, this)
						});

						oZECPModel.read("/zc_ecp_application", {
							urlParameters: {
								"$filter": "VIN eq '" + this.oECPData.ZecpVin + "' "
							},
							success: $.proxy(function (data) {

								this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData", data.results[0]);

								this.oECPData = this.getView().getModel("EcpFieldData").getData();

							}, this),
							error: function (err) {
								console.log(err);
							}
						});
						//	var oPlansArray = ["NLC46", "NTC34", "NTC94", "NTC45", "NTC46", "NTC47"];

						oZECPModel.read("/zc_ecp_agreement", {
							urlParameters: {
								"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'and AgreementElectricVehicletype ne 'AGEN' "
							},
							success: $.proxy(function (data) {

								var oDataRes = data.results;

								var oResults = oDataRes.filter(function (v, i) {
									return ((v["PlanType"] == "NTC34" || v["PlanType"] == "NLC46") || v["PlanType"] == "NTC94" || v["PlanType"] ==
										"NTC45" ||
										v["PlanType"] == "NTC46" || v["PlanType"] == "NTC47");
								});

								this.getModel("LocalDataModel").setProperty("/AgreementDataActive", oResults);

							}, this),
							error: function (err) {
								console.log(err);
							}
						});

						var oGetModel = this.getModel("ZVehicleMasterModel");
						this._oToken = oGetModel.getHeaders()['x-csrf-token'];
						$.ajaxSetup({
							headers: {
								'X-CSRF-Token': this._oToken
							}
						});

						oGetModel.read("/zc_c_vehicle", {

							urlParameters: {
								"$filter": "VehicleIdentificationNumber eq '" + this.oECPData.ZecpVin + "' "
							},
							success: $.proxy(function (data) {

								this.CustomerNumberLength = data.results.length;

								oZECPModel.read("/zc_ecp_application", {
									urlParameters: {
										"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'and ApplicationStatus eq 'PENDING'and DealerCode eq '" + this.getModel(
											"LocalDataModel").getProperty(
											"/currentIssueDealer") + "' "
									},
									success: $.proxy(function (odata) {
										this.oAppdata = odata.results.length;
										if (data.results.length <= 0) {

											this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
											this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("CustomerNumberNotFound"));
											this.getView().byId("idNewECPMsgStrip").setType("Error");
											this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
											this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab1");
										}

										if (this.oAppdata > 0) {
											this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
											this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("VinAlreadySaved"));
											this.getView().byId("idNewECPMsgStrip").setType("Error");
											this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
											this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab1");
										} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpModelcode") == "Imported US Vehicle") {
											this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
											this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("ForeginVINError"));
											this.getView().byId("idNewECPMsgStrip").setType("Error");
											this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
											this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab1");
										} else {
											this.getModel("LocalDataModel").setProperty("/VehicleDetails", data.results[0]);
											this.oCustomer = data.results[0].EndCustomer;
											this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);

											this._deferVINDealer = jQuery.Deferred();
											this.verifyVinDealer(oVal);
											this._deferVINDealer.done($.proxy(function (oData) {
												this.getView().getModel("oSetProperty").setProperty("/oTab2visible", true);
												this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab2");
												//this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
												this.getView().byId("idNewECPMsgStrip").setType("None");
												oVin.setValueState(sap.ui.core.ValueState.None);
											}, this)).fail($.proxy(function (oData) {
												this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
												this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("MisMatchDealertypeAndVehicle"));

												this.getView().byId("idNewECPMsgStrip").setType("Error");
											}, this));
										}
									}, this)

								});

							}, this)
						});
					} else {
						//this.getModel("LocalDataModel").setProperty("/enabledNext01", false);
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PlsEnterValVIN"));
						this.getView().byId("idNewECPMsgStrip").setType("Error");

						oVin.setValueStateText(this.oBundle.getText("ECP0007EVIN"));
						oVin.setValueState(sap.ui.core.ValueState.Error);
					}
				}, this),
				error: $.proxy(function (err) {
					console.log(err);
					//this.getModel("LocalDataModel").setProperty("/enabledNext01", false);
				}, this)
			});

			// 			if (!($.isEmptyObject(oVal)) && oVal.length === 17) {

			// 			} else if ($.isEmptyObject(oVal)) {
			// 				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
			// 				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("ECP0007EVIN"));
			// 				this.getView().byId("idNewECPMsgStrip").setType("Error");
			// 				oVin.setValueStateText(this.oBundle.getText("ECP0007EVIN"));
			// 				oVin.setValueState(sap.ui.core.ValueState.Error);
			// 			} else if (oVal.length < 17) {

			// 			}
		},

		onSelectAgrType: function (oEvent) {
			this.oSelectedAgrTypeKey = oEvent.getSource().getSelectedKey();
			var oSelectedText = this.getView().getModel("i18n").getResourceBundle().getText("EXTENSION");
			var oAgrTableData = this.getView().getModel("LocalDataModel").getProperty("/AgreementDataActive");
			if (this.oSelectedAgrTypeKey == oSelectedText) {
				this.getView().getModel("oSetProperty").setProperty("/oAgreementTable", true);
			} else {
				this.getView().getModel("oSetProperty").setProperty("/oAgreementTable", false);
			}
			if (oAgrTableData != "" && this.oSelectedAgrTypeKey === oSelectedText) {
				this.getView().getModel("oSetProperty").setProperty("/ostep3", false);
			} else {
				this.getView().getModel("oSetProperty").setProperty("/ostep3", true);
			}
		},

		onSelectAgrRow: function (oEvent) {
			this.oAgrTable = oEvent.getParameters().rowContext.sPath;
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
			if (obj.bcc_agr_st_cd == "A") {
				this.getView().getModel("oSetProperty").setProperty("/ostep3", true);
				this.getView().getModel("oSetProperty").setProperty("/oAgrTopDetails", true);
				this.getView().getModel("oSetProperty").setProperty("/oAgrOwner", true);

				var oDealer = obj.CustomerNumber;
				this.getModel("LocalDataModel").setProperty("/AgreementObj", obj);
				var oBusinessModel = this.getModel("ApiBusinessModel");
				oBusinessModel.read("/A_BusinessPartnerAddress", {
					urlParameters: {
						"$filter": "BusinessPartner eq '" + oDealer + "' ",
						"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress"

					},
					success: $.proxy(function (data) {

						this.getModel("LocalDataModel").setProperty("/OwnerData", data.results[0]);
						if (data.results != "") {
							this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", data.results[0].to_EmailAddress.results[0].EmailAddress);
							this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", data.results[0].to_PhoneNumber.results[0].PhoneNumber);
							this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", data.results[0].to_FaxNumber.results[0].FaxNumber);
						}
					}, this),
					error: function () {
						console.log("Error");
					}
				});

				oBusinessModel.read("/A_BusinessPartner", {
					urlParameters: {
						"$filter": "BusinessPartner eq '" + oDealer + "' "
					},
					success: $.proxy(function (data) {
						console.log(data);
						this.getModel("LocalDataModel").setProperty("/AgreementOwnerName", data.results[0]);

					}, this),
					error: function () {
						console.log("Error");
					}
				});
			} else {

				MessageBox.error(
					this.oBundle.getText("StatusCanceled"), {
						onClose: function (sAction) {
							MessageToast.show(sAction);
						}
					}
				);
			}
		},
		//Auth: Vinay
		//this method is to fix the key tranlation issue while calling the zc_ecp_valid_plansSet with Plane type New/used/Ext
		// Becoz this key are getting translated due to language and Service is not able to identified/incorporate the translated key in Service
		getTypeOfAggreementKey: function (planTypeStr) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (planTypeStr === oBundle.getText("NEWVEHICLEAGREEMENT")) {
				return "NEW VEHICLE AGREEMENT";
			}
			if (planTypeStr === oBundle.getText("USEDVEHICLEAGREEMENT")) {
				return "USED VEHICLE AGREEMENT";
			}
			if (planTypeStr === oBundle.getText("EXTENSION")) {
				return "EXTENSION";
			}

		},
		OnNextStep3: function (oEvent) {
			var oOdometer = this.getView().byId("idOdoVal");
			var oOdoVal = oOdometer.getValue();
			var oSaleDateId = this.getView().byId("idDate");
			var oSaleDate = oSaleDateId.getValue();
			var zEcpModel = this.getModel("EcpSalesModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oAgrInptElem = this.getView().byId("idAgrType");
			oAgrInptElem.setValueState(sap.ui.core.ValueState.None);
			oOdometer.setValueState(sap.ui.core.ValueState.None);
			oSaleDateId.setValueState(sap.ui.core.ValueState.None);

			var oVin = this.getView().getModel("EcpFieldData").getProperty("/ZecpVin");
			var oAgrTyp = this.getView().getModel("EcpFieldData").getProperty("/ZecpAgrType");
			zEcpModel.read("/zc_ecp_agreement", {
				urlParameters: {
					"$filter": "VIN eq '" + oVin + "'and AgreementStatus eq 'Active'"
				},
				success: $.proxy(function (data) {
					var oLength = data.results.length;
					if (oAgrTyp == oBundle.getText("NEWVEHICLEAGREEMENT") && oLength > 0) {
						this.getView().getModel("oSetProperty").setProperty("/oTab3visible", false);
						this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab2");
						MessageToast.show(oBundle.getText("ActiveAgrexist"), {
							width: "30em",
							my: "center center",
							at: "center center",
							onClose: $.proxy(function () {
								this.getRouter().navTo("ApplicationList");
							}, this)
						});

					} else if (oAgrTyp == oBundle.getText("USEDVEHICLEAGREEMENT") && oLength > 0) {
						this.getView().getModel("oSetProperty").setProperty("/oTab3visible", false);
						this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab2");
						MessageToast.show(oBundle.getText("ActiveAgrexist"), {
							width: "30em",
							my: "center center",
							at: "center center",
							onClose: $.proxy(function () {
								this.getRouter().navTo("ApplicationList");
							}, this)
						});

					}

				}, this),
				error: $.proxy(function () {

				}, this)

			});

			if (this.oCustomer) {
				var oCustomerNum = this.oCustomer.substr(5);
			}

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});

			var oFormatedSaleDate = oDateFormat.format(new Date(oSaleDateId.getDateValue()));
			var agreeTypeKey = this.getTypeOfAggreementKey(this.oECPData.ZecpAgrType);
			zEcpModel.read("/zc_ecp_valid_plansSet", {
				urlParameters: {
					"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'and KUNNR eq '" + oCustomerNum + "'and ZECPAGRTYPE eq '" + agreeTypeKey +
						"'and ZECPSALE_DATE eq datetime'" + oFormatedSaleDate + "'",
					"$expand": "ZC_ECP_PLANOSET,ZC_PLANDEALSET,ZC_ECP_PLANSSET,ZC_RETURNSET,ZC_VEHICLESET"
				},
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/PlanValidSet", data.results[0].ZC_ECP_PLANSSET.results);

				}, this),
				error: function () {
					console.log("Error");
				}
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
					"$filter": "BusinessPartner eq '" + this.oCustomer + "' ",
					"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress"

				},
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/OwnerData", data.results[0]);
					if (data.results != "") {
						this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", data.results[0].to_EmailAddress.results[
							0].EmailAddress);
						this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", data.results[0].to_PhoneNumber.results[
								0]
							.PhoneNumber);
						this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", data.results[0].to_FaxNumber.results[
							0].FaxNumber);
					}

					this.oECPData = this.getView().getModel("EcpFieldData").getData();

					if (data.results[0].BusinessPartner != undefined || data.results[0].BusinessPartner != "") {
						this.oECPData.ZecpCustNum = data.results[0].BusinessPartner;
					}
					if (data.results[0].CityName != undefined || data.results[0].CityName != "") {
						this.oECPData.ZecpCity = data.results[0].CityName;
					}
					if (data.results[0].StreetName != undefined || data.results[0].StreetName != "") {
						this.oECPData.ZecpAddress = data.results[0].StreetName;
					}
					if (data.results[0].to_EmailAddress.results.length > 0) {
						this.oECPData.ZecpEmail = data.results[0].to_EmailAddress.results[0].EmailAddress;
					} else {
						this.oECPData.ZecpEmail = "";
					}
					if (data.results[0].PostalCode != undefined || data.results[0].PostalCode != "") {
						this.oECPData.ZecpPostalcode = data.results[0].PostalCode;
					}
					if (data.results[0].Region != undefined || data.results[0].Region != "") {
						this.oECPData.ZecpProvince = data.results[0].Region;
					}
					if (data.results[0].to_PhoneNumber.results.length > 0) {
						this.oECPData.ZecpHomePhone = data.results[0].to_PhoneNumber.results[0].PhoneNumber;
					}
					if (data.results[0].to_FaxNumber.results.length > 0) {
						this.oECPData.ZecpBusPhone = data.results[0].to_FaxNumber.results[0].FaxNumber;
					}

				}, this),
				error: function () {
					console.log("Error");
				}
			});

			oBusinessModel.read("/A_BusinessPartner", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + this.oCustomer + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/AgreementOwnerName", data.results[0]);
					if (data.results[0].LastName != undefined || data.results[0].LastName != "") {
						this.oECPData.ZecpLastName = data.results[0].LastName;
					}
					if (data.results[0].FirstName != undefined || data.results[0].FirstName != "") {
						this.oECPData.ZecpCustName = data.results[0].FirstName;
					}
				}, this),
				error: function () {}
			});

			var oAgr = this.getView().byId("idAgrType");
			var oAgrItem = this.getView().byId("idAgrType").getSelectedItem();

			var oSaleDateTime = new Date(oSaleDateId.getDateValue()).getTime();

			var oCurrentDate = new Date().getTime();
			var oRegDate = new Date(this.BccAgrmntPrtDt).getTime();

			this.DifferTime = (oSaleDateTime - oRegDate);

			var oDay = this.getModel("LocalDataModel").getProperty("/PricingModelData/B_DAYS");
			var oDayMili = parseInt(oDay) * 1000 * 60 * 60 * 24;
			if (this.oECPData.ZecpAgrType === this.oBundle.getText("NEWVEHICLEAGREEMENT")) {
				if (this.DifferTime < oDayMili) {
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "Yes");
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", this.oBundle.getText("Yes"));
				} else if (this.DifferTime > oDayMili) {
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "No");
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", this.oBundle.getText("No"));
				}
			} else {
				this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "No");
				this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", this.oBundle.getText("No"));
			}
			if (!($.isEmptyObject(oOdoVal && oAgrItem && oSaleDate)) && oSaleDateTime <= oCurrentDate && oSaleDateTime >= oRegDate && oOdoVal >
				0) {

				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");

				this.getView().getModel("oSetProperty").setProperty("/oTab3visible", true);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				oAgr.setValueState(sap.ui.core.ValueState.None);
				oOdometer.setValueState(sap.ui.core.ValueState.None);
				oSaleDateId.setValueState(sap.ui.core.ValueState.None);
			} else if ($.isEmptyObject(oSaleDate)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("ECP0007EDate"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
				oSaleDateId.setValueStateText(this.oBundle.getText("ECP0007EDate"));
			} else if (oSaleDateTime > oCurrentDate) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectSaleDate"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
				oSaleDateId.setValueStateText(this.oBundle.getText("PleaseSelectSaleDate"));
			} else if (oSaleDateTime < oRegDate) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Agreementdateislessthanvehicleregistrationdate") + "(" + new Date(
					this.BccAgrmntPrtDt).toDateString() + ")");
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
				oSaleDateId.setValueStateText(this.oBundle.getText("Agreementdateislessthanvehicleregistrationdate") + "(" + new Date(
					this.BccAgrmntPrtDt).toDateString() + ")");
			} else if ($.isEmptyObject(oOdoVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("ECP0007EOdo"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oOdometer.setValueState(sap.ui.core.ValueState.Error);
				oOdometer.setValueStateText(this.oBundle.getText("ECP0007EOdo"));
			} else if (oOdoVal <= 0) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("OdometerGreaterThan0"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oOdometer.setValueState(sap.ui.core.ValueState.Error);
				oOdometer.setValueStateText(this.oBundle.getText("OdometerGreaterThan0"));
			} else if ($.isEmptyObject(oAgrItem)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectAgreementType"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oAgr.setValueState(sap.ui.core.ValueState.Error);
				oAgr.setValueStateText(this.oBundle.getText("PleaseSelectAgreementType"));
			}

			if (this.oSelectedAgrTypeKey == this.oBundle.getText("USEDVEHICLEAGREEMENT")) {
				var oSaleYear = new Date(oSaleDate).getFullYear();
				var oModelYr = this.getModel("LocalDataModel").getProperty("/PricingModelData/ZZMOYR");
				var oyearGap = parseInt(oSaleYear - oModelYr);
				if (oyearGap > 8) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Model year exceeds by " + parseInt(oyearGap - 8) + " years");
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					this.getView().getModel("oSetProperty").setProperty("/oTab3visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab2");
				} else if (oyearGap <= 8 && oSaleDateTime <= oCurrentDate && oSaleDateTime >= oRegDate) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
					this.getView().byId("idNewECPMsgStrip").setType("None");
					//this.getView().byId("idFilter03").setProperty("enabled", true);
					this.getView().getModel("oSetProperty").setProperty("/oTab3visible", true);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
					oAgr.setValueState(sap.ui.core.ValueState.None);
					oOdometer.setValueState(sap.ui.core.ValueState.None);
					oSaleDateId.setValueState(sap.ui.core.ValueState.None);
				}
			}

		},
		onSelectPlanCode: function (oEvent) {

			this.oPlanCode = oEvent.getParameters().selectedItem.getText();
			var oPlanKey = oEvent.getSource().getSelectedKey();
			var km = oPlanKey.split("/")[0];
			var mnth = oPlanKey.split("/")[1];
			this.mxMillage = oPlanKey.split("/")[2];
			this.mxMonth = oPlanKey.split("/")[3];
			this.oAdditionalText = oEvent.getSource().getSelectedItem().getAdditionalText();
			this.oAdditionalVal = parseInt(km.replace(/,/g, ''));
			this.oPlanMonth = parseInt(mnth);

			this.PlanTime = parseFloat(this.oPlanMonth * 30.42 * 24 * 60 * 60 * 1000).toFixed(2);

			var zEcpModel = this.getModel("EcpSalesModel");
			this._oToken = zEcpModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			zEcpModel.read("/zc_ecp_planpricing_dataSet", {
				urlParameters: {
					"$filter": "MGANR eq '" + this.oPlanCode + "'and ODMTR eq'" + this.oECPData.ZecpOdometer + "'and VIN eq '" + this.oECPData.ZecpVin +
						"'and ZECPAGRTYPE eq'" + this.oECPData.ZecpAgrType + "'"
				},
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/oPlanPricingData", data.results[0]);
					this.oECPData.ZecpRetPrice = data.results[0].ZECP_RET_PRICE;
					this.oECPData.ZecpDefSurchrg = data.results[0].ZECP_DEF_SURCHRG;
					this.oECPData.ZecpVehSurchrgAmt = data.results[0].ZECP_VEH_SURCHRG_AMT;
					this.oECPData.ZecpListpurprice = data.results[0].ZECP_LISTPURPRICE;

				}, this),
				error: function (err) {
					console.log(err);
				}
			});

			var oidPlanCodeId = this.getView().byId("idPlanCode");
			oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
			oidPlanCodeId.setValueStateText("");

		},
		onChangePreownedCert: function (oEvent) {
			var oVal = oEvent.getSource().getValue();
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (oVal.length > 10) {
				this.getModel("LocalDataModel").setProperty("/PreownedState", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("MaximumLength10"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oEvent.getSource().setValue("");
			} else {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getModel("LocalDataModel").setProperty("/PreownedState", "None");
			}
		},
		_fnDayHrSecond: function (milliseconds) {
			var day, hour, minute, seconds, month;
			seconds = Math.floor(milliseconds / 1000);
			minute = Math.floor(seconds / 60);
			seconds = seconds % 60;
			hour = Math.floor(minute / 60);
			minute = minute % 60;
			day = Math.floor(hour / 24);
			hour = hour % 24;
			month = Math.floor(day / 30);
			day = day % 30;
			return {
				month: month,
				day: day,
				hour: hour,
				minute: minute,
				seconds: seconds
			};
		},
		getNewVehiclePlnValidated: function (Vin, isGoldPaltPlan) {
			if (!isGoldPaltPlan) {
				this._deferVechPlnValidate.resolve();
				return;
			}
			var claimServiceModel = this.getModel("ClaimServiceModel");
			this._oToken = claimServiceModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});

			claimServiceModel.read("/ZC_WTY_INFO", {
				urlParameters: {
					"$filter": "VinNum eq '" + this.oECPData.ZecpVin + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/claimData", data.results[0]);
					console.log(data.results[0]);
					this._deferVechPlnValidate.resolve();
				}, this),
				error: function () {
					this._deferVechPlnValidate.resolve();
				}
			});
		},
		check4NewVehiclePlan: function (selectedPlan) {
			var getPlanArray = this.oBundle.getText("NewVehiclePlans").split("/");
			if (getPlanArray.indexOf(selectedPlan) > -1) {
				//New Plan has been slected
				return true;
			} else {
				return false;
			}
		},
		check4PrimUsedVehiclePlan: function (selectedPlan) {
			var vehiclePlansForPriceDisable = ["ULR1A", "ULR2A", "ULPZY", "ULP1D", "ULP2E", "UTR1A", "UTR1B", "UTUZH", "UTUWC"];
			if (vehiclePlansForPriceDisable.indexOf(selectedPlan) > -1) {
				//New Plan has been slected
				return true;
			} else {
				return false;
			}
		},
		OnNextStep4: function (oEvent) {

			var oPlanArray = ["NTC34", "NTC94", "NTC45", "NTC46", "NTC47", "NTF34", "NTF94", "NTF45", "NTF46", "NTF47", "CTC40", "CTC50"];

			var oSelectedPlan = this.getView().getModel("EcpFieldData").getProperty("/ZecpPlancode");
			var oidPlanCodeId = this.getView().byId("idPlanCode");

			var oidPlanCode = oidPlanCodeId.getSelectedItem();
			var isGoldPaltPlan = this.check4NewVehiclePlan(oSelectedPlan);

			this._deferVechPlnValidate = jQuery.Deferred();
			this.getNewVehiclePlnValidated(this.oECPData.ZecpVin, isGoldPaltPlan);
			this._deferVechPlnValidate.always($.proxy(function (oData) {
				if (isGoldPaltPlan) {
					var factWarrentyEdate = this.getModel("LocalDataModel").getProperty("/claimData").EndDate;
					var saleDate = this.oECPData.ZecpSaleDate;
					var odMerVal = this.oECPData.ZecpOdometer;
					if (odMerVal >= 60000 || factWarrentyEdate.getTime() < saleDate.getTime()) {

						this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("NewVehiclePlanRule"));
						this.getView().byId("idNewECPMsgStrip").setType("Error");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);

						return
					} else {
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("NewVehiclePlanRule"));
						this.getView().byId("idNewECPMsgStrip").setType("None");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
					}
				}
				if (this.oECPData.ZecpAgrType === this.oBundle.getText("NEWVEHICLEAGREEMENT")) {
					this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "Yes");
					this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard1", this.oBundle.getText("Yes"));

					//For Defect 12699
					this.getView().getModel("oSetProperty").setProperty("/notUsedPrimPlan", true);

					if (!($.isEmptyObject(oidPlanCode)) && this.oECPData.ZecpOdometer <= this.oAdditionalVal && this.DifferTime <= this.PlanTime) {

						this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
						this.getView().byId("idNewECPMsgStrip").setType("None");
						this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
						this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");

					} else if ($.isEmptyObject(oidPlanCode)) {
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectPlanCode"));
						this.getView().byId("idNewECPMsgStrip").setType("Error");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
						oidPlanCodeId.setValueStateText(this.oBundle.getText("ECP0007EPlanCode"));
					} else if (this.oECPData.ZecpOdometer > this.oAdditionalVal) {
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Odometervalueexceeds") + " " +
							(this.oECPData.ZecpOdometer - this.oAdditionalVal) + this.oBundle
							.getText("KMagainstplanmilagevalue"));
						this.getView().byId("idNewECPMsgStrip").setType("Error");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
						oidPlanCodeId.setValueStateText("");

					} else if (this.DifferTime > this.PlanTime) {
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
						var oTimeDiffer = this.DifferTime - this.PlanTime;

						var TotalTimeDiffer = this._fnDayHrSecond(oTimeDiffer);

						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Planperiodexceedsby") + " " +
							TotalTimeDiffer.month + " Months : " + TotalTimeDiffer.day + " Days : " + TotalTimeDiffer.hour + " Hours : " +
							TotalTimeDiffer.minute + " Minutes ");

						this.getView().byId("idNewECPMsgStrip").setType("Error");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
						oidPlanCodeId.setValueStateText("");

					}

				}

			}, this));

			var difDay = parseInt(this.DifferTime / (24 * 60 * 60 * 1000));

			for (var i = 0; i < oPlanArray.length; i++) {
				if (oPlanArray[i] == oSelectedPlan) {
					if (difDay <= 31) {
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
						this.getView().byId("idNewECPMsgStrip").setType("None");
						this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
						this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");
					} else {
						this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
						this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("RDR31Days"));
						this.getView().byId("idNewECPMsgStrip").setType("Error");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
						this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
						this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");

					}
				}
			}

			var oMonthDef = this.DifferTime;
			var MaxDays = parseInt(this.mxMonth) * 30 * 1000 * 60 * 60 * 24;

			if (this.oECPData.ZecpAgrType === this.oBundle.getText("USEDVEHICLEAGREEMENT")) {

				//to Fix Defect #12699
				var isUsedPrimPlan = this.check4PrimUsedVehiclePlan(oSelectedPlan);
				if (isUsedPrimPlan) {
					this.getView().getModel("oSetProperty").setProperty("/notUsedPrimPlan", false);
					this.oECPData.ZecpPlanpurchprice = "0.01";
				} else {
					this.getView().getModel("oSetProperty").setProperty("/notUsedPrimPlan", true);
				}

				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "No");
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard1", this.oBundle.getText("No"));

				//Fixing Defect #11008 Hiding Surcharge boxes
				this.getView().getModel("oSetProperty").setProperty("/oSurcharge", false);
				if (parseInt(this.oECPData.ZecpOdometer) <= parseInt(this.mxMillage) && oMonthDef <= MaxDays) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
					this.getView().byId("idNewECPMsgStrip").setType("None");
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");
				} else if (parseInt(this.oECPData.ZecpOdometer) > parseInt(this.mxMillage) && oMonthDef > MaxDays) {
					var TotaldayMonDif = this._fnDayHrSecond(oMonthDef - MaxDays);
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Maximum Mileage Exceeds by " + ((parseInt(this.oECPData.ZecpOdometer) - parseInt(
							this.mxMillage))) + " KM and" + " Maximum Month Exceeds by " + TotaldayMonDif.month + " Months : " + TotaldayMonDif.day +
						" Days ");
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				} else if (parseInt(this.oECPData.ZecpOdometer) > parseInt(this.mxMillage)) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Maximum Mileage Exceeds by " + ((parseInt(this.oECPData.ZecpOdometer) - parseInt(
						this.mxMillage))) + " KM");
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				} else if (oMonthDef > MaxDays) {

					var TotaldayMonDif = this._fnDayHrSecond(oMonthDef - MaxDays);

					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Maximum Month Exceeds by " +
						TotaldayMonDif.month + " Months : " + TotaldayMonDif.day + " Days");
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				}

				//In Case of used vechical benefit flag will always No
				this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "No");
				this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag1", this.oBundle.getText("No"));
			} else {
				this.getView().getModel("oSetProperty").setProperty("/oSurcharge", false);
			}

			//defect id 10908
			if (this.oECPData.ZecpAgrType === this.oBundle.getText("EXTENSIONVEHICLEAGREEMENT")) {
				if (!($.isEmptyObject(oidPlanCode))) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
					this.getView().byId("idNewECPMsgStrip").setType("None");
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");

				} else if ($.isEmptyObject(oidPlanCode)) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectPlanCode"));
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					oidPlanCodeId.setValueStateText(this.oBundle.getText("ECP0007EPlanCode"));
				}

			}

			//resetting the LienFields Validation

			this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");

			//Fetching Bussiness Partner Details for Vehicle Owner Detail
			var vehcOwnrSectonCno = this.getModel("LocalDataModel").getProperty("/OwnerData/BusinessPartner");
			var oBusinessModelOnSubmit = this.getModel("ApiBusinessModel");
			this._oToken = oBusinessModelOnSubmit.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			if (vehcOwnrSectonCno) {

				oBusinessModelOnSubmit.read("/A_BusinessPartnerAddress", {
					urlParameters: {
						"$filter": "BusinessPartner eq '" + vehcOwnrSectonCno + "' ",
						"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress,to_MobilePhoneNumber"

					},
					success: $.proxy(function (budata) {

							this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub", budata.results[0]);
							if (budata.results[0].to_EmailAddress.results.lentgh > 0) {
								this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/EmailAddress", budata.results[0].to_EmailAddress.results[
									0].EmailAddress);
							}
							if (budata.results[0].to_PhoneNumber.results.lentgh > 0) {
								this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/PhoneNumber", budata.results[0].to_PhoneNumber.results[
									0].PhoneNumber);
							}
							if (budata.results[0].to_FaxNumber.results.lentgh > 0) {
								this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/FaxNumber", budata.results[0].to_FaxNumber.results[0]
									.FaxNumber);
							}
							if (budata.results[0].to_MobilePhoneNumber.results.lentgh > 0) {
								this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/Mobile", budata.results[0].to_MobilePhoneNumber.results[
									0].MobilePhoneNumber);
							}

						},
						this),
					error: function () {
						console.log("Error");
					}
				});

				oBusinessModelOnSubmit.read("/A_BusinessPartner", {
					urlParameters: {
						"$filter": "BusinessPartner eq '" + vehcOwnrSectonCno + "' "
					},
					success: $.proxy(function (bpdata) {

						this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/FirstName", bpdata.results[0].FirstName);
						this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/LastName", bpdata.results[0].LastName);
						this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/BusinessPartnerCategory", bpdata.results[0].BusinessPartnerCategory);
						this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub/BusinessPartnerCategory", bpdata.results[0].BusinessPartnerCategory);
						if (bpdata.results[0].BusinessPartnerCategory === "1") {
							// this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/Name", bpdata.results[0].FirstName+" "+ bpdata.results[0].LastName);
							// this.getModel("LocalDataModel").setProperty("/VechOwnrSectonAddress/BpType", "Individual");

							this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_Name", bpdata.results[0].FirstName + " " + bpdata.results[
								0].LastName);
							this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_BpType", this.getView().getModel("i18n").getResourceBundle()
								.getText("Individual")); // added translation

						} else if (bpdata.results[0].BusinessPartnerCategory === "2") {
							this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_Name", bpdata.results[0].OrganizationBPName1);
							this.getModel("LocalDataModel").setProperty("/VechOwnrSectAddOnAppSub_BpType", this.getView().getModel("i18n").getResourceBundle()
								.getText("Organization"));
						}

					}, this),
					error: function () {
						console.log("Error");
					}
				});

			}

		},
		onChangeAmt: function (oEvent) {
			var val = oEvent.getParameter('value');
			var parsedVal = parseFloat(val);
			if (parsedVal < 0) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValueStateText("Must be non-negative value");
				oEvent.getSource().setShowValueStateMessage(true);
			} else {
				//Handling -0 case
				if (parseFloat(val) === 0) {
					oEvent.getSource().setValue(0);
				}
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}

		},
		onChangeOdometer: function (oEvent) {

			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oOdoVal = oEvent.getSource().getValue();
			if ($.isEmptyObject(oOdoVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterOdometer"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");

				this.getModel("LocalDataModel").setProperty("/odometerState", "Error");

			} else if (oOdoVal <= 0) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("OdometerGreaterThan0"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getModel("LocalDataModel").setProperty("/odometerState", "Error");
			} else {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				this.getModel("LocalDataModel").setProperty("/odometerState", "None");
			}
			if (oOdoVal <= 50000) {
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "Yes");
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard1", this.oBundle.getText("Yes"));
			} else if (oOdoVal > 50000) {
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "No");
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard1", this.oBundle.getText("No"));
			}

			if (!this.oAdditionalVal) {
				this.oAdditionalVal = this.planKmval(this.getView().getModel("EcpFieldData").getData().ZecpPlancode);
			}
			var oECPData = this.getView().getModel("EcpFieldData").getData();
			oECPData.ZecpOdometer = oOdoVal;

			if (parseInt(oOdoVal) <= parseInt(this.oAdditionalVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else if (parseInt(oOdoVal) > parseInt(this.oAdditionalVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Odometervalueexceeds") + " " +
					(parseInt(oOdoVal) - parseInt(this.oAdditionalVal)) + this.oBundle.getText("KMagainstplanmilagevalue"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);

			} else {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			//Fixing Difect Id 8347||Auth: Vinay
			this.updateSurchargeValue(this.getModel("LocalDataModel").getProperty("/odometerState"));
		},

		//To Fix Defect Id 8347|| Getting surcharge value on change of odometer
		updateSurchargeValue: function (odoMeterState) {
			var oECPData = this.getView().getModel("EcpFieldData").getData();
			if (odoMeterState === "None") {
				var oZECPModel = this.getModel("EcpSalesModel");
				if (this.getModel("LocalDataModel").getProperty("/odometerState") === "None") {
					oZECPModel.read("/zc_ecp_planpricing_dataSet", {
						urlParameters: {
							"$filter": "MGANR eq '" + oECPData.ZecpPlancode + "'and ODMTR eq'" + oECPData.ZecpOdometer + "'and VIN eq '" + oECPData.ZecpVin +
								"'and ZECPAGRTYPE eq'" + oECPData.ZecpAgrType + "'"
						},
						success: $.proxy(function (data) {

							this.getModel("LocalDataModel").setProperty("/oPlanPricingData", data.results[0]);

							var oEcpFieldDataModel = this.getView().getModel("EcpFieldData");
							oEcpFieldDataModel.setProperty("/ZecpRetPrice", data.results[0].ZECP_RET_PRICE);
							// this.oECPData.ZecpRetPrice = data.results[0].ZECP_RET_PRICE;
							oEcpFieldDataModel.setProperty("/ZecpDefSurchrg", data.results[0].ZECP_DEF_SURCHRG);
							// this.oECPData.ZecpDefSurchrg = data.results[0].ZECP_DEF_SURCHRG;
							oEcpFieldDataModel.setProperty("/ZecpVehSurchrgAmt", data.results[0].ZECP_VEH_SURCHRG_AMT);
							// this.oECPData.ZecpVehSurchrgAmt = data.results[0].ZECP_VEH_SURCHRG_AMT;
							oEcpFieldDataModel.setProperty("/ZecpListpurprice", data.results[0].ZECP_LISTPURPRICE);
							// this.oECPData.ZecpListpurprice = data.results[0].ZECP_LISTPURPRICE;

						}, this),
						error: function (err) {
							console.log(err);
						}
					});
				}
			} else {
				return;
			}
		},

		planKmval: function (planId) {
			var planArry = this.getModel("LocalDataModel").getProperty("/ValidPlanSetData");

			var kmStr;
			if (planArry.length > 0) {
				var planLen = planArry.length
				for (var i = 0; i < planLen; i++) {
					if (planArry[i].MGANR = planId) {
						kmStr = planArry[i].KMS;
						break;
					}
				}
			}
			if (kmStr.length > 0) {
				var kmSplitArr = kmStr.split(',');
				if (kmSplitArr.length > 0) {
					var kmSplitArrLen = kmSplitArr.length;
					var numKm = kmSplitArr[0];
					for (var i = 1; i < kmSplitArrLen; i++) {
						numKm = numKm + "" + kmSplitArr[i];
					}
					console.log(numKm);
					return numKm;
				}
			}

		},
		onDelete: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var oECPData = this.getView().getModel("EcpFieldData").getData();

			var dialog = new Dialog({

				type: 'Message',
				content: new Text({
					text: oBundle.getText("AreUSureLikeDeleteApp")
				}),
				beginButton: new Button({
					text: oBundle.getText("Yes"),
					press: function () {
						var oModel = that.getView().getModel("EcpSalesModel");
						this._oToken = oModel.getHeaders()['x-csrf-token'];
						$.ajaxSetup({
							headers: {
								'X-CSRF-Token': this._oToken
							}
						});

						oModel.remove("/zc_ecp_crud_operationsSet(ZecpIntApp='" + oECPData.ZecpIntApp + "',ZecpVin='" + oECPData.ZecpVin + "')", {
							method: "DELETE",
							success: function (data) {
								oModel.refresh();
								MessageToast.show(oBundle.getText("AppDeleted") + oECPData.ZecpVin);
							},
							error: function (e) {
								alert("error");
							}
						});

						that.getRouter().navTo("ApplicationList");
						dialog.close();
					}
				}),
				endButton: new Button({
					text: oBundle.getText("Cancel"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		OnBack: function () {
			this.ogetSelectedKey = this.getView().byId("idIconTabBarNoIcons").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];

			if (ogetKey > 1 && ogetKey <= 6) {
				var oSelectedNum = ogetKey - 1;
				this.getView().getModel("oSetProperty").setProperty("/oTab" + oSelectedNum + "visible", true);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab" + oSelectedNum + "");

			} else {
				this.getModel("EcpSalesModel").refresh();

				this.getRouter().navTo("ApplicationList");

			}
			var oCurrSect = this.getView().getContent()[1];
			var objPgSection = this.getView().byId("testSection");
			oCurrSect.scrollToSection(objPgSection.getId());
		},

		OnBackSecondary: function () {
			this.getRouter().navTo("ApplicationList");
			this.getModel("EcpSalesModel").refresh();
		},
		onBackList: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var dialog = new Dialog({
				title: oBundle.getText("SaveChanges"),
				type: "Message",
				content: new Text({
					text: oBundle.getText("WillYouLikeSaveChanges")
				}),

				buttons: [
					new Button({
						text: oBundle.getText("Yes"),
						press: function () {
							that.oECPData = that.getView().getModel("EcpFieldData").getData();
							var objSave = that._fnObject("SAVE", "PENDING");
							var oEcpModel = that.getModel("EcpSalesModel");
							this._oToken = oEcpModel.getHeaders()['x-csrf-token'];
							$.ajaxSetup({
								headers: {
									'X-CSRF-Token': this._oToken
								}
							});
							oEcpModel.create("/zc_ecp_crud_operationsSet", objSave, {
								success: $.proxy(function () {

									oEcpModel.refresh();
									MessageToast.show(oBundle.getText("RecordSaved"));
									that.getRouter().navTo("ApplicationList");
								}, that),
								error: function () {
									console.log("error");
								}
							});

							dialog.close();
						}
					}),

					new Button({
						text: oBundle.getText("No"),
						press: function () {

							that.getRouter().navTo("ApplicationList");
							dialog.close();
						}
					}),
					new Button({
						text: oBundle.getText("Cancel"),
						press: function () {
							dialog.close();
						}
					})

				],

				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		_fnObject: function (elm, stat) {
			var currentDate = new Date();

			var crudObj = {
				DBOperation: elm,
				BPTYPE: this.getView().getModel("LocalDataModel").getProperty("/PricingModelData/BPTYPE"),
				ZecpIntApp: "",
				ZecpMake: this.oECPData.ZecpMake,
				ZecpAppNum: "",
				ZecpVin: this.oECPData.ZecpVin,
				ZecpAgrNum: "",
				ZecpDealcode: this.getModel("LocalDataModel").getProperty("/currentIssueDealer"),
				ZecpAppStat: stat,
				ZecpSaleDate: this._fnDateFormat(this.oECPData.ZecpSaleDate),
				ZecpOdometer: this.oECPData.ZecpOdometer,
				ZecpAgrType: this.oECPData.ZecpAgrType,
				ZecpEffDate: null,
				ZecpExpDate: null,
				ZecpDealName: "",
				ZecpSurchrgFl: "N",
				ZecpPreowned: this.oECPData.PrOwndCert,
				ZecpCustNum: this.oECPData.ZecpCustNum,
				ZecpCustName: this.oECPData.ZecpCustName,
				ZecpMidName: "",
				ZecpLastName: this.oECPData.ZecpLastName,
				ZecpBusPhone: this.oECPData.ZecpBusPhone,
				ZecpEmail: this.oECPData.ZecpEmail,
				ZecpSubDate: this._fnDateFormat02(currentDate),
				ZecpAutocode: this.oECPData.ZecpAutocode,
				ZecpVehPrice: this.oECPData.ZecpVehPrice,
				ZecpAmtFin: this.oECPData.ZecpAmtFin || "0.00",
				ZecpLienholder: this.oECPData.ZecpLienholder || "",
				ZecpLienterms: this.oECPData.ZecpLienterms || "00",
				ZecpPlancode: this.oECPData.ZecpPlancode || "",
				ZecpRetPrice: this.oECPData.ZecpRetPrice || "0.00",
				ZecpDefSurchrg: this.oECPData.ZecpDefSurchrg || "0.00",
				ZecpVehSurchrgAmt: this.oECPData.ZecpVehSurchrgAmt || "0.00",
				ZecpListpurprice: this.oECPData.ZecpListpurprice,
				ZecpVehsurchrg: this.oECPData.ZecpVehSurchrgAmt,
				ZecpRoadhazard: this.oECPData.ZecpRoadhazard,
				ZecpBenefitsFlg: this.getView().getModel("EcpFieldData").getProperty("/ZbenefitFlag"),
				BccAgrmntSaleDt: this._fnDateFormat(this.oECPData.ZecpSaleDate),
				ZecpSource: "ECP",
				ZecpDatecreated: this._fnDateFormat02(currentDate),
				ZecpLastupdate: null,
				ZecpSaletype: "",
				ZecpFueltype: "G",
				ZecpCylnum: "4",
				ZecpAdddata1: "",
				ZecpAdddata2: "",
				ZecpAdddata3: "",
				ZecpAdddata4: "",
				ZecpAdddata5: "",
				ZecpCompName: "",
				ZecpAddress: this.oECPData.ZecpAddress,
				ZecpCity: this.oECPData.ZecpCity,
				ZecpProvince: this.oECPData.ZecpProvince,
				ZecpPostalcode: this.oECPData.ZecpPostalcode,
				ZecpHomePhone: this.oECPData.ZecpHomePhone,
				ZecpBusExt: "",
				ZecpBusOrInd: "",
				ZecpModelcode: this.oECPData.ZecpModelcode,
				BccEcpAgrmntNum: "",
				BccVin: this.oECPData.ZecpVin,
				BccPlanCd: this.oECPData.ZecpPlancode,
				BccAplDlrshpNum: this.getModel("LocalDataModel").getProperty("/currentIssueDealer"),
				BccAgrStCd: "A",
				AgrStDt: this._fnDateFormat02(currentDate),
				BccAgrEvTypCd: "NEW",
				BccVoasPartNum: "",
				BccAgrmntDlrNum: this.getModel("LocalDataModel").getProperty("/currentIssueDealer"),
				BccEcpAutoCd: this.oECPData.ZecpAutocode,
				BccAgrmntExtcntr: "0.00",
				BccAgrmntPrcAmt: this.oECPData.ZecpPlanpurchprice,
				Dedctble: "",
				VehSurchLst: "",
				BccDtSrchrgFlg: "",
				BccDefSrchrgAmt: this.oECPData.ZecpDefSurchrg,
				BccAgrmntYrCd: "",
				BccAgrmntSerNo: "0.00",
				BccVehSrchrgFlg: "",
				BccVehSrchrgAmt: this.oECPData.ZecpVehSurchrgAmt,
				BccDlrCommsnAmt: "0.00",
				BccCdbCustNum: this.oECPData.ZecpCustNum,
				BccAgrmntThruKm: "0.00",
				BccLubBnftFlg: "",
				BccVehStsKm: this.oECPData.ZecpOdometer,
				BccAgrmntDlrPfl: "",
				BccPlnLienHldr: "",
				BccPlnLienTrmth: "0.00",
				BccPlnLienAmt: "0.00",
				BccDlrNetDebamt: "0.00",
				BccNetDebAmt: "0.00",
				BccNetGwDebAmt: "0.00",
				BccNetGwCreAmt: "0.00",
				BccNetGwOffCre: "0.00",
				BccNetRecvryDeb: "0.00",
				BccCncTsfFee: "0.00",
				BccCustRfndAmt: "0.00",
				BccAdjstdAdmAmt: "0.00",
				BccAdjstdFdAmt: "0.00",
				BccAdjstdRapAmt: "0.00",
				BccAdjstdSurAmt: "0.00",
				BccAgrActSrDes: "",
				BccAdjstrCmnts: "",
				BccUsrCalAmtflg: "",
				BccRdHzrd: "",
				Odmtr: this.oECPData.ZecpOdometer,
				TrnfrOdometer: "",
				TrnfrFee: "",
				PrOwndCert: this.oECPData.PrOwndCert,
				PrVendorFlag: "",
				BccInscTrnmtFl: "",
				BccRdsdTrnmtFl: "A",
				BccMktngTrnmtFl: "",
				BccDlrDebGst: "0.00",
				BccDlrDebPst: "0.00",
				BccCustRfndGst: "0.00",
				BccCustRfndPst: "0.00",
				BccFinclAjstrId: "",
				BccDebitRequest: "",
				BccCreditRequest: "",
				BccCrtrUserid: "",
				BccCrtnTmstmp: "",
				BccLstUpdPltf: "",
				BccLstUpdPgmid: "",
				BccLstUpdUserid: "",
				BccLstUpdTmstmp: "",
				ZamtFincd: "0.00",
				ZretailPrice: "0.00",
				ZbenefitFlag: "",
				ZecpPlanpurchprice: this.oECPData.ZecpPlanpurchprice
			};
			return crudObj;
		},
		onSaveApp: function (isFromSubmit) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oOdometer = this.getView().byId("idOdoVal");
			var oOdoVal = oOdometer.getValue();
			this.oECPData.ZecpVehPrice = $(".ZecpVehPriceCls input").val();
			this.oECPData.ZecpPlanpurchprice = $(".ZecpPlanpurchpriceCls input").val();
			if ($.isEmptyObject(this.oECPData.ZecpVehPrice.toString()) && $.isEmptyObject(this.oECPData.ZecpPlanpurchprice.toString())) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "Error");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if (!$.isEmptyObject(this.oECPData.ZecpVehPrice.toString()) && $.isEmptyObject(this.oECPData.ZecpPlanpurchprice.toString())) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if ($.isEmptyObject(this.oECPData.ZecpVehPrice.toString()) && !$.isEmptyObject(this.oECPData.ZecpPlanpurchprice.toString())) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "Error");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpPlanpurchprice") > 9999) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("ExceedPlanPrice"));
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpLienholder") == "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienterms") == "" && this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") != "") {
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", true);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("FillMendatoryField"));
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") == "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienholder") == "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienterms") != "") {
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", true);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", true);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("FillMendatoryField"));
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") == "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienterms") == "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienholder") != "") {
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("FillMendatoryField"));
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpLienholder") != "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienterms") == "" && this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") != "") {
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") == "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienholder") != "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienterms") != "") {
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", true);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("FillMendatoryField"));
			} else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") != "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienterms") != "" && this.getView().getModel("EcpFieldData").getProperty(
					"/ZecpLienholder") == "") {
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", true);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "Error");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("FillMendatoryField"));
			} else if (oOdoVal == "") {
				this.getModel("LocalDataModel").setProperty("/odometerState", "Error");

				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("FillMendatoryField"));
			} else if ((this.getView().byId("idNewECPMsgStrip").getProperty("visible") == false) && !(isFromSubmit.isFrmSubmit)) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
				this.getView().byId("idNewECPMsgStrip").setText("");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
				this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);

				this.getModel("LocalDataModel").setProperty("/odometerState", "None");

				this.oECPData = this.getView().getModel("EcpFieldData").getData();
				var objSave = this._fnObject("SAVE", "PENDING");
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var oEcpModel = this.getModel("EcpSalesModel");
				this._oToken = oEcpModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				oEcpModel.create("/zc_ecp_crud_operationsSet", objSave, {
					success: $.proxy(function () {
						MessageToast.show(oBundle.getText("DraftCreated") + this.oECPData.ZecpVin);
						oEcpModel.refresh();
						this.getRouter().navTo("ApplicationList");
						this.getModel("LocalDataModel").updateBindings(true);
						this.getModel("LocalDataModel").refresh();

						this.getModel("EcpSalesModel").refresh(true);

					}, this),
					error: function () {

					}
				});
			}

		},

		onEnterPlanPurchasePrice: function (oEvent) {
			var oval = oEvent.getParameters().value;
			if (oval > 9999) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("ExceedPlanPrice"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
			} else {
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setText("");
			}
		},

		onUpdateSavedApp: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oECPData = this.getView().getModel("EcpFieldData").getData();
			var oEcpModel = this.getModel("EcpSalesModel");
			this._oToken = oEcpModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			var obj = {
				"ZecpIntApp": this.oAppId,
				"ZecpVin": this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/VIN"),
				"ZecpOdometer": oECPData.ZecpOdometer,
				"ZecpVehPrice": oECPData.ZecpVehPrice,
				"ZecpAmtFin": oECPData.ZecpAmtFin,
				"ZecpLienholder": oECPData.ZecpLienholder,
				"ZecpPlanpurchprice": oECPData.ZecpPlanpurchprice,
				"PrOwndCert": oECPData.PrOwndCert || "0.00",
				"Odmtr": oECPData.ZecpOdometer,
				"ZretailPrice": oECPData.ZretailPrice,
				"ZamtFincd": oECPData.ZamtFincd,
				"BccPlnLienHldr": oECPData.BccPlnLienHldr,
				"ZecpLienterms": oECPData.ZecpLienterms,
				"ZbenefitFlag": oECPData.ZbenefitFlag
			};

			oEcpModel.update("/zc_ecp_crud_operationsSet(ZecpIntApp='" + this.oAppId + "',ZecpVin='" + this.getModel("LocalDataModel").getProperty(
					"/ApplicationOwnerData/VIN") +
				"')", obj, {
					method: "PUT",
					success: $.proxy(function (response) {
						oEcpModel.refresh();
						this.getRouter().navTo("ApplicationList");
						MessageToast.show(oBundle.getText("UpdatedDataHasbeenSavedSuccessFully"));
					}, this),
					error: function () {
						MessageToast.show(oBundle.getText("PleaseTryAgainToSave"));
					}
				});
		},
		//Auth: Vinay
		//Check and Validate DMS data with Vechical owner to Verify Address Defect_ID: 9618
		//Comparing  Name City Provinecn, Address and Postal code
		validateAgrmtOwnrNVechOwnr: function () {

			var currSettings = this.getView().getModel("oSetProperty").getData();
			if (currSettings.oAgrOwnerDMS) {
				var localDataModel = this.getView().getModel("LocalDataModel").getData();
				var aggreDmsData = localDataModel.ApplicationOwnerData;
				var vechicalAgreementOwnerDetail = localDataModel.AgreementOwnerName;
				var vechicalOwnerDetail = localDataModel.OwnerData;

				// ApplicationOwnerData/CustomerName	
				//checking First Name
				if (aggreDmsData.CustomerName.toUpperCase().trim() !== vechicalAgreementOwnerDetail.FirstName.toUpperCase().trim()) {
					return false;
				}
				//checking Last Name
				if (aggreDmsData.CustomerLastName.toUpperCase().trim() !== vechicalAgreementOwnerDetail.LastName.toUpperCase().trim()) {
					return false;
				}
				//checking City
				// if (aggreDmsData.City.toUpperCase() !== vechicalOwnerDetail.CityName.toUpperCase()) {
				// 	return false;
				// }
				//checking Province
				// if (aggreDmsData.Province.toUpperCase() !== vechicalOwnerDetail.Region.toUpperCase()) {
				// 	return false;
				// }

				//checking Postal Code
				if (aggreDmsData.PostalCode.toUpperCase() !== vechicalOwnerDetail.PostalCode.toUpperCase()) {
					return false;
				}

				return true;

			} else {
				return true;
			}

		},
		//Verify Address Defect_ID: 9618
		showSubmitValidationError: function () {

			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var dialog = new Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new Text({
					text: oBundle.getText("AgreementOwner_And_VechicalOwner_Address_Data_MisMatch")
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		validateLineFields: function () {
			var oEcpFieldM = this.getView().getModel("EcpFieldData").getData();
			var localModel = this.getView().getModel("LocalDataModel");
			var finAmt = oEcpFieldM.ZecpAmtFin;

			var lienholderName = oEcpFieldM.ZecpLienholder;

			var lienTerms = oEcpFieldM.ZecpLienterms;

			if (!($.isEmptyObject(finAmt)) || !($.isEmptyObject(lienholderName)) || !($.isEmptyObject(lienTerms))) {
				if ($.isEmptyObject(finAmt) || $.isEmptyObject(lienholderName) || $.isEmptyObject(lienTerms)) {
					if ($.isEmptyObject(finAmt)) {
						//	setError State

						this.getModel("LocalDataModel").setProperty("/AmtFinReq", true);
						this.getModel("LocalDataModel").setProperty("/AmtFinState", "Error");

					} else {

						this.getModel("LocalDataModel").setProperty("/AmtFinReq", true);
						this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
					}

					if ($.isEmptyObject(lienholderName)) {

						this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", true);
						this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "Error");
					} else {

						this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", true);
						this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
					}
					if ($.isEmptyObject(lienTerms)) {

						this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
						this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "Error");
					} else {

						this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
						this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
					}
				} else {

					this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
					this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
					this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", true);
					this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
					this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", true);
					this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
					return true;
				}
				return false;
			} else {

				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
				this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
				this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
				return true;
			}
		},
		/*
			Defect:9937
			Auth Vinay Chandra
		*/
		setDataValueOnEcpData: function (objSub) {
			var oOwnerData = this.getModel("LocalDataModel").getProperty("/OwnerData");
			var oPricingModelData = this.getModel("LocalDataModel").getProperty("/PricingModelData");
			var oAgreementOwnerName = this.getModel("LocalDataModel").getProperty("/AgreementOwnerName");
			objSub.ZecpCustNum = oOwnerData.BusinessPartner;
			objSub.BPTYPE = oPricingModelData.BPTYPE;

			objSub.ZecpLastName = oAgreementOwnerName.LastName;
			objSub.ZecpCustName = oAgreementOwnerName.FirstName;
			objSub.ZecpAddress = oOwnerData.StreetName;
			objSub.ZecpCity = oOwnerData.CityName;
			objSub.ZecpProvince = oOwnerData.Region;
			objSub.ZecpPostalcode = oOwnerData.PostalCode;
			objSub.ZecpEmail = oOwnerData.EmailAddress;
			objSub.ZecpBusPhone = oOwnerData.ZecpBusPhone;
			objSub.ZecpHomePhone = oOwnerData.FaxNumber;

		},
		/* end of Defect 9937 Auth Vinay Chandra*/

		/*
			Defect:8432
			Auth Vinay Chandra
		*/
		resetValidationError: function () {

			//Lien related Input Fields

			this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
			this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");

			this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
			this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
			this.getView().byId("idNewECPMsgStrip").setText("");
			this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
			this.getView().byId("idNewECPMsgStrip").setType("None");
			this.getModel("LocalDataModel").setProperty("/odometerState", "None");

		},

		onSubmitApp: function () {
			//this._Step04MandatoryFn();

			this.getView().getModel("oSetProperty").setProperty("/submitBtn", false);
			//Verify Defect_ID: 8432 	Auth Vinay Chandra
			//ReValidating form
			this.resetValidationError();
			if (!this.oECPData) {
				this.oECPData = this.getView().getModel("EcpFieldData").getData();
			}
			var fromSubmitObj = {};
			fromSubmitObj.isFrmSubmit = true;
			$.proxy(this.onSaveApp(fromSubmitObj), this);

			if (this.getView().byId("idNewECPMsgStrip").getProperty("visible")) {
				this.getView().getModel("oSetProperty").setProperty("/submitBtn", true);
				return;
			}
			//Verify Address Defect_ID: 9618 	Auth Vinay Chandra
			if (!this.validateAgrmtOwnrNVechOwnr()) {
				this.showSubmitValidationError();
				this.getView().getModel("oSetProperty").setProperty("/submitBtn", true);
				return;
			}
			// Fixing defect #8693 	Auth Vinay Chandra
			if (!this.validateLineFields()) {
				this.getView().getModel("oSetProperty").setProperty("/submitBtn", true);
				return;
			}
			// Fixing defect #8516 	Auth Vinay Chandra
			var oEcpFieldM = this.getView().getModel("EcpFieldData").getData();
			var oZECPModel = this.getModel("EcpSalesModel");
			oZECPModel.read("/zc_ecp_vehicle_detailSet", {
				urlParameters: {
					"$filter": "VIN eq '" + oEcpFieldM.ZecpVin + "'"
				},
				success: $.proxy(function (vedata) {
					if (vedata.results[0].MAKE.toUpperCase() === "LEXUS") {
						this.getModel("LocalDataModel").setProperty("/printBtnState", false);
					} else {
						this.getModel("LocalDataModel").setProperty("/printBtnState", true);
					}
				}, this),
				error: function () {
					console.log("Error");

				}
			});

			var that = this;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var dialog = new Dialog({
				title: oBundle.getText("SubmitApp"),
				type: "Message",
				content: [
					new Text({
						text: oBundle.getText("AreYouSureToSaveChangesSubmitApptoTCIforAgreementGeneration"),
						id: "idSubmitMessg"
					})
				],
				beginButton: new Button({
					text: oBundle.getText("SubmitApplication"),
					press: function () {

						that.oECPData = that.getView().getModel("EcpFieldData").getData();
						var objSub = that._fnObject("SUB", "DELETED");
						var oEcpModel = that.getModel("EcpSalesModel");
						/*
						Defect:9937
						Auth Vinay Chandra
						*/
						that.setDataValueOnEcpData(objSub);

						/* End Of Defect 9937 */
						this._oToken = oEcpModel.getHeaders()['x-csrf-token'];
						$.ajaxSetup({
							headers: {
								'X-CSRF-Token': this._oToken
							}
						});
						var oBusinessModel = that.getModel("ApiBusinessModel");
						oEcpModel.create("/zc_ecp_crud_operationsSet", objSub, {

							success: function (data, response) {
								console.log(response.data);
								that.getView().getModel("LocalDataModel").setProperty("/responseData", response.data);
								if (that.oECPData.ZecpIntApp.charAt(0) === "D") {
									oEcpModel.remove("/zc_ecp_crud_operationsSet(ZecpIntApp='" + that.oECPData.ZecpIntApp + "',ZecpVin='" + that.oECPData
										.ZecpVin +
										"')", {
											method: "DELETE",
											success: function (data) {
												oEcpModel.refresh();
											},
											error: function (e) {
												console.log("error");
											}
										});
								}
								var oAgr = response.data.ZecpAgrNum;
								var oCustomer = response.data.ZecpCustNum;
								oEcpModel.read("/zc_ecp_agreement", {
									urlParameters: {
										"$filter": "AgreementNumber eq '" + oAgr + "'"
									},
									success: function (ret) {
										console.log(ret);
										if (ret.results[0] && (parseInt(ret.results[0].CancelFee) === 0)) {
											ret.results[0].CancelFee = "100.00";
										}
										ret.results[0].RoadHazard = that.oBundle.getText(ret.results[0].RoadHazard); // added translation
										ret.results[0].BenefitsFlag = that.oBundle.getText(ret.results[0].BenefitsFlag); // added translation
										that.getView().getModel("LocalDataModel").setProperty("/AgreementData", ret.results[0]);

										var oDealer = ret.results[0].DealershipNumber;
										var dealerStr = ret.results[0].DealershipNumber
										ret.results[0].DealershipNumber = dealerStr.substring(dealerStr.length - 5, dealerStr.length);
										if (oDealer) {
											oBusinessModel.read("/A_BusinessPartner", {
												urlParameters: {
													"$filter": "BusinessPartner eq '" + oDealer + "'"
												},
												success: function (businessData) {
													console.log(businessData);
													that.getModel("LocalDataModel").setProperty("/DealerData", businessData.results[0]);
												}
											});
										}
									},
									error: function () {}
								});

								oBusinessModel.read("/A_BusinessPartnerAddress", {
									urlParameters: {
										"$filter": "BusinessPartner eq '" + oCustomer + "' ",
										"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress"

									},
									success: function (bData) {

										that.getModel("LocalDataModel").setProperty("/BusinessPartnerData", bData.results[0]);

									},
									error: function () {
										console.log("Error");
									}
								});

								that.printPrevDialogBox = sap.ui.xmlfragment("zecp.view.fragments.AgreementDetails", that);
								that.getView().addDependent(that.printPrevDialogBox);
								that.printPrevDialogBox.open();
								that.getView().getModel("oSetProperty").setProperty("/submitBtn", true);
							},
							error: function () {
								MessageToast.show(oBundle.getText("ApplicationIsnotSubmitted"));
								that.getView().getModel("oSetProperty").setProperty("/submitBtn", true);
							}
						});

						dialog.close();
					}
				}),

				endButton: new Button({
					text: oBundle.getText("Cancel"),
					press: function () {
						dialog.close();
						that.getView().getModel("oSetProperty").setProperty("/submitBtn", true);
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onPrintAgreement: function () {

			var oAgr = this.getView().getModel("LocalDataModel").getProperty("/AgreementData/AgreementNumber");

			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var winUrl = window.location.search;
			var userLang = navigator.language || navigator.userLanguage;
			var lanKey = 'E';
			if ((winUrl.indexOf("=fr") > -1) || (userLang == "fr")) {
				lanKey = 'F';
			}
			var w = window.open(isProxy +
				"/node/ZECP_SALES_ODATA_SERVICE_SRV/zc_ecp_agreement_printSet(AGRNUM='" + oAgr + "',LANG='" + lanKey + "')/$value",
				'_blank');
			if (w == null) {
				console.log("Error");

			}
			this.getModel("LocalDataModel").setProperty("/printBtnState", false);

		},
		onClose: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		onPressBackPress: function () {
			this.getRouter().navTo("ApplicationList");
		},
		onPressBackPressAgr: function () {
			var that = this;
			if (this.getModel("LocalDataModel").getProperty("/printBtnState") == true) {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var dialog = new Dialog({
					title: oBundle.getText("PrintAgreement"),
					type: "Message",
					content: [
						new Text({
							text: oBundle.getText("DoYouWanttoPrintAgreement"),

						})
					],
					beginButton: new Button({
						text: oBundle.getText("Yes"),
						press: $.proxy(function () {
							var oAgr = this.getView().getModel("LocalDataModel").getProperty("/AgreementData/AgreementNumber");

							var isProxy = "";
							if (window.document.domain == "localhost") {
								isProxy = "proxy";
							}
							var w = window.open(isProxy +
								"/node/ZECP_SALES_ODATA_SERVICE_SRV/zc_ecp_agreement_printSet(AGRNUM='" + oAgr + "',LANG='E')/$value",
								'_blank');
							if (w == null) {
								console.log("Error");

							}

							dialog.close();
							that.printPrevDialogBox.destroy();
							this.getRouter().navTo("ApplicationList");
						}, this)
					}),

					endButton: new Button({
						text: oBundle.getText("No"),
						press: $.proxy(function () {
							dialog.close();
							that.printPrevDialogBox.destroy();
							this.getRouter().navTo("ApplicationList");
						}, this)
					}),
					afterClose: function () {
						that.printPrevDialogBox.destroy();
						dialog.destroy();
					}
				});

				dialog.open();
			} else {
				that.printPrevDialogBox.destroy();
				this.getRouter().navTo("ApplicationList");
			}

		},
		onExit: function () {
			this.destroy();
			this.getView().unbindElement();
			this.getModel("EcpSalesModel").refresh();
			this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
			this.getView().byId("idNewECPMsgStrip").setType("None");
			this.getView().byId("idNewECPMsgStrip").destroy();
		},
		getValidPlanSet: function (oECPDataObj) {

			var oECPData = oECPDataObj.getData()
			var zEcpModel = this.getModel("EcpSalesModel");
			this._oToken = zEcpModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});

			var oCustomerNum;
			if (oECPData.ZecpCustNum) {
				oCustomerNum = oECPData.ZecpCustNum.substr(5);
			}

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var oFormatedSaleDate = oDateFormat.format(new Date(oECPData.ZecpSaleDate));
			var agreeTypeKey = this.getTypeOfAggreementKey(oECPData.ZecpAgrType);
			zEcpModel.read("/zc_ecp_valid_plansSet", {
				urlParameters: {
					"$filter": "VIN eq '" + oECPData.ZecpVin + "'and KUNNR eq '" + oCustomerNum + "'and ZECPAGRTYPE eq '" + agreeTypeKey +
						"'and ZECPSALE_DATE eq datetime'" + oFormatedSaleDate + "'",
					"$expand": "ZC_ECP_PLANOSET,ZC_PLANDEALSET,ZC_ECP_PLANSSET,ZC_RETURNSET,ZC_VEHICLESET"
				},
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/ValidPlanSetData", data.results[0].ZC_ECP_PLANSSET.results);

				}, this),
				error: function () {
					console.log("Error");
				}
			});

		},
		getCIClink: function (dealercode, vin) {

			var locationHref = window.location.href;
			var linkAddress = "";
			if (locationHref.search("dev-ecpsales") > -1 || locationHref.search("webide") > -1) {
				linkAddress = "https://b2b.sit.toyota.ca/CICWeb/customerInfo.htm?.lang=en";
			} else if (locationHref.search("qas-ecpsales") > -1) {
				linkAddress = "https://b2b.qa.toyota.ca/CICWeb/customerInfo.htm?.lang=en";
			} else if (locationHref.search("uat-ecpsales") > -1) {
				// linkAddress = "https://b2b.acpt.toyota.ca/CICWeb/customerInfo.htm?.lang=en";
				//Changed ling to QA in UAT/ Based on Defect Id:13822,10002
				linkAddress = "https://b2b.qa.toyota.ca/CICWeb/customerInfo.htm?.lang=en";
			} else if (locationHref.search("ecpsales.scp") > -1) {
				linkAddress = "https://b2b.toyota.ca/CICWeb/customerInfo.htm?.lang=en";
			}

			linkAddress = linkAddress + "&dealerCode=" + dealercode + "&vin=" + vin;
			return linkAddress;
		},
		performCIC: function () {
			var oBusinessModel = this.getModel("ApiBusinessModel");
			oBusinessModel.read("/A_BusinessPartnerAddress", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + this.getModel("LocalDataModel").getProperty("/VehicleDetails/EndCustomer") +
						"' ",
					"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress"
				},
				success: $.proxy(function (businessA) {
					this.getModel("LocalDataModel").setProperty("/OwnerData", businessA.results[0]);
					if (businessA.results != "") {
						if (businessA.results[0].to_EmailAddress.results.length > 0) {
							this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", businessA.results[0].to_EmailAddress.results[
								0].EmailAddress);
						} else {
							this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", "");
						}

						if (businessA.results[0].to_PhoneNumber.results.length > 0) {
							this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", businessA.results[0].to_PhoneNumber.results[
								0].PhoneNumber);
						} else {
							this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", "");

						}
						if (businessA.results[0].to_FaxNumber.results.length > 0) {
							this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", businessA.results[0].to_FaxNumber.results[
								0].FaxNumber);
						} else {
							this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", "");

						}
					}
				}, this),
				error: function () {
					console.log("Error");
				}
			});

			var dealerCode = this.getModel("LocalDataModel").getProperty("/currentIssueDealer");
			if (!this.oECPData) {
				this.oECPData = this.getView().getModel("EcpFieldData").getData();
			}
			var vinNo = this.oECPData.ZecpVin;
			var linkAddress = this.getCIClink(dealerCode, vinNo);
			var iframe = new sap.ui.core.HTML();
			var dialog = new Dialog({
				title: 'Perform CIC',
				contentWidth: "90%",
				contentHeight: "90%",
				resizable: true,
				content: iframe,
				beginButton: new Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);

			iframe.setContent("<iframe id='cicframe' src=" + linkAddress + " width='100%' height='750px'></iframe>");

			dialog.open();
			dialog.setBusy(true);
			document.getElementById('cicframe').onload = function () {
				dialog.setBusy(false);
			};

		}

	});

});