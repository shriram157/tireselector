sap.ui.define(
	["sap/m/customHeader"],
	function (customHeader) {
		return customHeader.extend("zecp.controls.extCustomHeader", {
			metadata: {
				properties: {

				},
				events: {},
				aggregations: {},
				methods: {}
			},
			init: function () {

			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("myCustomClass");
				oRm.writeClasses();
				oRm.write(">");

				oRm.write("</div>");
			}
		});
	}
);