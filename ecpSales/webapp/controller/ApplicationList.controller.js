sap.ui.define([
	"zecp/controller/BaseController",
	'sap/ui/core/Fragment',
	'sap/ui/model/json/JSONModel'
], function (Controller, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("zecp.controller.ApplicationList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zecp.view.ApplicationList
		 */
		onInit: function () {
			var oModelDate = new JSONModel();
			this.beforedate = new Date();

			this.priordate = new Date(new Date().setDate(this.beforedate.getDate() - 30));
			oModelDate.setData({
				dateFormatDRS1: "yyyy/MM/dd",
				dateValueDRS2: this.priordate,
				secondDateValueDRS2: this.beforedate,
				oDealer: "2400042350"
			});
			this.getView().setModel(oModelDate, "oDateModel");

			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getView().setModel(oBusinessModel, "OBusinessModel");
			this.getView().setModel(this.getOwnerComponent().getModel("EcpSalesModel"));
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("newECPApp", "Binded", this.onSelectiDealer, this);
		},

		onBeforeRendering: function () {
			this.getView().byId("idDealerCode").setSelectedKey("2400042350");
			this.getView().byId("idDealerCode").setValue("42350");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this._onObjectMatched, this);
			this.selectedDealer = this.getView().byId("idDealerCode").getSelectedKey();
			console.log(this.selectedDealer);
		},
		_onObjectMatched: function (oEvent) {
			var oEcpModel = this.getOwnerComponent().getModel("EcpSalesModel");
			this._oToken = oEcpModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var oPriorDate = oDateFormat.format(this.priordate);
			var oCurrentDate = oDateFormat.format(this.beforedate);
			if (oEvent.getParameters().name === "ApplicationList") {
				this.getOwnerComponent().getModel("EcpSalesModel").refresh();
				oEcpModel.read("/zc_ecp_application", {
					urlParameters: {
						"$filter": "SubmissionDate ge datetime'" + oPriorDate + "'and SubmissionDate le datetime'" + oCurrentDate +
							"'and DealerCode eq '" + this.selectedDealer + "'and ApplicationStatus eq 'PENDING' "
					},
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/EcpApplication", data.results);
					}, this)
				});
				// var oArr = [];
				// oEcpModel.read("/zc_ecp_application", {

				// 	success: $.proxy(function(data) {
				// 		console.log(data);
				// 		var dataRes = data.results;
				// 		for(var i = 0; i < dataRes.length; i++) {
				// 			if(oArr.indexOf(dataRes[i].VIN) < 0 && !$.isEmptyObject(dataRes[i].VIN)) {
				// 				debugger;
				// 				oArr.push(dataRes[i].VIN);
				// 			}
				// 		}
				// 		this.getModel("LocalDataModel").setProperty("/FilteredVin", oArr);
				// 	}, this)
				// });
			}
		},

		onAfterRendering: function () {

		},
		
		onSelectiDealer : function(oEvent){
			this.selectedDealer =  oEvent.getSource().getSelectedKey();
			console.log(this.selectedDealer);
		},

		OnCreateApp: function (oEvent) {
			var oval = 404;
			this.getOwnerComponent().getRouter().navTo("newECPApp", {
				vin: oval,
				plan: oval,
				appId: oval,
				appType: oval,
				Odometer: oval
			});
		},
		handleValueHelp: function (oController) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oVinRadioSelected = this.getView().byId("idVinRadio").getSelected();
			if (oVinRadioSelected) {
				this.getView().byId("idAppListMsgStrip").setProperty("visible", false);

				this.inputId = oController.getParameters().id;

				if (!this._valueHelpDialog) {
					this._valueHelpDialog = sap.ui.xmlfragment(
						"zecp.view.fragments.VinDialogForApplist",
						this
					);
					this.getView().addDependent(this._valueHelpDialog);
				}

				this._valueHelpDialog.open();
			} else {
				this.getView().byId("idAppListMsgStrip").setProperty("visible", true);
				this.getView().byId("idAppListMsgStrip").setType("Error");
				this.getView().byId("idAppListMsgStrip").setText(this.oBundle.getText("PleaseSelectRadioButtonForVIN"));
			}
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new sap.ui.model.Filter(
					"VIN",
					sap.ui.model.FilterOperator.Contains, sValue
				);

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
		OnSearchApplication: function () {

			var oDateRadioSelected = this.getView().byId("idDateRadio").getSelected();
			var oVinRadioSelected = this.getView().byId("idVinRadio").getSelected();
			var oEcpModel = this.getOwnerComponent().getModel("EcpSalesModel");
			this._oToken = oEcpModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			var oDealerCode = this.getView().byId("idDealerCode").getSelectedKey();

			if (oDateRadioSelected && !oVinRadioSelected) {

				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
				});

				var sQuery = this.getView().byId("idSubmissionDate").getValue();

				var odateFrom = sQuery.split("-")[0];
				var odateTo = sQuery.split("-")[1];
				var odateToRe = odateTo.toString().split(" ");
				odateToRe.splice(4, 1, "23:59:60");
				var oDateToFinal = odateToRe.join(" ");
				//console.log(odateFrom, oDateToFinal);
				var RangeDateFrom = oDateFormat.format(new Date(odateFrom));
				var RangeDateTo = oDateFormat.format(new Date(oDateToFinal));

				if (!$.isEmptyObject(sQuery)) {

					oEcpModel.read("/zc_ecp_application", {
						urlParameters: {
							"$filter": "SubmissionDate ge datetime'" + RangeDateFrom +
								"'and SubmissionDate le datetime'" + RangeDateTo +
								"'and DealerCode eq '" + oDealerCode + "'and ApplicationStatus eq 'PENDING' "

						},
						success: $.proxy(function (data) {

							this.getModel("LocalDataModel").setProperty("/EcpApplication", data.results);
						}, this)
					});
				}

			} else if (!oDateRadioSelected && oVinRadioSelected) {
				var sQuery02 = this.getView().byId("idVin").getValue();
				//	console.log(sQuery);
				if (!$.isEmptyObject(sQuery02)) {
					oEcpModel.read("/zc_ecp_application", {
						urlParameters: {
							"$filter": "VIN eq'" + sQuery02 +

								"'and DealerCode eq '" + oDealerCode + "'and ApplicationStatus eq 'PENDING' "

						},
						success: $.proxy(function (data) {

							this.getModel("LocalDataModel").setProperty("/EcpApplication", data.results);
						}, this)
					});

				}
			}
		},

		onSelectionChange: function (oEvent) {
			var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(oEvent.getSource().getSelectedContextPaths()[0]);

			this.getOwnerComponent().getRouter().navTo("newECPApp", {
				vin: obj.VIN,
				plan: obj.ECPPlanCode,
				appId: obj.InternalApplicationID,
				appType: obj.AgreementType,
				Odometer: obj.Odometer
			});
			this.getView().byId("idApplicationTable").removeSelections("true");
			this.getModel("EcpSalesModel").refresh();
		},

		onExit: function () {
			this.destroy();
			this.getModel("EcpSalesModel").refresh();
		}

	});

});