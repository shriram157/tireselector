sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"tireSelector/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("tireSelector.Component", {

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
			this.getRouter().register("router");
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//For BP model 
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");

		
			var mConfig01 = this.getMetadata().getManifestEntry("/sap.app/dataSources/API_BUSINESS_PARTNER");

			if (sLocation_conf == 0) {
				mConfig01.uri = "/tireSelector-dest" + mConfig01.uri;
			} else {

			} // facilitate local testing.

			var oDataModel01 = new sap.ui.model.odata.ODataModel(mConfig01.uri, {
				useBatch: false,
				json: true,
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});
			this.setModel(oDataModel01, "BusinessPartnerModel");
		}
	});
});