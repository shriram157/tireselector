jQuery.sap.declare("zecp.utils.formatter");
zecp.utils.formatter = {
	// 	formatDate: function (value) {
	// 		jQuery.sap.require("sap.ui.core.format.DateFormat");
	// 		var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
	// 			pattern: "yyyy-MM-dd HH:mm:ss"
	// 		});
	// 		if (value) {
	// 			var formatDt = oDateFormat.format(value);
	// 			return formatDt;
	// 		} else {
	// 			return value;
	// 		}
	// 	}

	fnFormatCustomer: function (val) {
		var sTrimval;

		if (val) {
			val.toString();
			sTrimval = val.substr(5);
			//console.log(sTrimval);

		}
		return sTrimval;
	},
	fnFormatType: function (val) {
		var oNewVal;
		if (val == "ZLC001") {
			oNewVal = val.replace("ZLC001", "Co-Owner");
		} else if (val == "ZLC002") {
			oNewVal = val.replace("ZLC002", "Leaser");
		} else if (val == "ZLC003") {
			oNewVal = val.replace("ZLC003", "Lesse");
		} else if (val == "ZLC004") {
			oNewVal = val.replace("ZLC004", "Driver");
		} else if (val == "ZLC005") {
			oNewVal = val.replace("ZLC005", "Alt. Lesse");
		} else {
			oNewVal = "";
		}
		return oNewVal;
	},
	fnFormatStatusReason: function (val) {
		var oObject = {
			CWRTO: "CAN - VEHICLE WRITE OFF",
			C1: "CAN - BUYER REMORSE",
			C2: "CAN - DEAL FELL THROUGH",
			C3: "CAN - REPOSSESSION",
			C4: "CAN - RELOCATION",
			C5: "CAN - COLLISION",
			C6: "CAN - TOTAL LOSS FIRE",
			C7: "CAN - THEFT",
			C8: "CAN - CUSTOMER IRATE",
			C9: "CAN - OTHER",
			DOTHR: "DEL - OTHER REASON",
			DPLAN: "DEL - WRONG PLAN",
			DWRTO: "DEL - VEHICLE WRITE OFF",
			SCNAC: "SUS - NAME ADDRESS CHG",
			SCNDI: "SUS - CUST NAME DIFFERENT",
			SCNOV: "SUS - CUST. DISOWN VEH.",
			SCUSC: "SUS - CUSTOMER CHANGED",
			SCUSD: "SUS - CUSTOMER DECEASED",
			SCUSM: "SUS - CUSTOMER MERGED",
			SCUVT: "SUS - CUST. VIN TERM.",
			SFIRE: "SUS - FIRE",
			SINCU: "SUS- INCORRECT CUSTOMER",
			REVRT: "REVERT SEQUENCE",
			SOFSH: "SUSPEND - VEHICLE OFFSHORE",
			SOTHR: "SUS - OTHER REASON",
			SSTOL: "SUSPEND - VEHICLE STOLEN",
			SWRTO: "SUS - VEHICLE WRITEOFF"
		};
		var OnewVal;
		for (var key in oObject) {
			if(key == val){
				OnewVal = oObject[key];
			}
		}
		return OnewVal;
	}
};