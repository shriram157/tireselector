function initModel() {
	var sUrl = "/sap/opu/odata/sap/API_BUSINESS_PARTNER/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}