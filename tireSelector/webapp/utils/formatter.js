jQuery.sap.declare("tireSelector.utils.formatter");
tireSelector.utils.formatter = {

	fnFormatCurrency: function (val) {
		sap.ui.require(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
			var oCurrencyFormat = NumberFormat.getCurrencyInstance();

			return oCurrencyFormat.format(val, "CAD"); 
			
		});
	},

	fnFormatPhone: function (val) {
		var sTrimval, position_1, position_2, addChar;
		position_1 = 4;
		position_2 = 7;
		addChar = "-";

		if (val) {
			val.toString();
			sTrimval = val.substr(5);
			var outputStr = sTrimval.substr(0, position_1) + addChar + sTrimval.substr(5, position_2) + addChar + sTrimval.substr(position_2);
			return outputStr;
			console.log(sTrimval);

		}
		return sTrimval;
	},

};