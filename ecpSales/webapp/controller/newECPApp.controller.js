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

			this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
			this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._oRouteNewECP, this);
			// var oEventBus = sap.ui.getCore().getEventBus();
			// oEventBus.publish("newECPApp", "Binded", this.onSelectiDealer, this);
			this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
			this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
			this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
			this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
			this.getModel("LocalDataModel").setProperty("/printBtnState", true);
			this.getModel("LocalDataModel").setProperty("/odometerState", "None");
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

		_oRouteNewECP: function (oEvent) {
			// 			var oAgrNum = oEvent.getParameters().arguments.AgrNum;
			// 			var oAgrNum = oEvent.getParameters().arguments.AgrNum;
			// this.oViNum = oEvent.getParameters().arguments.vin;
			// this.oPlan = oEvent.getParameters().arguments.plan;
			this.oAppId = oEvent.getParameters().arguments.appId;
			// this.oAppType = oEvent.getParameters().arguments.appType;
			// this.oOdometer = oEvent.getParameters().arguments.Odometer;
			this.getModel("LocalDataModel").setProperty("/currentIssueDealer", oEvent.getParameters().arguments.ODealer);
			this.getDealer();
			if (this.oAppId != 404 && this.oAppId != undefined) {
				// this.getView().getModel("oSetProperty").setProperty("/oPlan", this.oPlan);
				// this.getView().getModel("oSetProperty").setProperty("/oOdometer", this.oOdometer);
				// this.getView().getModel("oSetProperty").setProperty("/oAppType", this.oAppType);
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
											this.getModel("LocalDataModel").setProperty("/OwnerData/EmailAddress", businessA.results[0].to_EmailAddress.results[
												0].EmailAddress);
											this.getModel("LocalDataModel").setProperty("/OwnerData/PhoneNumber", businessA.results[0].to_PhoneNumber.results[
													0]
												.PhoneNumber);
											this.getModel("LocalDataModel").setProperty("/OwnerData/FaxNumber", businessA.results[0].to_FaxNumber.results[
												0].FaxNumber);
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
								//this.getModel("LocalDataModel").setProperty("/ApplicationDetailsModel", data);
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

						oZECPModel.read("/zc_ecp_vehicle_detailSet", {
							urlParameters: {
								"$filter": "VIN eq '" + this.getModel("LocalDataModel").getProperty("/ApplicationOwnerData/VIN") + "'"
							},
							success: $.proxy(function (vedata) {

								this.getModel("LocalDataModel").setProperty("/PricingModelData", vedata.results[0]);

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
			}

			this.getView().setModel(this.EcpFieldData, "EcpFieldData");

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
				//console.log(oFilter);
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

		OnNextStep2: function () {
			this.oECPData = this.getView().getModel("EcpFieldData").getData();

			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oVin = this.getView().byId("idVinNum");
			var oVal = oVin.getValue();

			if (!($.isEmptyObject(oVal)) && oVal.length === 17) {
				var obj = {
					VHVIN: oVal,
					VGUID: "",
					VHCLE: "",
					MMSTA: "",
					SDSTA: ""
				};
				var oZECPModel = this.getModel("EcpSalesModel");
				this._oToken = oZECPModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
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
						console.log("Error");
					}
				});

				oZECPModel.read("/zc_ecp_vehicle_detailSet", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'"
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
				var oPlansArray = ["NLC46", "NTC34", "NTC94", "NTC45", "NTC46", "NTC47"];

				oZECPModel.read("/zc_ecp_agreement", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'and AgreementElectricVehicletype ne 'AGEN' "
					},
					success: $.proxy(function (data) {

						var oDataRes = data.results;

						var oResults = oDataRes.filter(function (v, i) {
							return ((v["PlanType"] == "NTC34" || v["PlanType"] == "NLC46") || v["PlanType"] == "NTC94" || v["PlanType"] == "NTC45" ||
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
									this.getView().byId("idNewECPMsgStrip").setText("ECP Sale For Foreign VINs are Not Allowed");
									this.getView().byId("idNewECPMsgStrip").setType("Error");
									this.getView().getModel("oSetProperty").setProperty("/oTab2visible", false);
									this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab1");
								} else {
									this.getModel("LocalDataModel").setProperty("/VehicleDetails", data.results[0]);
									this.oCustomer = data.results[0].EndCustomer;
									this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);

									this.getView().getModel("oSetProperty").setProperty("/oTab2visible", true);
									this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab2");
									//this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
									this.getView().byId("idNewECPMsgStrip").setType("None");
									oVin.setValueState(sap.ui.core.ValueState.None);
								}
							}, this)

						});

					}, this)
				});

			} else if ($.isEmptyObject(oVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("EnterVINNUM"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oVin.setValueState(sap.ui.core.ValueState.Error);
			} else if (oVal.length < 17) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PlsEnterValVIN"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oVin.setValueState(sap.ui.core.ValueState.Error);
			}
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
				//this.oECPData.BccAplDlrshpNum = "2400042350";
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

		OnNextStep3: function (oEvent) {

			var oOdometer = this.getView().byId("idOdoVal");
			var oOdoVal = oOdometer.getValue();
			var oSaleDateId = this.getView().byId("idDate");
			var oSaleDate = oSaleDateId.getValue();
			var zEcpModel = this.getModel("EcpSalesModel");
			this._oToken = zEcpModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			if (this.oCustomer) {
				var oCustomerNum = this.oCustomer.substr(5);
			}

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var oFormatedSaleDate = oDateFormat.format(new Date(oSaleDate));

			zEcpModel.read("/zc_ecp_valid_plansSet", {
				urlParameters: {
					"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'and KUNNR eq '" + oCustomerNum + "'and ZECPAGRTYPE eq '" + this.oECPData.ZecpAgrType +
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

					// this.getModel("LocalDataModel").setProperty("/BusinessPartnerData", data.results[0]);
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
					// 	this.oECPData.ZecpCustName = data.results[0].FullName;
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

			var oSaleDateTime = new Date(oSaleDate).getTime();

			var oCurrentDate = new Date().getTime();
			var oRegDate = new Date(this.BccAgrmntPrtDt).getTime();
			// 			console.log(oRegDate);
			this.DifferTime = (oSaleDateTime - oRegDate);

			if (this.DifferTime <= 94670778000 && oOdoVal <= 50000) {
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "Yes");
			} else if (this.DifferTime > 94670778000 || oOdoVal > 50000) {
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "No");
			}

			var oDay = this.getModel("LocalDataModel").getProperty("/PricingModelData/B_DAYS");
			var oDayMili = parseInt(oDay) * 1000 * 60 * 60 * 24;
			if (this.oECPData.ZecpAgrType === this.oBundle.getText("NEWVEHICLEAGREEMENT")) {
				if (this.DifferTime < oDayMili) {
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "Yes");
				} else if (this.DifferTime > oDayMili) {
					this.getView().getModel("EcpFieldData").setProperty("/ZbenefitFlag", "No");
				}
			}
			if (!($.isEmptyObject(oOdoVal && oAgrItem && oSaleDate)) && oSaleDateTime <= oCurrentDate && oSaleDateTime >= oRegDate && oOdoVal >
				0) {

				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				//this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().getModel("oSetProperty").setProperty("/oTab3visible", true);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				oAgr.setValueState(sap.ui.core.ValueState.None);
				oOdometer.setValueState(sap.ui.core.ValueState.None);
				oSaleDateId.setValueState(sap.ui.core.ValueState.None);
			} else if ($.isEmptyObject(oSaleDate)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleasePutDate"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
			} else if (oSaleDateTime > oCurrentDate) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectSaleDate"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
			} else if (oSaleDateTime < oRegDate) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Agreementdateislessthanvehicleregistrationdate") + "(" + new Date(
					this.BccAgrmntPrtDt).toDateString() + ")");
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
			} else if ($.isEmptyObject(oOdoVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterOdometer"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oOdometer.setValueState(sap.ui.core.ValueState.Error);
			} else if (oOdoVal <= 0) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("OdometerGreaterThan0"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oOdometer.setValueState(sap.ui.core.ValueState.Error);
			} else if ($.isEmptyObject(oAgrItem)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectAgreementType"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oAgr.setValueState(sap.ui.core.ValueState.Error);
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
				} else if (oyearGap <= 8 && oSaleDateTime < oCurrentDate) {
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

			this.oPlanCode = oEvent.getSource().getValue();
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
		OnNextStep4: function (oEvent) {
			var oPlanArray = ["NTC34", "NTC94", "NTC45", "NTC46", "NTC47", "NTF34", "NTF94", "NTF45", "NTF46", "NTF47", "CTC40", "CTC50"];

			var oSelectedPlan = this.getView().getModel("EcpFieldData").getProperty("/ZecpPlancode");

			var oidPlanCodeId = this.getView().byId("idPlanCode");
			//	console.log(this.DifferTime);
			var oidPlanCode = oidPlanCodeId.getSelectedItem();
			if (this.oECPData.ZecpAgrType === this.oBundle.getText("NEWVEHICLEAGREEMENT")) {
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
				} else if (this.oECPData.ZecpOdometer > this.oAdditionalVal) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Odometervalueexceeds") + " " +
						(this.oECPData.ZecpOdometer - this.oAdditionalVal) + this.oBundle
						.getText("KMagainstplanmilagevalue"));
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);

				} else if (this.DifferTime > this.PlanTime) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					var oTimeDiffer = this.DifferTime - this.PlanTime;

					var TotalTimeDiffer = this._fnDayHrSecond(oTimeDiffer);

					this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Planperiodexceedsby") + " " +
						TotalTimeDiffer.month + " Months : " + TotalTimeDiffer.day + " Days : " + TotalTimeDiffer.hour + " Hours : " +
						TotalTimeDiffer.minute + " Minutes ");

					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);

				}

			}

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
						this.getView().byId("idNewECPMsgStrip").setText("ECP Plan cannot be sold as it is exceeding 31 Days from RDR Date");
						this.getView().byId("idNewECPMsgStrip").setType("Error");
						oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
						this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
						this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");

					}
				}
			}

			// var DifferRegMonth = this._fnDayHrSecond(this.DifferTime);
			var oMonthDef = this.DifferTime / (1000 * 60 * 60 * 24);
			var MaxDays = parseInt(this.mxMonth) * 30;

			if (this.oECPData.ZecpAgrType === this.oBundle.getText("USEDVEHICLEAGREEMENT")) {
				this.getView().getModel("oSetProperty").setProperty("/oSurcharge", true);
				if (parseInt(this.oECPData.ZecpOdometer) < parseInt(this.mxMillage) && oMonthDef < MaxDays) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
					this.getView().byId("idNewECPMsgStrip").setType("None");
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");
				} else if (parseInt(this.oECPData.ZecpOdometer) > parseInt(this.mxMillage)) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Maximum Millage Exceeds by " + ((parseInt(this.oECPData.ZecpOdometer) - parseInt(
						this.mxMillage))));
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				} else if (oMonthDef > MaxDays) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Maximum Month Exceeds by " + (MaxDays - oMonthDef));
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				} else if (parseInt(this.oECPData.ZecpOdometer) > parseInt(this.mxMillage) && oMonthDef > MaxDays) {
					this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
					this.getView().byId("idNewECPMsgStrip").setText("Maximum Millage Exceeds by " + ((parseInt(this.oECPData.ZecpOdometer) - parseInt(
						this.mxMillage))) + "Maximum Month Exceeds by " + (MaxDays - oMonthDef));
					this.getView().byId("idNewECPMsgStrip").setType("Error");
					oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
					this.getView().getModel("oSetProperty").setProperty("/oTab4visible", false);
					this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				}
			} else {
				this.getView().getModel("oSetProperty").setProperty("/oSurcharge", false);
			}

		},
		onChangeAmt: function (oEvent) {

		},
		onChangeOdometer: function (oEvent) {
			//var oOdometer = this.getView().byId("idOdo");
			//var oOdoVal = oOdometer.getValue();
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oOdoVal = oEvent.getSource().getValue();
			if ($.isEmptyObject(oOdoVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterOdometer"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				// LocalDataModel>/odometerState
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
			} else if (oOdoVal > 50000) {
				this.getView().getModel("EcpFieldData").setProperty("/ZecpRoadhazard", "No");
			}

			// var  validPlanDataSetKm;
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
							this.oECPData.ZecpRetPrice = data.results[0].ZECP_RET_PRICE;
							this.oECPData.ZecpDefSurchrg = data.results[0].ZECP_DEF_SURCHRG;
							this.oECPData.ZecpVehSurchrgAmt = data.results[0].ZECP_VEH_SURCHRG_AMT;
							this.oECPData.ZecpListpurprice = data.results[0].ZECP_LISTPURPRICE;

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
			// debugger;
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
			// 			console.log(this.oSelectedTitle);
			var dialog = new Dialog({
				// title: that.oBundle.getText("DltECPApp"),
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
						// 		MessageToast.show(oBundle.getText("RecordDeleted"));
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
				ZecpBenefitsFlg: this.oECPData.ZecpBenefitsFlg,
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
				BccLubBnftFlg: this.oECPData.ZecpBenefitsFlg,
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
				ZbenefitFlag: this.oECPData.ZecpBenefitsFlg,
				ZecpPlanpurchprice: this.oECPData.ZecpPlanpurchprice
			};

			return crudObj;
		},
		onSaveApp: function () {
			if ($.isEmptyObject(this.oECPData.ZecpVehPrice) && $.isEmptyObject(this.oECPData.ZecpPlanpurchprice)) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "Error");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if (!$.isEmptyObject(this.oECPData.ZecpVehPrice) && $.isEmptyObject(this.oECPData.ZecpPlanpurchprice)) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if ($.isEmptyObject(this.oECPData.ZecpVehPrice) && !$.isEmptyObject(this.oECPData.ZecpPlanpurchprice)) {
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
				this.getView().byId("idNewECPMsgStrip").setText("Please Fill up all Mandatory Fields.");
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
				this.getView().byId("idNewECPMsgStrip").setText("Please Fill up all Mandatory Fields.");
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
				this.getView().byId("idNewECPMsgStrip").setText("Please Fill up all Mandatory Fields.");
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
				this.getView().byId("idNewECPMsgStrip").setText("Please Fill up all Mandatory Fields.");
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
				this.getView().byId("idNewECPMsgStrip").setText("Please Fill up all Mandatory Fields.");
			}

			// else if (this.getView().getModel("EcpFieldData").getProperty("/ZecpAmtFin") != "" && this.getView().getModel("EcpFieldData").getProperty(
			// 		"/ZecpLienterms") != "" && this.getView().getModel("EcpFieldData").getProperty(
			// 		"/ZecpLienholder") != "") {
			// 	this.getModel("LocalDataModel").setProperty("/AmtFinReq", false);
			// 	this.getModel("LocalDataModel").setProperty("/AmtFinState", "None");
			// 	this.getModel("LocalDataModel").setProperty("/ZecpLienHolderReq", false);
			// 	this.getModel("LocalDataModel").setProperty("/ZecpLienHolderState", "None");
			// 	this.getModel("LocalDataModel").setProperty("/ZecpTermsState", "None");
			// 	this.getModel("LocalDataModel").setProperty("/ZecpTermsReq", false);
			// 	this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
			// 	this.getView().byId("idNewECPMsgStrip").setType("Error");
			// 	this.getView().byId("idNewECPMsgStrip").setText("Please Fill up all Mandatory Fields.");
			// }
			else if (this.getView().byId("idNewECPMsgStrip").getProperty("visible") == false) {
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
				"ZecpLienterms": oECPData.ZecpLienterms
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
				if (aggreDmsData.CustomerName.toUpperCase() !== vechicalAgreementOwnerDetail.FirstName.toUpperCase()) {
					return false;
				}
				//checking Last Name
				if (aggreDmsData.CustomerLastName.toUpperCase() !== vechicalAgreementOwnerDetail.LastName.toUpperCase()) {
					return false;
				}
				//checking City
				if (aggreDmsData.City.toUpperCase() !== vechicalOwnerDetail.CityName.toUpperCase()) {
					return false;
				}
				//checking Province
				if (aggreDmsData.Province.toUpperCase() !== vechicalOwnerDetail.Region.toUpperCase()) {
					return false;
				}
				//checking Address
				if (aggreDmsData.Address.toUpperCase() !== vechicalOwnerDetail.StreetName.toUpperCase()) {
					return false;
				}
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
		onSubmitApp: function () {
			//this._Step04MandatoryFn();

			//Verify Address Defect_ID: 9618
			if (!this.validateAgrmtOwnrNVechOwnr()) {
				this.showSubmitValidationError();
				return;
			}

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
					text: oBundle.getText("Yes"),
					press: function () {

						that.oECPData = that.getView().getModel("EcpFieldData").getData();
						var objSub = that._fnObject("SUB", "DELETED");
						var oEcpModel = that.getModel("EcpSalesModel");
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
										that.getView().getModel("LocalDataModel").setProperty("/AgreementData", ret.results[0]);
										var oDealer = ret.results[0].DealershipNumber;
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
								// that.getRouter().navTo("ApplicationList");
								// oEcpModel.refresh();
								// MessageToast.show(oBundle.getText("ApplicationSubmitted") + that.oECPData.ZecpVin, {
								// 	duration: 6000,
								// 	animationDuration: 2000
								// });

								var oDialogBox = sap.ui.xmlfragment("zecp.view.fragments.AgreementDetails", that);
								that.getView().addDependent(oDialogBox);
								oDialogBox.open();
							},
							error: function () {
								MessageToast.show(oBundle.getText("ApplicationIsnotSubmitted"));
							}
						});

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
		onPrintAgreement: function () {
			//var oEcpModel = this.getModel("EcpSalesModel");
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
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
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
								//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
							}

							dialog.close();
							this.getRouter().navTo("ApplicationList");
						}, this)
					}),

					endButton: new Button({
						text: oBundle.getText("No"),
						press: $.proxy(function () {
							dialog.close();
							this.getRouter().navTo("ApplicationList");
						}, this)
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();
			} else {
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

			zEcpModel.read("/zc_ecp_valid_plansSet", {
				urlParameters: {
					"$filter": "VIN eq '" + oECPData.ZecpVin + "'and KUNNR eq '" + oCustomerNum + "'and ZECPAGRTYPE eq '" + oECPData.ZecpAgrType +
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

		}

	});

});