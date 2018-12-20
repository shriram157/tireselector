var _that;
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'tireSelector/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/model/Filter'
], function (Controller, JSONModel, ResourceModel, BaseController, MessageToast, Filter) {
	"use strict";

	return BaseController.extend("tireSelector.controller.master", {
		/* Function for Initialization of model and variables for view */
		onInit: function () {
			_that = this;
			_that.oService = "https://tireselector-xsjs.cfapps.us10.hana.ondemand.com/tireSelector/xsodata/tireSelector_SRV.xsodata";
			_that.oXSOServiceModel = new sap.ui.model.odata.v2.ODataModel(_that.oService, true);

			_that.oXSOServiceModel = _that.getOwnerComponent().getModel("XsodataModel");
			_that.oProdMarkupModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(_that.oProdMarkupModel, "ProdMarkupModel");
			console.log("XSO model data", _that.oXSOServiceModel);

			_that.oXSOServiceModel.read("/DealerMarkUp", {
				success: $.proxy(function (oData) {
					console.log("XSO data", oData);
					_that.oProdMarkupModel.setData(oData);
					_that.oProdMarkupModel.updateBindings(true);
				}, _that),
				error: function (oError) {
					console.log("Error in fetching table", oError);
				}
			});

			_that.oDealerData = {
				"attributes": [{
					"BusinessPartnerName": "Don Valley North LEXUS",
					"BusinessPartnerKey": "2400034030",
					"BusinessPartner": "2400034030",
					"BusinessPartnerType": "Z001",
					"BusinessPartnerAddress": "Address",
					"BusinessPartnerPhone": "1234567890",
					"Division": "20",
					"Attribute": "02"
				}],
				"samlAttributes": [{
					"Language": ["English", "English"],
					"UserType": ["Dealer", "Dealer"],
					"DealerCode": ["42357", "42357"]
				}],
				"legacyDealer": "42357",
				"legacyDealerName": "Don Valley North LEXUS"
			};

			_that._oDealerModel = new sap.ui.model.json.JSONModel(_that.oDealerData);
			_that.getView().setModel(_that._oDealerModel, "DealerModel");
			sap.ui.getCore().setModel(_that._oDealerModel, "DealerModel");

			_that._oViewModel = new sap.ui.model.json.JSONModel({
				busy: false,
				delay: 0,
				enableSearchBtn: false,
				enableVin: true,
				enableTireSize: false,
				enableVehicleInputs: false,
				enableTable: false
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
				_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("fr")
				});
				_that.getView().setModel(_that.oI18nModel, "i18n");
				_that.sCurrentLocale = 'FR';
			} else {
				_that.oI18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties",
					bundleLocale: ("en")
				});
				_that.getView().setModel(_that.oI18nModel, "i18n");
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

	
			// _that.oForVehicleSearchOnly.setVisible(false);
			// _that.oGlobalJSONModel.getData().FitmentData=[];
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
					SearchText: _that.oI18nModel.getResourceBundle().getText("VIN")
				}, {
					SearchText: "Vehicle Series"
				}, {
					SearchText: _that.oI18nModel.getResourceBundle().getText("TireSize")
				}]
			};

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");

			if (sLocation_conf == 0) {
				this.sPrefix = "/tireSelector-dest";
			} else {
				this.sPrefix = "";
			}

			this.nodeJsUrl = this.sPrefix + "/node";
			//for xsodata
			// this.nodeJsUrl = this.sPrefix + "/xsodata";

			_that.oSelectJSONModel.setData(_that.objList);
			_that.oSelectJSONModel.updateBindings();
			_that.oSearchOptionList.setSelectedKey(_that.oI18nModel.getResourceBundle().getText("VIN"));
			_that.oSearchOptionLabel.setText(_that.oI18nModel.getResourceBundle().getText("VIN"));

			$.ajax({
				dataType: "json",
				url: this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet?sap-client=200", //this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet",
				type: "GET",
				success: function (oDataResponse) {
					console.log("Tire Size Data", oDataResponse.d.results);
					_that.oFitmentDataModel = new JSONModel();
					_that.getView().setModel(_that.oFitmentDataModel, "FitmentDataModel");
					_that.oFitmentDataModel.setData(oDataResponse.d);
					_that.oFitmentDataModel.updateBindings();
				},
				error: function (oError) {}
			});

			// this.nodeJsUrl = "/node";
			$.ajax({
				url: this.nodeJsUrl + "/Z_VEHICLE_MASTER_SRV/zc_c_vehicle?$top=50&?sap-client=200", //this.nodeJsUrl + "/Z_VEHICLE_MASTER_SRV/zc_c_vehicle?$top=50",
				//url: this.nodeJsUrl+"/Z_VEHICLE_MASTER_SRV/zc_c_vehicle",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					_that.vindata = {
						"results": []
					};
					// vindata.results=[];
					console.log("zc_c_vehicle Data", oDataResponse);
					$.each(oDataResponse.d.results, function (i, item) {
						if (item.VehicleIdentificationNumber != "") {
							_that.vindata.results.push({
								"VIN": item.VehicleIdentificationNumber
							});
						}
					});
					console.log("_that.vindata", _that.vindata);
					_that.oGlobalJSONModel.getData().vinData = _that.vindata.results;
					_that.oGlobalJSONModel.updateBindings();
				},
				error: function (oError) {
					console.log("oError", oError);
				}
			});
			///sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields
			$.ajax({
				// url: this.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields",
				url: this.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/zc_mmfields?sap-client=200",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					console.log("zc_mmfields Data", oDataResponse);
					_that.oGlobalJSONModel.getData().vehicleSeriesData = oDataResponse.d.results;
					_that.oGlobalJSONModel.updateBindings();
				},
				error: function (oError) {
					console.log("oError", oError);
				}
			});
			//sap/opu/odata/sap/Z_VEHICLE_CATALOGUE_SRV/ZC_MODEL_DETAILS

			$.ajax({
				// url: this.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/ZC_MODEL_DETAILS",
				url: this.nodeJsUrl + "/Z_VEHICLE_CATALOGUE_SRV/ZC_MODEL_DETAILS?sap-client=200",
				type: "GET",
				dataType: "json",
				success: function (oDataResponse) {
					console.log("ZC_MODEL_DETAILS Data", oDataResponse);
					_that.oGlobalJSONModel.getData().modelDetailsData = oDataResponse.d.results;
					_that.oGlobalJSONModel.updateBindings();
				},
				error: function (oError) {
					console.log("oError", oError);
				}
			});

			_that.getRouter().attachRouteMatched(function (oEvent) {
				_that._oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					delay: 0,
					enableSearchBtn: false,
					enableVin: true,
					enableTireSize: false,
					enableVehicleInputs: false,
					enableTable: false
				});
				_that.getView().setModel(_that._oViewModel, "propertiesModel");
				if (oEvent.getParameters("arguments").name == "master") {
					_that.showResultsData();
				}
			}, _that);
		},

		handleVINSuggest: function (oEvent) {
			// var oSource = oEvent.getSource();
			var sTerm = oEvent.getParameter("suggestValue");
			// this._forhandleSuggestCallData(sTerm);
			// var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("VIN", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);

		},
		handleTireSizeSuggest: function (oEvent) {
			// var oSource = oEvent.getSource();
			var sTerm = oEvent.getParameter("suggestValue");
			// this._forhandleSuggestCallData(sTerm);
			// var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("ZtireSize", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);

		},
		/*Functions for searchOption value change*/
		onInputEntryChange: function (oEntry) {
			if (!_that.oModelSeriesCombo.getValue() || !_that.oVehicleSearchCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVehicle = _that.oVehicleSearchCombo;
				sap.ushell.components.ModelSeriesCombo = _that.oModelSeriesCombo;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onInputEntryVIN: function (oEntry) {
			// console.log("Entry input change", oEntry);
			if (!_that.oSearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVIN = _that.oSearchOptionVIN;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onInputEntryTireSize: function (oEntry) {
			// console.log("Entry input change", oEntry);
			if (!_that.oSearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionTireSize = _that.oSearchOptionTireSize;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onComboInputChange: function (oEntry) {
			// console.log("Entry input live change", oEntry);
			if (!_that.oModelSeriesCombo.getValue() || !_that.oVehicleSearchCombo.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVehicle = _that.oVehicleSearchCombo;
				sap.ushell.components.ModelSeriesCombo = _that.oModelSeriesCombo;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		onLiveChangeVIN: function (oEntry) {
			// console.log("oEntry input live change", oEntry);
			if (!_that.oSearchOptionVIN.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionVIN = _that.oSearchOptionVIN;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},
		onLiveChangeTireSize: function (oEntry) {
			// console.log("oEntry input live change", oEntry);
			if (!_that.oSearchOptionTireSize.getValue()) {
				_that._oViewModel.setProperty("/enableSearchBtn", false);
			} else {
				sap.ushell.components.SearchOptionTireSize = _that.oSearchOptionTireSize;
				_that._oViewModel.setProperty("/enableSearchBtn", true);
			}
		},

		/*Function for Change options on Search By Dropdownlist */
		changeOptionPress: function (oChangeOption) {
			_that = this;
			if (sap.ushell.components.SearchOptionTireSize !== undefined) {
				sap.ushell.components.SearchOptionTireSize = "";
			}
			if (sap.ushell.components.SearchOptionVIN !== undefined) {
				sap.ushell.components.SearchOptionVIN = "";
			}
			if (sap.ushell.components.SearchOptionVehicle !== undefined) {
				sap.ushell.components.SearchOptionVehicle = "";
				sap.ushell.components.ModelSeriesCombo = "";
			}
			sap.ushell.components.SearchOption = "";

			var selectedOption = _that.oSearchOptionList.getSelectedKey();
			_that._oViewModel.setProperty("/enableTable", false);
			_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.None);
			if (selectedOption == "Vehicle Series") {
				_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.None);
				_that.oModelSeriesCombo.setValueState(sap.ui.core.ValueState.None);
			} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
				_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
			} else {
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.None);
			}
			_that.oSearchOptionLabel.setText(selectedOption);
			if (selectedOption == "Vehicle Series") {
				_that.oVehicleSearchCombo.setValue();
				_that.oModelSeriesCombo.setValue();
				_that._oViewModel.setProperty("/enableVehicleInputs", true);
				_that._oViewModel.setProperty("/enableVin", false);
				_that._oViewModel.setProperty("/enableTireSize", false);
			} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
				_that._oViewModel.setProperty("/enableVin", true);
				_that.oSearchOptionVIN.setValue();
				_that._oViewModel.setProperty("/enableTireSize", false);
				_that._oViewModel.setProperty("/enableVehicleInputs", false);
			} else {
				_that._oViewModel.setProperty("/enableTireSize", true);
				_that.oSearchOptionTireSize.setValue();
				_that._oViewModel.setProperty("/enableVin", false);
				_that._oViewModel.setProperty("/enableVehicleInputs", false);
			}_that.oSearchOptionLabel.setText(selectedOption);
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
				} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("VIN")) {
					_that.oSearchOptionVIN.setValue();
					_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.None);
				} else if (selectedOption == _that.oI18nModel.getResourceBundle().getText("TireSize")) {
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
				var re = new RegExp("[a-zA-Z0-9]{9}[a-zA-Z0-9-]{2}[0-9]{6}");
				// var re = new RegExp("^[A-HJ-NPR-Z\\d]{9}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");
				return vin.match(re);
			}
			// debugger;
			// _that.getRouter().navTo("searchResults");
			var Searchkey = _that.oSearchOptionList.getSelectedKey();
			if ((Searchkey == _that.oI18nModel.getResourceBundle().getText("VIN") || Searchkey == "Vehicle Series") &&
				(_that.oSearchOptionTireSize.getValue() != "" || _that.oSearchOptionVIN.getValue() != "" || _that.oVehicleSearchCombo.getSelectedKey() !=
					"")) {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				if (Searchkey == "Vehicle Series") {
					// _that.oSelectJSONModel.getData().SearchOptionVal = " > [" + _that.oVehicleSearchCombo.getSelectedKey() + "] [" +_that.oModelSeriesCombo.getSelectedKey() + "]";
					// _that.oSelectJSONModel.updateBindings();
					_that.oVehicleSearchCombo.setValueState(sap.ui.core.ValueState.Success);
					_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
					// _that.getRouter().navTo("searchResults");
					_that.showResultsData();
				} else {
					if (validateVin(_that.oSearchOptionVIN.getValue())) {
						// _that.oSelectJSONModel.getData().SearchOptionVal = "";
						_that.oSearchOptionVIN.setValueState(sap.ui.core.ValueState.Success);
						// _that.oSelectJSONModel.updateBindings();
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
						// _that.getRouter().navTo("searchResults");
						_that.showResultsData();
					} else {
						_that._oViewModel.setProperty("/enableTable", false);
						_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
						_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("InvalidVIN"));
					}
				}
			} else if (Searchkey == _that.oI18nModel.getResourceBundle().getText("TireSize") && _that.oSearchOptionTireSize.getValue() !== "") {
				_that.oSearchOptionList.setValueState(sap.ui.core.ValueState.Success);
				_that.oSearchOptionTireSize.setValueState(sap.ui.core.ValueState.Success);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", false);
				// _that.getRouter().navTo("searchResultsTireNoData");
				_that.routeToTireSelect(oSearchResults);
			} else {
				_that._oViewModel.setProperty("/enableTable", false);
				_that.getView().byId("ID_ErrMsgStrip").setProperty("visible", true);
				_that.getView().byId("ID_ErrMsgStrip").setText(_that.oI18nModel.getResourceBundle().getText("ErrTSE00001"));
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

		routeToTireSelect: function (oSearchResults) {
			var oTireData = oSearchResults.getSource().getModel("FitmentDataModel").getData().results;
			for (var n = 0; n < oTireData.length; n++) {
				if (sap.ushell.components.SearchOptionTireSize.getValue() == oTireData[n].ZtireSize) {
					oTireData[n].FitmentToCharac = "";
					oTireData[n].__metadata = "";
					oTireData[n].ZtireSize = oTireData[n].ZtireSize.replace("/", "%2F");
					var oToBeRoutedTire = oTireData[n];
				}
			}
			_that.getRouter().navTo("searchResultsTireNoData", {
				tireData: JSON.stringify(oToBeRoutedTire)
			});
		},

		showResultsData: function () {
			_that._oViewModel.setProperty("/enableTable", true);
			_that.SearchResultModel = new sap.ui.model.json.JSONModel();
			_that.getView().setModel(_that.SearchResultModel, "SearchResultModel");
			var serviceURL;
			if (sap.ushell.components.SearchOptionVIN !== undefined && sap.ushell.components.SearchOptionVIN !== "") {
				if (sap.ushell.components.SearchOptionVIN.getValue() != "" || sap.ushell.components.SearchOptionVIN.getValue() !== undefined) {
					serviceURL = this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet";
				}
				else serviceURL = this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet";
			}
			else if (sap.ushell.components.ModelSeriesCombo !== undefined || sap.ushell.components.SearchOptionVehicle !== undefined) {
				serviceURL = this.nodeJsUrl + "/Z_TIRESELECTOR_SRV/ZC_FitmentSet?$filter=Zzmoyr eq '"+sap.ushell.components.ModelSeriesCombo.getValue() +"'&$format=json";
				//(Zzmoyr='" +sap.ushell.components.ModelSeriesCombo.getValue() + "',Model='',Zzsuffix='')";
			}

			$.ajax({
				dataType: "json",
				url: serviceURL,
				type: "GET",
				success: function (oData) {
					console.log("Search Result data", oData.d.results);
					_that.SearchResultModel.setData(oData.d);
					_that.SearchResultModel.updateBindings();
				},
				error: function (oError) {}
			});
		},
		navToSelectTire: function (oEvtModel) {
			var oPath = oEvtModel.getSource().getModel("SearchResultModel").getProperty(oEvtModel.getSource().getBindingContext(
				"SearchResultModel").sPath);
			oPath.__metadata = "";
			oPath.FitmentToCharac = "";
			oPath.ZtireSize = oPath.ZtireSize.replace("/", "%2F");
			_that.getRouter().navTo("searchResultsTire", {
				modelData: JSON.stringify(oPath)
			});
		},

		/*Function for Routing/Navigating from menu option as per selection */
		onMenuLinkPress: function (oLink) {
			var _oLinkPressed = oLink;
			var _oSelectedScreen = _oLinkPressed.getSource().getProperty("text");
			if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("PageTitle")) {
				_that.getRouter().navTo("");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ProductMarkups")) {
				_that.getRouter().navTo("productMarkups");
			} else if (_oSelectedScreen == _that.oI18nModel.getResourceBundle().getText("ReportError")) {
				_that.getRouter().navTo("reportError");
			}
		},

		/*Exit Function for refreshing/resetting view */
		onExit: function () {
			_that.destroy();
			_that.oGlobalJSONModel.refresh(true);
			_that.oSelectJSONModel.refresh(true);
		}
	});
});