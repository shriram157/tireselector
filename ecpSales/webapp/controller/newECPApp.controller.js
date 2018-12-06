sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	'sap/ui/model/Filter',
	"zecp/controller/BaseController",
	'sap/m/MessageBox'
], function(Button, Dialog, Label, MessageToast, Text, Filter, Controller, MessageBox) {
	"use strict";

	return Controller.extend("zecp.controller.newECPApp", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.newECPApp
		 */
		onInit: function() {
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
				oTab6visble: false,
				backToList: true,
				backPrimery: true,
				backSecondary: false,
				AgreementTable: true,
				saleDat01Visible: true,
				saleDat02Visible: false,
				oFlag: false
			});
			this.getView().setModel(oSetProperty, "oSetProperty");

			this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
			this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._oRouteNewECP, this);
		},

		// 		_fnDateFormat: function(elm) {

		// 			//console.log(oECPData.elm);
		// 			//var oDateFrom = new Date(oDateFormat.parse(elm));
		// 			//var oDateFrom = oDateFormat.format(oDateNew);
		// 			//	console.log(oDateFrom);
		// 			// 			var newDateFrom = new Date(Date.UTC(oDateNew.getFullYear(), oDateNew.getMonth(), oDateNew.getDate(), oDateNew.getHours(),
		// 			// 				oDateNew.getMinutes(), oDateNew.getSeconds(), oDateNew.getMilliseconds()));
		// 			console.log(elm.getTime());
		// 			var oNumTime = elm.getTime();

		// 			var saleTime = "\/Date(" + oNumTime + ")\/";
		// 			var oTotalTime = saleTime.replace(/\s+/g, '');
		// 			return oTotalTime;
		// 		},

		_fnDateFormat02: function(elm) {

			var oNumTime = elm.getTime();

			var saleTime = "\/Date(" + oNumTime + ")\/";

			return saleTime;
		},

		_fnDateFormat: function(elm) {
			// 			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 				pattern: "yyyy-MM-dd"
			// 			});
			// 			var saleTime = oDateFormat.format(new Date(elm));

			// 			return saleTime + "T:00:00:00";

			//var oDateFrom = new Date(oDateFormat.parse(elm));
			//var oDateFrom = oDateFormat.format(oDateNew);
			//	console.log(oDateFrom);
			// 			var newDateFrom = new Date(Date.UTC(oDateNew.getFullYear(), oDateNew.getMonth(), oDateNew.getDate(), oDateNew.getHours(),
			// 				oDateNew.getMinutes(), oDateNew.getSeconds(), oDateNew.getMilliseconds()));

			var oNumTime = elm.getTime();

			var saleTime = "\/Date(" + oNumTime + ")\/";
			//var oTotalTime = saleTime.replace(/\s+/g, '');
			return saleTime;
		},

		_oRouteNewECP: function(oEvent) {
			// 			var oAgrNum = oEvent.getParameters().arguments.AgrNum;
			this.oViNum = oEvent.getParameters().arguments.vin;
			this.oPlan = oEvent.getParameters().arguments.plan;
			this.oAppId = oEvent.getParameters().arguments.appId;
			this.oAppType = oEvent.getParameters().arguments.appType;
			this.oOdometer = oEvent.getParameters().arguments.Odometer;

			if(this.oViNum != 404 && this.oViNum != undefined) {

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
				// this.getView().byId("idSubmitBtn").setProperty("visible", false);
				// this.getView().byId("idSaveBtn").setProperty("visible", false);
				// this.getView().byId("idUpdateSavedBtn").setProperty("visible", true);
				// this.getView().byId("idUpdateSubmitBtn").setProperty("visible", true);
				//var oFragmant = sap.ui.xmlfragment("zecp.view.fragments.TabApplicationDetails");
				// this.getView().byId("idFilter04").removeAllContent();
				// this.getView().byId("idFilter04").insertContent(oFragmant);
				var oZECPModel = this.getModel("EcpSalesModel");

				oZECPModel.read("/zc_ecp_crud_operationsSet", {
					urlParameters: {
						"$filter": "ZecpVin eq '" + this.oViNum + "'and ZecpIntApp eq '" + this.oAppId + "'"
					},
					success: $.proxy(function(data) {
					
						var EcpFieldData = new sap.ui.model.json.JSONModel(data.results[0]);
						EcpFieldData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(EcpFieldData, "EcpFieldData");
						//this.getModel("LocalDataModel").setProperty("/ApplicationDetailsModel", data);
					}, this),
					error: function(err) {
						console.log(err);
					}
				});

				oZECPModel.read("/zc_ecp_planpricing_dataSet", {
					urlParameters: {
						"$filter": "MGANR eq '" + this.oPlan + "'and ODMTR eq'" + this.oOdometer + "'and VIN eq '" + this.oViNum +
							"'and ZECPAGRTYPE eq'" + this.oAppType + "'"
					},
					success: $.proxy(function(data) {
					
						this.getModel("LocalDataModel").setProperty("/oPlanPricingData", data.results[0]);

					}, this),
					error: function(err) {
						console.log(err);
					}
				});

				oZECPModel.read("/zc_ecp_application", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oViNum + "' "
					},
					success: $.proxy(function(data) {
					
						this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData", data.results[0]);

					}, this),
					error: function(err) {
						console.log(err);
					}
				});

				oZECPModel.read("/zc_ecp_vehicle_detailSet", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oViNum + "'"
					},
					success: $.proxy(function(data) {

						this.getModel("LocalDataModel").setProperty("/PricingModelData", data.results[0]);

					}, this),
					error: function() {
						console.log("Error");
					}
				});

			} else {

				this.EcpFieldData = new sap.ui.model.json.JSONModel({
					DBOperation: "",
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

				// this.getView().byId("idFilter01").setProperty("enabled", true);
				// this.getView().byId("idFilter02").setProperty("enabled", false);
				// this.getView().byId("idFilter03").setProperty("enabled", false);
				// this.getView().byId("idFilter04").setProperty("enabled", false);
				// this.getView().byId("idFilter05").setProperty("enabled", false);
				// this.getView().byId("idFilter06").setProperty("enabled", false);
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
				// this.getModel("ZVehicleMasterModel").refresh();
				// this.getView().getModel("EcpFieldData").setProperty("/", "");
				//alert("value not found");
			}

			this.getView().setModel(this.EcpFieldData, "EcpFieldData");
			// 			this.getView().byId("idAgreementDetailHeader").setTitle(this.getView().getModel("i18n").getResourceBundle().getText(
			// 				"ECPAgreementDetails") + " - " + oAgrNum);

			// var oModel = this.getOwnerComponent().getModel();
			// oModel.read(
			// 	"/zc_ecp_agreement(VIN='" + oVin + "',AgreementNumber='" + oAgrNum + "')", {

			// 		success: $.proxy(function (odata) {
			// 			this.getView().getModel("LocalDataModel").setProperty("/AgreementEnquiryDetailData", odata);
			// 			console.log(odata);
			// 		}, this),
			// 		error: function () {}
			// 	});

			// console.log(this.getOwnerComponent().getModel("LocalDataModel"));

		},
		onSelectAgrType: function(oEvent) {
			this.oSelectedAgrTypeKey = oEvent.getSource().getSelectedKey();
			var oSelectedText = this.getView().getModel("i18n").getResourceBundle().getText("EXTENSION");
			// 			if(this.oSelectedAgrTypeKey === oSelectedText) {
			// 				this.getView().byId("idExtAgrList").setProperty("visible", true);
			// 			} else {
			// 				this.getView().byId("idExtAgrList").setProperty("visible", false);
			// 			}
		},
		handleValueHelp: function(oController) {
			//debugger;
			this.inputId = oController.getParameters().id;
			//console.log(this.inputId);
			// create value help dialog
			if(!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zecp.view.fragments.VinListDialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// open value help dialog
			this._valueHelpDialog.open();
		},

		_handleValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			
			if(sValue) {
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

		_handleValueHelpClose: function(evt) {
			this.oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = this.oSelectedItem.getTitle();
			if(this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		onSelectAgrRow: function(oEvent) {
			this.oAgrTable = oEvent.getSource().getSelectedContextPaths()[0];
			var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
			
			this.oECPData.BccAplDlrshpNum = obj.DealershipNumber;

			this.getModel("LocalDataModel").setProperty("/AgreementObj", obj);

		},

		OnNextStep2: function() {
			this.oECPData = this.getView().getModel("EcpFieldData").getData();
			

			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oVin = this.getView().byId("idVinNum");
			var oVal = oVin.getValue();
			
			if(!($.isEmptyObject(oVal)) && oVal.length === 17) {
				var obj = {
					VHVIN: oVal,
					VGUID: "",
					VHCLE: "",
					MMSTA: "",
					SDSTA: ""
				};
				var oZECPModel = this.getModel("EcpSalesModel");
				// oZECPModel.create("/zc_ecp_processing_validationsSet", obj, {

				// 	success: $.proxy(function() {
				// 		console.log("success");

				// 	}, this),
				// 	error: function(err) {
				// 		console.log(err);
				// 	}
				// });
				
					oZECPModel.read("/zc_ecp_valid_plansSet", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'"
					},
					success: $.proxy(function(data) {
						this.oFlag = data.results[0].ZZEXT_FLG;
						if(this.oFlag === "YES") {
							this.getView().getModel("oSetProperty").setProperty("/oFlag", true);
						} else {
							this.getView().getModel("oSetProperty").setProperty("/oFlag", false);
						}
					}, this),
					error: function() {
						console.log("Error");
					}
				});

				oZECPModel.read("/zc_ecp_vehicle_detailSet", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'"
					},
					success: $.proxy(function(data) {

						this.getModel("LocalDataModel").setProperty("/PricingModelData", data.results[0]);

						if(data.results[0].REG_DATE != "" || data.results[0].REG_DATE != undefined) {
							this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
							this.BccAgrmntPrtDt = data.results[0].REG_DATE;

						} else {
							this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
							this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("InvalidRegistrationDate"));
							this.getView().byId("idNewECPMsgStrip").setType("Error");
						}
						this.oECPData.ZecpMake = data.results[0].MAKE;
						this.oECPData.ZecpModelcode = data.results[0].VEHICLEMODEL;
						this.oECPData.ZecpSaletype = data.results[0].ZECP_SALETYPE;

						//this.oECPData.moyr = data.results[0].ZZMOYR;
						this.oECPData.ZecpAutocode = data.results[0].ZAUTO_CODE;

					}, this),
					error: $.proxy(function() {

						var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.error(
							this.oBundle.getText("InvalidRegistrationDate"), {

								styleClass: bCompact ? "sapUiSizeCompact" : "",
								onClose: function(sAction) {
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
					success: $.proxy(function(data) {

						this.getModel("LocalDataModel").setProperty("/ApplicationOwnerData", data.results[0]);

						this.oECPData = this.getView().getModel("EcpFieldData").getData();

					}, this),
					error: function(err) {
						console.log(err);
					}
				});
				
				oZECPModel.read("/zc_ecp_agreement", {
					urlParameters: {
						"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'and AgreementStatus eq 'Active'and AgreementElectricVehicletype ne 'AGEN' "
					},
					success: $.proxy(function(data) {

						this.getModel("LocalDataModel").setProperty("/AgreementDataActive", data.results);

					}, this),
					error: function(err) {
						console.log(err);
					}
				});

				var oGetModel = this.getModel("ZVehicleMasterModel");
				oGetModel.read("/zc_c_vehicle", {

					urlParameters: {
						"$filter": "VehicleIdentificationNumber eq '" + this.oECPData.ZecpVin + "' "
					},
					success: $.proxy(function(data) {

						this.CustomerNumberLength = data.results.length;
						if(data.results.length <= 0) {

							this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
							this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("CustomerNumberNotFound"));
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

				// oZECPModel.read("/zc_ecp_agreement", {
				// 	urlParameters: {
				// 		"$filter": "VIN eq '" + this.oECPData.ZecpVin + "'"
				// 	},
				// 	success: $.proxy(function(data) {
				// 		console.log(data.results)
				// 		this.getModel("LocalDataModel").setProperty("/AgreementTableData", data.results[0]);
				// 		// 		oAgreementDate = data.results[0].AgreementEffectiveDate;
				// 		this.oECPData.BccAplDlrshpNum = data.results[0].DealershipNumber;
				// 		//this.oECPData.ZecpAppStat = data.results[0].AgreementStatus;
				// 	}, this),
				// 	error: function(err) {
				// 		console.log(err);
				// 	}
				// });

				//var that = this;
				// var dialog = new Dialog({
				// 	title: that.oBundle.getText("exECPAPPFound"),
				// 	type: "Message",
				// 	content: new Text({
				// 		text: that.oBundle.getText("ConWorkEXAPPForVehicle")
				// 	}),
				// 	beginButton: new Button({
				// 		text: that.oBundle.getText("Yes"),
				// 		press: function () {
				// 			that.getView().byId("idFilter02").setProperty("enabled", true);
				// 			that.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab2");
				// 			that.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				// 			that.getView().byId("idNewECPMsgStrip").setType("None");
				// 			dialog.close();
				// 		}
				// 	}),
				// 	endButton: new Button({
				// 		text: that.oBundle.getText("Cancel"),
				// 		press: function () {
				// 			dialog.close();
				// 		}
				// 	}),
				// 	afterClose: function () {
				// 		dialog.destroy();
				// 	}
				// });
				// dialog.open();

				//	this.getView().byId("idFilter02").setProperty("enabled", true);

			} else if($.isEmptyObject(oVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("EnterVINNUM"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oVin.setValueState(sap.ui.core.ValueState.Error);
			} else if(oVal.length < 17) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PlsEnterValVIN"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oVin.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		OnNextStep3: function(oEvent) {

			var oOdometer = this.getView().byId("idOdoVal");
			var oOdoVal = oOdometer.getValue();
			var oSaleDateId = this.getView().byId("idDate");
			var oSaleDate = oSaleDateId.getValue();
			var zEcpModel = this.getModel("EcpSalesModel");
			if(this.oCustomer) {
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
				success: $.proxy(function(data) {

					this.getModel("LocalDataModel").setProperty("/PlanValidSet", data.results[0].ZC_ECP_PLANSSET.results);
					this.kmOdometerEnd = data.results[0].ZC_ECP_PLANSSET.results[0].KMS;
					this.durationMonths = data.results[0].ZC_ECP_PLANSSET.results[0].MONTHS;
				}, this),
				error: function() {
					console.log("Error");
				}
			});
			
			var oBusinessModel = this.getModel("ApiBusinessModel");
			oBusinessModel.read("/A_BusinessPartnerAddress", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + this.oCustomer + "' ",
					"$expand": "to_PhoneNumber,to_FaxNumber,to_EmailAddress"

				},
				success: $.proxy(function(data) {

					this.getModel("LocalDataModel").setProperty("/BusinessPartnerData", data.results[0]);
					this.oECPData = this.getView().getModel("EcpFieldData").getData();
					// 	this.oECPData.ZecpCustName = data.results[0].FullName;
					if(data.results[0].BusinessPartner != undefined || data.results[0].BusinessPartner != "") {
						this.oECPData.ZecpCustNum = data.results[0].BusinessPartner;
					}
					if(data.results[0].CityName != undefined || data.results[0].CityName != "") {
						this.oECPData.ZecpCity = data.results[0].CityName;
					}
					if(data.results[0].StreetName != undefined || data.results[0].StreetName != "") {
						this.oECPData.ZecpAddress = data.results[0].StreetName;
					}
					if(data.results[0].to_EmailAddress.results.length > 0) {
						this.oECPData.ZecpEmail = data.results[0].to_EmailAddress.results[0].EmailAddress;
					} else {
						this.oECPData.ZecpEmail = "";
					}
					if(data.results[0].PostalCode != undefined || data.results[0].PostalCode != "") {
						this.oECPData.ZecpPostalcode = data.results[0].PostalCode;
					}
					if(data.results[0].Region != undefined || data.results[0].Region != "") {
						this.oECPData.ZecpProvince = data.results[0].Region;
					}
					if(data.results[0].to_PhoneNumber.results.length > 0) {
						this.oECPData.ZecpHomePhone = data.results[0].to_PhoneNumber.results[0].PhoneNumber;
					}
					if(data.results[0].to_FaxNumber.results.length > 0) {
						this.oECPData.ZecpBusPhone = data.results[0].to_FaxNumber.results[0].FaxNumber;
					}

				}, this),
				error: function() {
					console.log("Error");
				}
			});

			oBusinessModel.read("/A_BusinessPartner", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + this.oCustomer + "' "
				},
				success: $.proxy(function(data) {
					if(data.results[0].LastName != undefined || data.results[0].LastName != "") {
						this.oECPData.ZecpLastName = data.results[0].LastName;
					}
					if(data.results[0].FirstName != undefined || data.results[0].FirstName != "") {
						this.oECPData.ZecpCustName = data.results[0].FirstName;
					}
				}, this),
				error: function() {}
			});

			//var oECPData = this.getView().getModel("EcpFieldData").getData();

			// 			oGetModel.read("/zc_vehicle", {

			// 				urlParameters: {
			// 					"$select": "VehicleIdentificationNumber"
			// 				},
			// 				success: $.proxy(function (data) {
			// 					console.log(data.results);
			// 					this.getModel("LocalDataModel").setProperty("/VINNUMBERS", data);
			// 					//this.oCustomer = data.results[0].Customer;
			// 				}, this)
			// 			});
			// 			this.oGetModel.submitChanges({
			// 				groupId: "idVHGroup"
			// 			});
			var oAgr = this.getView().byId("idAgrType");
			var oAgrItem = this.getView().byId("idAgrType").getSelectedItem();

			var oSaleDateTime = new Date(oSaleDate).getTime();
			var oCurrentDate = new Date().getTime();
			var oRegDate = new Date(this.BccAgrmntPrtDt).getTime();
			// 			console.log(oRegDate);
			this.DifferTime = (oSaleDateTime - oRegDate);

			if(!($.isEmptyObject(oOdoVal && oAgrItem && oSaleDate)) && oSaleDateTime <= oCurrentDate && oSaleDateTime >= oRegDate && oOdoVal >
				0) {

				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				//this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().getModel("oSetProperty").setProperty("/oTab3visible", true);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab3");
				oAgr.setValueState(sap.ui.core.ValueState.None);
				oOdometer.setValueState(sap.ui.core.ValueState.None);
				oSaleDateId.setValueState(sap.ui.core.ValueState.None);
			} else if($.isEmptyObject(oSaleDate)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleasePutDate"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
			} else if(oSaleDateTime > oCurrentDate) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectSaleDate"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
			} else if(oSaleDateTime < oRegDate) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Agreementdateislessthanvehicleregistrationdate") + "(" + new Date(
					this.BccAgrmntPrtDt).toDateString() + ")");
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oSaleDateId.setValueState(sap.ui.core.ValueState.Error);
			} else if($.isEmptyObject(oOdoVal)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterOdometer"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oOdometer.setValueState(sap.ui.core.ValueState.Error);
			} else if(oOdoVal <= 0) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("OdometerGreaterThan0"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oOdometer.setValueState(sap.ui.core.ValueState.Error);
			} else if($.isEmptyObject(oAgrItem)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectAgreementType"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oAgr.setValueState(sap.ui.core.ValueState.Error);
			}
			// 			else if (!($.isEmptyObject(oOdoVal && oSaleDate)) && oAgr.getSelectedKey() === "v3") {
			// 				alert("enter");
			// 				this.getView().byId("idWarningText").setProperty("visible", true);
			// 				this.getView().byId("idFilter03").setProperty("enabled", true);
			// 			}
			// 			this.oFax = this.getModel("LocalDataModel").getData().BusinessPartnerData.to_FaxNumber.results[0].FaxNumber;
			// 			this.getView().byId("idFaxNum").setText(this.oFax);
		},
		onSelectPlanCode: function(oEvent) {

			this.oPlanCode = oEvent.getSource().getSelectedKey();
			this.oAdditionalText = oEvent.getSource().getSelectedItem().getAdditionalText();
			this.oAdditionalVal = parseInt(this.kmOdometerEnd.replace(/,/g, ''));
			this.oPlanMonth = parseInt(this.durationMonths);

			this.PlanTime = parseFloat(this.oPlanMonth * 30.42 * 24 * 60 * 60 * 1000).toFixed(2);

			var zEcpModel = this.getModel("EcpSalesModel");
			zEcpModel.read("/zc_ecp_planpricing_dataSet", {
				urlParameters: {
					"$filter": "MGANR eq '" + this.oPlanCode + "'and ODMTR eq'" + this.oECPData.ZecpOdometer + "'and VIN eq '" + this.oECPData.ZecpVin +
						"'and ZECPAGRTYPE eq'" + this.oECPData.ZecpAgrType + "'"
				},
				success: $.proxy(function(data) {

					this.getModel("LocalDataModel").setProperty("/oPlanPricingData", data.results[0]);
					this.oECPData.ZecpRetPrice = data.results[0].ZECP_RET_PRICE;
					this.oECPData.ZecpDefSurchrg = data.results[0].ZECP_DEF_SURCHRG;
					this.oECPData.ZecpVehSurchrgAmt = data.results[0].ZECP_VEH_SURCHRG_AMT;
					this.oECPData.ZecpListpurprice = data.results[0].ZECP_LISTPURPRICE;

				}, this),
				error: function(err) {
					console.log(err);
				}
			});
			//var oECPData = this.getView().getModel("EcpFieldData").getData();
			//var zEcpModel = this.getModel("EcpSalesModel");

			//console.log(oEvent);
		},
		_fnDayHrSecond: function(milliseconds) {
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
		OnNextStep4: function(oEvent) {
			if(this.oECPData.ZecpAgrType === this.oBundle.getText("USEDVEHICLEAGREEMENT")) {
				this.getView().getModel("oSetProperty").setProperty("/oSurcharge", true);
			} else {
				this.getView().getModel("oSetProperty").setProperty("/oSurcharge", false);
			}
			// 			var obj = {
			// 				VIN: this.oECPData.ZecpVin,
			// 				ZECPODOMETER: this.oECPData.ZecpOdometer,
			// 				PLAN: this.oECPData.ZecpPlancode,
			// 				ZECPSALE_DATE: null,
			// 				ZECPAGRTYPE: this.oECPData.ZecpAgrType,
			// 				VEHICLEMODEL: "",
			// 				ZECP_RET_PRICE: "0.00",
			// 				ZECP_DEF_SURCHRG: "0.00",
			// 				ZECP_VEH_SURCHRG_AMT: "0.00",
			// 				ZECP_LISTPURPRICE: "0.00",
			// 				ZECP_DEALCODE: "",
			// 				REG_DATE: null,
			// 				ZECP_SALETYPE: "",
			// 				ZZMOYR: "",
			// 				MAKE: "",
			// 				MGANR: "",
			// 				POSNM: "",
			// 				GAZPS: "",
			// 				GAZNA: "",
			// 				GAZAL: "",
			// 				RANGF: "",
			// 				GAZWT: "",
			// 				GAZWTI: "",
			// 				KPOSN: "",
			// 				KSCHL: "",
			// 				KAWRT: "0.00",
			// 				KBETR: "0.00",
			// 				KNUMV: ""
			// 			};

			var oidPlanCodeId = this.getView().byId("idPlanCode");
			//	console.log(this.DifferTime);
			var oidPlanCode = oidPlanCodeId.getSelectedItem();

			if(!($.isEmptyObject(oidPlanCode)) && this.oECPData.ZecpOdometer <= this.oAdditionalVal & this.DifferTime <= this.PlanTime) {

				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				this.getView().getModel("oSetProperty").setProperty("/oTab4visible", true);
				oidPlanCodeId.setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab4");

			} else if($.isEmptyObject(oidPlanCode)) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseSelectPlanCode"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);
			} else if(this.oECPData.ZecpOdometer > this.oAdditionalVal) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Odometervalueexceeds") + " " +
					(this.oECPData.ZecpOdometer - this.oAdditionalVal) + this.oBundle
					.getText("KMagainstplanmilagevalue"));
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);

			} else if(this.DifferTime > this.PlanTime) {
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				var oTimeDiffer = this.DifferTime - this.PlanTime;

				var TotalTimeDiffer = this._fnDayHrSecond(oTimeDiffer);

				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("Planperiodexceedsby") + " " +
					TotalTimeDiffer.month + " Months : " + TotalTimeDiffer.day + " Days : " + TotalTimeDiffer.hour + " Hours : " +
					TotalTimeDiffer.minute + " Minutes ");

				this.getView().byId("idNewECPMsgStrip").setType("Error");
				oidPlanCodeId.setValueState(sap.ui.core.ValueState.Error);

			}

		},
		onDelete: function() {
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
					press: function() {
						var oModel = that.getView().getModel("EcpSalesModel");

						oModel.remove("/zc_ecp_crud_operationsSet(ZecpIntApp='" + oECPData.ZecpIntApp + "',ZecpVin='" + oECPData.ZecpVin + "')", {
							method: "DELETE",
							success: function(data) {
								oModel.refresh();
								MessageToast.show(oBundle.getText("AppDeleted") + oECPData.ZecpVin);
							},
							error: function(e) {
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
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		OnBack: function() {
			this.ogetSelectedKey = this.getView().byId("idIconTabBarNoIcons").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];

			if(ogetKey > 1 && ogetKey <= 6) {
				var oSelectedNum = ogetKey - 1;
				this.getView().byId("idIconTabBarNoIcons").setSelectedKey("Tab" + oSelectedNum + "");
			} else {
				this.getModel("EcpSalesModel").refresh();

				this.getRouter().navTo("ApplicationList");

			}
		},

		OnBackSecondary: function() {
			this.getRouter().navTo("ApplicationList");
			this.getModel("EcpSalesModel").refresh();
		},
		onBackList: function() {
			var that = this;
			var dialog = new Dialog({
				title: that.oBundle.getText("SaveChanges"),
				type: "Message",
				content: new Text({
					text: that.oBundle.getText("WillYouLikeSaveChanges")
				}),

				buttons: [
					new Button({
						text: that.oBundle.getText("Yes"),
						press: function() {
							that.oECPData = that.getView().getModel("EcpFieldData").getData();
							var objSave = that._fnObject("SAVE", "PENDING");
							var oEcpModel = that.getModel("EcpSalesModel");

							oEcpModel.create("/zc_ecp_crud_operationsSet", objSave, {
								success: $.proxy(function() {

									oEcpModel.refresh();
									MessageToast.show(that.oBundle.getText("RecordSaved"));
									that.getRouter().navTo("ApplicationList");
								}, that),
								error: function() {
									console.log("error");
								}
							});

							dialog.close();
						}
					}),

					new Button({
						text: that.oBundle.getText("No"),
						press: function() {

							that.getRouter().navTo("ApplicationList");
							dialog.close();
						}
					}),
					new Button({
						text: that.oBundle.getText("Cancel"),
						press: function() {
							dialog.close();
						}
					})

				],

				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		// 		_Step04MandatoryFn: function (that) {
		// 			debugger;

		// 		},

		_fnObject: function(elm, stat) {
			var currentDate = new Date();

			var crudObj = {
				DBOperation: elm,
				ZecpIntApp: "",
				ZecpMake: this.oECPData.ZecpMake,
				ZecpAppNum: "",
				ZecpVin: this.oECPData.ZecpVin,
				ZecpAgrNum: "",
				ZecpDealcode: "2400042350",
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
				ZecpRoadhazard: "",
				ZecpBenefitsFlg: this.oECPData.ZecpBenefitsFlg,
				BccAgrmntSaleDt: this._fnDateFormat(this.oECPData.ZecpSaleDate),
				ZecpSource: "ECP",
				ZecpDatecreated: this._fnDateFormat02(currentDate),
				ZecpLastupdate: null,
				ZecpSaletype: this.oECPData.ZecpSaletype,
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
				BccAplDlrshpNum: this.oECPData.BccAplDlrshpNum,
				BccAgrStCd: "A",
				AgrStDt: this._fnDateFormat02(currentDate),
				BccAgrEvTypCd: "NEW",
				BccVoasPartNum: "",
				BccAgrmntDlrNum: this.oECPData.BccAplDlrshpNum,
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
		onSaveApp: function() {
			if($.isEmptyObject(this.oECPData.ZecpVehPrice) && $.isEmptyObject(this.oECPData.ZecpPlanpurchprice)) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "Error");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if(!$.isEmptyObject(this.oECPData.ZecpVehPrice) && $.isEmptyObject(this.oECPData.ZecpPlanpurchprice)) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "Error");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else if($.isEmptyObject(this.oECPData.ZecpVehPrice) && !$.isEmptyObject(this.oECPData.ZecpPlanpurchprice)) {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "Error");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", true);
				this.getView().byId("idNewECPMsgStrip").setType("Error");
				this.getView().byId("idNewECPMsgStrip").setText(this.oBundle.getText("PleaseEnterMandatoryFields"));
			} else {
				this.getModel("LocalDataModel").setProperty("/VehPriceState", "None");
				this.getModel("LocalDataModel").setProperty("/PlanPurchase", "None");
				this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
				this.getView().byId("idNewECPMsgStrip").setType("None");
				this.getView().byId("idNewECPMsgStrip").setText("");
			}

			this.oECPData = this.getView().getModel("EcpFieldData").getData();
			var objSave = this._fnObject("SAVE", "PENDING");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oEcpModel = this.getModel("EcpSalesModel");

			oEcpModel.create("/zc_ecp_crud_operationsSet", objSave, {
				success: $.proxy(function() {
					MessageToast.show(oBundle.getText("DraftCreated") + this.oECPData.ZecpVin);
					oEcpModel.refresh();
					this.getRouter().navTo("ApplicationList");
					this.getModel("LocalDataModel").updateBindings(true);
					this.getModel("LocalDataModel").refresh();

					//var that = this;
					// 		this.IntervalHandle = setTimeout(function() {
					// 			that.getOwnerComponent().getModel("EcpSalesModel").refresh(true);

					// 		}, 1000);

					this.getModel("EcpSalesModel").refresh(true);

				}, this),
				error: function() {

				}
			});
		},

		onUpdateSavedApp: function(oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oECPData = this.getView().getModel("EcpFieldData").getData();
			var oEcpModel = this.getModel("EcpSalesModel");
			var obj = {
				"ZecpIntApp": this.oAppId,
				"ZecpVin": this.oViNum,
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

			oEcpModel.update("/zc_ecp_crud_operationsSet(ZecpIntApp='" + this.oAppId + "',ZecpVin='" + this.oViNum +
				"')", obj, {
					 method: "PUT",
					success: $.proxy(function(response) {
						oEcpModel.refresh();
						this.getRouter().navTo("ApplicationList");
						MessageToast.show(oBundle.getText("UpdatedDataHasbeenSavedSuccessFully"));
					}, this),
					error: function() {
						MessageToast.show(oBundle.getText("PleaseTryAgainToSave"));
					}
				});
		},

		onSubmitApp: function() {
			//this._Step04MandatoryFn();
			var that = this;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var dialog = new Dialog({
				title: oBundle.getText("SubmitApp"),
				type: "Message",
				content: new Text({
					text: oBundle.getText("AreYouSureToSaveChangesSubmitApptoTCIforAgreementGeneration")
				}),
				beginButton: new Button({
					text: oBundle.getText("Yes"),
					press: function() {

						that.oECPData = that.getView().getModel("EcpFieldData").getData();
						var objSub = that._fnObject("SUB", "DELETED");
						var oEcpModel = that.getModel("EcpSalesModel");

						oEcpModel.create("/zc_ecp_crud_operationsSet", objSub, {
							success: function() {
								if(that.oECPData.ZecpIntApp.charAt(0) === "D") {
									oEcpModel.remove("/zc_ecp_crud_operationsSet(ZecpIntApp='" + that.oECPData.ZecpIntApp + "',ZecpVin='" + that.oECPData
										.ZecpVin +
										"')", {
											method: "DELETE",
											success: function(data) {
												oEcpModel.refresh();
											},
											error: function(e) {
												console.log("error");
											}
										});
								}
								that.getRouter().navTo("ApplicationList");
								oEcpModel.refresh();
								MessageToast.show(oBundle.getText("ApplicationSubmitted") + that.oECPData.ZecpVin, {
									duration: 6000,
									animationDuration: 2000
								});
							},
							error: function() {
								MessageToast.show(oBundle.getText("ApplicationIsnotSubmitted"));
							}
						});

						dialog.close();
					}
				}),
				endButton: new Button({
					text: oBundle.getText("Cancel"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onUpdateSubmitedApp: function(oEvent) {

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zecp.view.newECPApp
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zecp.view.newECPApp
		 */

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zecp.view.newECPApp
		 */
		onExit: function() {
			this.destroy();
			this.getView().unbindElement();
			this.getModel("EcpSalesModel").refresh();
			this.getView().byId("idNewECPMsgStrip").setProperty("visible", false);
			this.getView().byId("idNewECPMsgStrip").setType("None");
			this.getView().byId("idNewECPMsgStrip").destroy();
		}

	});

});