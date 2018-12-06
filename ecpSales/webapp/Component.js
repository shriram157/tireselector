sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zecp/model/models",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, Device, models, ODataModel) {
	"use strict";

	return UIComponent.extend("zecp.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createLocalDataModel(), "LocalDataModel");

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");

			var mConfig = this.getMetadata().getManifestEntry("/sap.app/dataSources/ZECP_SALES_ODATA_SERVICE_SRV");
				if (sLocation_conf == 0) {
				mConfig.uri = "/ECP_Destination" + mConfig.uri;
			} else  {
					mConfig.uri = mConfig.uri;
			}
			var oDataModel = new ODataModel(mConfig.uri, {
				useBatch: false,
				// disableHeadRequestForToken: false,
				// defaultUpdateMethod: 'PUT',
				json: true
			});

		
			this.setModel(oDataModel, "EcpSalesModel");

			var mConfig01 = this.getMetadata().getManifestEntry("/sap.app/dataSources/Z_VEHICLE_MASTER_SRV");
			if (sLocation_conf == 0) {
				mConfig01.uri = "/ECP_Destination" + mConfig01.uri;
			}
			var oDataModel01 = new ODataModel(mConfig01.uri, {
				useBatch: false,
				// disableHeadRequestForToken: true,
				// defaultUpdateMethod: 'PATCH',
				json: true
			});

			

			this.setModel(oDataModel01, "ZVehicleMasterModel");

			var mConfig02 = this.getMetadata().getManifestEntry("/sap.app/dataSources/API_BUSINESS_PARTNER");
			if (sLocation_conf == 0) {
				mConfig02.uri = "/ECP_Destination" + mConfig02.uri;
			}
			var oDataModel02 = new ODataModel(mConfig02.uri, {
				useBatch: false,
				// disableHeadRequestForToken: true,
				// defaultUpdateMethod: 'PATCH',
				json: true
			});
		
			this.setModel(oDataModel02, "ApiBusinessModel");


			// var mConfig03 = this.getMetadata().getManifestEntry("/sap.app/dataSources/ZDLR_CLAIM_SRV");
			// if (sLocation_conf == 0) {
			// 	mConfig03.uri = "/ECP_Destination" + mConfig03.uri;
			// }
			// var oDataModel03 = new ODataModel(mConfig03.uri, {
			// 	useBatch: false,
			// 	disableHeadRequestForToken: true,
			// 	defaultUpdateMethod: 'PATCH',
			// 	json: true
			// });

			
			// this.setModel(oDataModel03, "ZdrClaimModel");

		}
	});
});