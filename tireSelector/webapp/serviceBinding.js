function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZMD_PRODUCT_FS_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}