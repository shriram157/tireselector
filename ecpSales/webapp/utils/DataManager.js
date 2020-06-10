sap.ui.define([], function () {
	"use strict";
	return {
		_validateInput: function (oInput) {
			var oBinding = oInput.getBinding("value");
			var sValueState = "None";
			var bValidationError = false;

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}
			if (oInput.getValue() == "" && oInput.mProperties.required == true) {
				sValueState = "Error";
				bValidationError = true;
			}
			oInput.setValueState(sValueState);

			return bValidationError;
		},
		fnDateModel: function (elm) {
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(2018, 1, 1),
				secondDateValueDRS2: new Date(),
				dateCurrent: new Date(),
				enableVin : true,
				editPlan : true,
				editAgrType : true
			});
			return elm.getView().setModel(oDateModel, "DateModel");
		},
		funECPBlankObj : function(elm){
				elm.EcpFieldData = new sap.ui.model.json.JSONModel({
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
					ZretailPrice: "",
					ZecpRoadhazard1: "",
					ZbenefitFlag1: "", //Added new entity for translation
					ZecpPlanpurchprice: ""

				});
				elm.EcpFieldData.setDefaultBindingMode("TwoWay");
				elm.getView().setModel(elm.EcpFieldData, "EcpFieldData");
		}
	};

});