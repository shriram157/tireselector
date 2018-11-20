var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'app/toyota/tireselector/ui5_tireselector/controller/BaseController',
	'sap/m/MessageToast'
], function (Controller, JSONModel, ResourceModel, BaseController, MessageToast) {
	"use strict";

	return BaseController.extend("app.toyota.tireselector.ui5_tireselector.controller.master", {

		/* Function for Initialization of model and variables for view */
		onInit: function () {
			_that = this;

			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableSearchBtn: false,
				enableVin: true,
				enableTireSize: false,
				enableVehicleInputs: false
			});

			_that.getView().setModel(_that._oViewModel, "propertiesModel");
			
			_that.oGlobalJSONModel = new sap.ui.model.json.JSONModel();
			_that.getView().setModel(_that.oGlobalJSONModel, "GlobalJSONModel");
			// _that.oGlobalJSONModel.setData();
			_that.oGlobalJSONModel.updateBindings();
			
			_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			_that.getView().setModel(_that.oI18nModel, "i18n");

			if (window.location.search == "?language=fr") {
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				_that.getView().setModel(i18nModel, "i18n");
				_that.sCurrentLocale = 'FR';
			} else {
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				_that.getView().setModel(i18nModel, "i18n");
				_that.sCurrentLocale = 'EN';
			}

			_that.oSearchOptionList = _that.getView().byId("searchOptionList");
			_that.oForVehicleSearchOnly = _that.getView().byId("forVehicleSearchOnly");
			_that.oSearchOptionLabel = _that.getView().byId("searchOptionLabel");
			_that.oSearchOptionVIN = _that.getView().byId("searchOptionVIN");
			_that.oSearchOptionTireSize = _that.getView().byId("searchOptionTireSize");
			_that.oModelSeriesCombo = _that.getView().byId("ModelSeriesCombo");
			_that.oVehicleSearchCombo = _that.getView().byId("VehicleSearchCombo");

			sap.ushell.components.SearchOption = _that.oSearchOptionList;
			sap.ushell.components.SearchOptionVIN = _that.oSearchOptionVIN;
			sap.ushell.components.SearchOptionTireSize = _that.oSearchOptionTireSize;
			sap.ushell.components.SearchOptionVehicle = _that.oVehicleSearchCombo;
			sap.ushell.components.ModelSeriesCombo = _that.oModelSeriesCombo;

			_that.oForVehicleSearchOnly.setVisible(false);

			_that.oGlobalJSONModel.getData().modelDetailsData = [];
			_that.oGlobalJSONModel.getData().vehicleSeriesData = [];
			_that.oGlobalJSONModel.getData().vinData = [];

			/* JSON Model for the View */
			_that.oSelectJSONModel = new JSONModel();
			_that.getView().setModel(_that.oSelectJSONModel, "SelectJSONModel");
			sap.ui.getCore().setModel(_that.oSelectJSONModel, "SelectJSONModel");
			_that.oSelectJSONModel.getData().SearchOptionVal = "";
			/* Dummy JSON data */
			_that.objList = {
				"SearchOptionsList": [{
					SearchText: "VIN"
				}, {
					SearchText: "Vehicle Series"
				}, {
					SearchText: "Tire Size"
				}],
				"VehicleSeriesList": [{
					modelSeries: "Series1"
				}, {
					modelSeries: "Series2"
				}, {
					modelSeries: "Series3"
				}],
				"ModelYearList": [{
					year: "2017"
				}, {
					year: "2018"
				}, {
					year: "2019"
				}],
				"SelectModelist": [{
					"Model": "CT",
					"Package": "Package01",
					"TireSize": "195/65R15",
					"RimSize": "5.5Jx15 ET40"
				}, {
					"Model": "GS",
					"Package": "Package01",
					"TireSize": "235/50R17",
					"RimSize": "7.5Jx17 ET45"
				}, {
					"Model": "ES",
					"Package": "Package01",
					"TireSize": "215/55R17",
					"RimSize": "7Jx17 ET40"
				}, {
					"Model": "HS",
					"Package": "Package01",
					"TireSize": "215/55ZR17",
					"RimSize": "7Jx17 ET39"
				}]
			};
			_that.oSelectJSONModel.setData(_that.objList);
			_that.oSelectJSONModel.updateBindings();
			_that.oSearchOptionList.setSelectedKey(_that.oSearchOptionList.getItems()[2].getProperty("key"));
			_that.oSearchOptionLabel.setText(_that.oSearchOptionList.getItems()[2].getProperty("text"));

			// this.nodeJsUrl = "/node";
			$.ajax({
				url: "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_MASTER_SRV/zc_c_vehicle",
				//url: this.nodeJsUrl+"/Z_VEHICLE_MASTER_SRV/zc_c_vehicle",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					var vindata = {
						results: []
					};
					// vindata.results=[];
					console.log("oDataResponse", oDataResponse);
					$.each(oDataResponse.d.results, function (i, item) {
						vinData.results.push({
							"VIN": item.VehicleIdentificationNumber
						});
					});
					_that.oGlobalJSONModel.getData().vinData = vinData;
					_that.oGlobalJSONModel.updateBindings();
				},
				error: function (oError) {
					console.log("oError", oError);
				}
			});
			///sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields
			$.ajax({
				url: "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields",
				// url: this.nodeJsUrl+"/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					console.log("oDataResponseMM", oDataResponse);
					_that.oGlobalJSONModel.getData().vehicleSeriesData = oDataResponse.d.results;
					_that.oGlobalJSONModel.updateBindings();
				},
				error: function (oError) {
					console.log("oError", oError);
				}
			});
			//sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/ZC_MODEL_DETAILS

			$.ajax({
				url: "https://tcid1gwapp1.tci.internal.toyota.ca:44300/sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/ZC_MODEL_DETAILS",
				//url: this.nodeJsUrl+"/Z_VEHICLE_MASTER_SRV/zc_c_vehicle",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					console.log("oDataResponseModel", oDataResponse);
					_that.oGlobalJSONModel.getData().modelDetailsData = oDataResponse.d.results;
					_that.oGlobalJSONModel.updateBindings();
				},
				error: function (oError) {
					console.log("oError", oError);
				}
			});
		},

		// handleVINSuggest: function (oEvent) {
		// 	var oSource = oEvent.getSource();
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	this._forhandleSuggestCallData(sTerm);
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var aFilters = [];
		// 	if (sTerm) {
		// 		aFilters.push(new Filter("VIN", sap.ui.model.FilterOperator.StartsWith, sTerm));
		// 	}
		// 	oEvent.getSource().getBinding("suggestionItems").filter(aFilters);

		// },
		/*Functions for searchOption value change*/
		onInputEntryChange: function (oEntry) {
			console.log("Entry combo input change", oEntry);
			// _that.oModelSeriesCombo = _that.getView().byId("ModelSeriesCombo");
			// _that.oVehicleSearchCombo= _that.getView().byId("VehicleSearchCombo");
			if (!_that.oModelSeriesCombo.getValue() || !_that.oVehicleSearchCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onInputEntryVIN: function (oEntry) {
			console.log("Entry input change", oEntry);
			if (!_that.oSearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onInputEntryTireSize: function (oEntry) {
			console.log("Entry input change", oEntry);
			if (!_that.oSearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onComboInputChange: function (oEntry) {
			console.log("Entry input live change", oEntry);
			if (!_that.oModelSeriesCombo.getValue() || !_that.oVehicleSearchCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onLiveChangeVIN: function (oEntry) {
			console.log("oEntry input live change", oEntry);
			if (!_that.oSearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onLiveChangeTireSize: function (oEntry) {
			console.log("oEntry input live change", oEntry);
			if (!_that.oSearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		/*Function for Change options on Search By Dropdownlist */
		changeOptionPress: function (oChangeOption) {
			_that = this;
			var selectedOption = _that.oSearchOptionList.getSelectedKey();
			_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.None);
			if (selectedOption == "Vehicle Series") {
				_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.None);
				_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
			} else if (selectedOption == "VIN") {
				_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
			} else {
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
			}
			// var oSelectedSearchOption = oChangeOption.getParameter("selectedItem").getText();
			_that.oSearchOptionLabel.setText(selectedOption);
			if (selectedOption == "Vehicle Series") {
				_that.oVehicleSearchCombo.setValue();
				_that.oModelSeriesCombo.setValue();
				// _that._oViewModel.setProperty("/enableVehicleInputs", true);
				// _that._oViewModel.setProperty("/enableVin", false);
				// _that._oViewModel.setProperty("/enableTireSize", false);
				// _that._oViewModel.updateBindings();
				_that.oSearchOptionTireSize.setVisible(false);
				_that.oSearchOptionVIN.setVisible(false);
				_that.oForVehicleSearchOnly.setVisible(true);
				_that.oVehicleSearchCombo.setVisible(true);
			} else if (selectedOption == "VIN") {
				// _that._oViewModel.setProperty("/enableVin", true);
				_that.oSearchOptionVIN.setValue();
				// _that._oViewModel.setProperty("/enableTireSize", false);
				// _that._oViewModel.setProperty("/enableVehicleInputs", false);
				// _that._oViewModel.updateBindings();
				_that.oForVehicleSearchOnly.setVisible(false);
				_that.oSearchOptionTireSize.setVisible(false);
				_that.oSearchOptionVIN.setVisible(true);
				_that.oVehicleSearchCombo.setVisible(false);
			} else {
				// _that._oViewModel.setProperty("/enableTireSize", true);
				_that.oSearchOptionTireSize.setValue();
				// _that._oViewModel.setProperty("/enableVin", false);
				// _that._oViewModel.setProperty("/enableVehicleInputs", false);
				// _that._oViewModel.updateBindings();
				_that.oForVehicleSearchOnly.setVisible(false);
				_that.oSearchOptionTireSize.setVisible(true);
				_that.oSearchOptionVIN.setVisible(false);
				_that.oSearchOptionTireSize.setValue();
				_that.oVehicleSearchCombo.setVisible(false);
			}
		},

		/*Function for clearing search criteria when user clicks on Clear Search Fields */
		handleClearSearch: function () {
			var selectedOption = _that.oSearchOptionList.getSelectedKey();
			_that = this;
			if ((_that.oSearchOptionList.getSelectedKey() == "") && (_that.oSearchOptionTireSize.getValue() == "" || _that.oSearchOptionVIN.getValue() ==
					"" || (_that.oVehicleSearchCombo.getValue() ==
						"" && _that.oModelSeriesCombo.getValue() == ""))) {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Warning);
				_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Warning);
				_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Warning);
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Warning);
				_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.Warning);
				var msg = 'No values added';
				MessageToast.show(msg);
			} else {
				if (selectedOption == "Vehicle Series") {
					_that.oVehicleSearchCombo.setValue();
					_that.oModelSeriesCombo.setValue();
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.None);
					_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == "VIN") {
					_that.oSearchOptionVIN.setValue();
					_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == "Tire Size") {
					_that.oSearchOptionTireSize.setValue();
					_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
				}
				_that.oSearchOptionList.setSelectedKey();
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.None);
			}
			_that._oViewModel.setProperty("/enableSearchBtn", false);
		},

		/*Function for Routing/Navigating to search results */
		NavToSearchResults: function (oSearchResults) {
			_that = this;

			function validateVin(vin) {
				var re = new RegExp("^[A-HJ-NPR-Z\\d]{8}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");
				return vin.match(re);
			}
			// debugger;
			// _that.getRouter().navTo("searchResults");
			var Searchkey = _that.oSearchOptionList.getSelectedKey();
			if ((Searchkey == "VIN" || Searchkey == "Vehicle Series") && (_that.oSearchOptionTireSize.getValue() != "" || _that.oSearchOptionVIN
					.getValue() != "" || _that.oVehicleSearchCombo
					.getSelectedKey() !=
					"")) {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				if (Searchkey == "Vehicle Series") {
					_that.oSelectJSONModel.getData().SearchOptionVal = _that.oI18nModel.getResourceBundle().getText("SelectModel") + " > [" + _that.oVehicleSearchCombo
						.getSelectedKey() + "] [" +
						_that.oModelSeriesCombo.getSelectedKey() + "]";
					_that.oSelectJSONModel.updateBindings();
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Success);
					_that.getRouter().navTo("searchResults");
					_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
				} else {
					if (validateVin(_that.oSearchOptionVIN.getValue())) {
						_that.oSelectJSONModel.getData().SearchOptionVal = _that.oI18nModel.getResourceBundle().getText("SelectModel");
						_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Success);
						_that.oSelectJSONModel.updateBindings();
						_that.getRouter().navTo("searchResults");
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
					} else {
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
						_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
					}
				}

			} else if (Searchkey == "Tire Size" && _that.oSearchOptionTireSize.getValue() !== "") {
				_that.oSelectJSONModel.getData().SearchOptionVal = _that.oI18nModel.getResourceBundle().getText("SelectModel");
				_that.oSelectJSONModel.updateBindings();
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Success);
				_that.getRouter().navTo("searchResultsTire");
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
			} else {
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrMandatoryFields"));
				if (_that.oSearchOptionList.getSelectedKey() == "") {
					_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Error);
				} else if ((_that.oSearchOptionTireSize.getValue() == "" || _that.oSearchOptionVIN.getValue() == "") && (_that.oSearchOptionTireSize
						.getVisible() == true || _that.oSearchOptionVIN.getVisible() == true)) {
					_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Error);
					_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Error);
				} else if (_that.oVehicleSearchCombo.getSelectedKey() == "" && _that.oVehicleSearchCombo.getVisible() == true) {
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Error);
				} else if (_that.oModelSeriesCombo.getSelectedKey() == "" && _that.oModelSeriesCombo.getVisible() == true) {
					_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.Error);
				}
				_that.oSelectJSONModel.getData().SearchOptionVal = "";
				_that.oSelectJSONModel.updateBindings();
				// var msg = 'Please select search criteria';
				// MessageToast.show(msg);
			}
		},

		/*Function for Routing/Navigating from menu option as per selection */
		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_that.getRouter().navTo("Routemaster");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ReportError")) {
				_that.getRouter().navTo("reportError");
			}
		},

		/*Exit Function for refreshing/resetting view */
		onExit: function () {
			_that.destroy();
			_that.oGlobalJSONModel.refresh();
			_that.oSelectJSONModel.refresh();
		}
	});
});