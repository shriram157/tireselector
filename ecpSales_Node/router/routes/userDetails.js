/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";

module.exports = function () {

	var async = require('async');
	var express = require('express');
	var request = require('request');
	var xsenv = require("@sap/xsenv");

	var auth64;

	var app = express.Router();
	var options = {};
	options = Object.assign(options, xsenv.getServices({
		api: {
			name: "ECP_SALES_APIM_CUPS"
		}
	}));

	var uname = options.api.user,
		pwd = options.api.password,
		url = options.api.host,
		APIKey = options.api.APIKey,
		client = options.api.client;

	auth64 = 'Basic ' + new Buffer(uname + ':' + pwd).toString('base64');

	var reqHeader = {
		"Authorization": auth64,
		"Content-Type": "application/json",
		"APIKey": APIKey,
		"x-csrf-token": "Fetch"
	};

	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	app.get("/currentScopesForUser", (req, res) => {

		// 		[
		//   "ecpSales!t1188.View_ECP_Application",
		//   "ecpSales!t1188.Manage_ECP_Application",
		//   "openid",
		//   "ecpSales!t1188.View_ECP_Agreement",
		//   "ecpSales!t1188.View_ECP_Claim",
		//   "ecpSales!t1188.Inquiry"
		// ]

		var parsedData = JSON.stringify(req.authInfo.userAttributes);
		var obj_data = JSON.parse(parsedData);

		let legacyDealerCode;
		try {
			legacyDealerCode = obj_data.DealerCode[0];
			var legacyDealerCodeAvailable = true;
			console.log('Dealer code from the SAML Token is', legacyDealerCodeAvailable, legacyDealerCode)
		} catch (e) {
			console.log("Dealer Code is blank or is a local testing run")
				// return;
			var legacyDealerCodeAvailable = false;
		}

		var scopeData = req.authInfo.scopes;
		var viewECPApplication = false;
		var viewECPAgreement = false;
		var inquiry = false;
		var viewEcpClaim = false;

		var sendUserData = {
			"loggedUserType": []
		};

		for (var i = 0; i < scopeData.length; i++) {

			if (scopeData[i] == "ecpSales!t1188.Manage_ECP_Application") {
				var userType = "DealerSalesUSer";
				sendUserData.loggedUserType.push(userType);

				return res.type("text/plain").status(200).send(JSON.stringify(sendUserData));
				break;
			}

			if (scopeData[i] == "ecpSales!t1188.View_ECP_Application") {
				viewECPApplication = true;
			}
			if (scopeData[i] == "ecpSales!t1188.View_ECP_Agreement") {
				viewECPAgreement = true;
			}
			if (scopeData[i] == "ecpSales!t1188.Inquiry") {
				inquiry = true;
			}
			if (scopeData[i] == "ecpSales!t1188.View_ECP_Claim") {
				viewEcpClaim = true;
			}

		}; // enf for for loop. 

		console.log('viewECPApplication', viewECPApplication);
		console.log('viewECPAgreement', viewECPAgreement);
		console.log('inquiry', inquiry);
		console.log('legacyDealerCodeAvailable', legacyDealerCodeAvailable);
		console.log('viewEcpClaim', viewEcpClaim);

		if (viewECPApplication == false && viewECPAgreement == true && inquiry == true && legacyDealerCodeAvailable == true && viewEcpClaim ==
			true) {
			// if you see scopes view ECP Claim & view ECP Agreement & inquiry with  user attribute dealer code then this is a ECP Service user. 

			var userType = "DealerServiceUser";
			sendUserData.loggedUserType.push(userType);

			return res.type("text/plain").status(200).send(JSON.stringify(sendUserData));

		}

		//if you see scopes view ecp application, view ecp claim, view ecp agreement, 
		// view inquiry with no dealer code and no zone then this is a Internal TCIUser Admin[ECP Dept]
		if (viewECPApplication == true && viewECPAgreement == true && inquiry == true && legacyDealerCodeAvailable == false && viewEcpClaim ==
			true) {
			var userType = "TCIAdminECPDept";

			sendUserData.loggedUserType.push(userType);

			return res.type("text/plain").status(200).send(JSON.stringify(sendUserData));

		}

		// if you see scopes View ECP Claim, view ECP Agreement, Inqyiry with no delaer code no zone then this is a Internal TCI User
		if (viewECPApplication == false && viewECPAgreement == true && inquiry == true && legacyDealerCodeAvailable == false && viewEcpClaim ==
			true) {
			var userType = "internalTCIUser"; //
			sendUserData.loggedUserType.push(userType);

			return res.type("text/plain").status(200).send(JSON.stringify(sendUserData));
		}

		//if you see scopes view ecp application, view ecp claim, view ecp agreement, view inquiry with no dealer code and  zone then this is a  ECP ZONE USER
		if (viewECPApplication == true && viewECPAgreement == true && inquiry == true && legacyDealerCodeAvailable == false && viewEcpClaim ==
			true) {
			var userType = "TCIZoneUser"; // TODO: the zone data right now not available. 
			sendUserData.loggedUserType.push(userType);

			return res.type("text/plain").status(200).send(JSON.stringify(sendUserData));
		}

		// var scope = `${req.authInfo.xsappname}.Manage_ECP_Application`;
		// if (req.authInfo && req.authInfo.checkScope(scope)) {
		// 	var userType = "DealerSalesUSer";
		// 	return res.type("text/plain").status(403).send("DealerSalesUSer");
		// }

		// res.type("application/json").status(200).send(JSON.stringify(req.authInfo.scopes));
	});

	// user Information to UI.
	//Security Attributes received via UserAttributes via Passport

	//the below route for local testing. 

	app.get("/attributesforlocaltesting", (req, res) => {

		var receivedData = {};

		var sendToUi = {
			"attributes": [],
			"samlAttributes": [],
			legacyDealer: "",
			legacyDealerName: ""

		};

		// ===================only for local testing - remove next deploy
		var obj_temp = {
			Language: ['English', 'English'],
			UserType: ['National', 'National'],
			DealerCode: [' ', ' ']
		};
		// console.log(req.authInfo.userAttributes);
		var parsedData = JSON.stringify(obj_temp);
		//		 console.log('After Json Stringify', parsedData);
		var obj_parsed = JSON.parse(parsedData);
		sendToUi.samlAttributes.push(obj_parsed);

		// =========================================

		//	var parsedData = JSON.stringify(req.authInfo.userAttributes);

		//	var obj = JSON.stringify(req.authInfo.userAttributes);
		//		var obj_parsed = JSON.parse(obj);
		var csrfToken;
		var obj_data = JSON.parse(parsedData);
		var csrfToken;
		var samlData = parsedData;

		//	console.log('saml data', samlData);

		//		console.log('send to ui data', sendToUi);

		let checkSAMLDetails;
		try {
			checkSAMLDetails = obj_data.DealerCode[0];
		} catch (e) {

			// return;
			var nosamlData = true;
		}
		sendToUi.samlAttributes.push(obj_parsed);

		var userType = obj_data.UserType[0];

		if (userType == 'Dealer') {
			var legacyDealer = obj_data.DealerCode[0];
		}

		//	if  usertype eq dealer then just get the details for that dealer,  otherwise get everything else

		if (userType == 'Dealer') {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$filter=SearchTerm2 eq'" + legacyDealer +
				"' &$expand=to_Customer&$format=json&?sap-client=" + client;

		} else {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$expand=to_Customer&?sap-client=" + client +
				"&$filter=(BusinessPartnerType eq 'Z001' or BusinessPartnerType eq 'Z004' or BusinessPartnerType eq 'Z005') and zstatus ne 'X' &$orderby=BusinessPartner asc";

		}

		request({
			url: url + url1,
			headers: reqHeader

		}, function (error, response, body) {

			var attributeFromSAP;
			if (!error && response.statusCode == 200) {
				csrfToken = response.headers['x-csrf-token'];

				var json = JSON.parse(body);
				// console.log(json);  // // TODO: delete it Guna

				for (var i = 0; i < json.d.results.length; i++) {

					receivedData = {};

					var BpLength = json.d.results[i].BusinessPartner.length;
					receivedData.BusinessPartnerName = json.d.results[i].OrganizationBPName1;
					receivedData.BusinessPartnerKey = json.d.results[i].BusinessPartner;
					receivedData.BusinessPartner = json.d.results[i].BusinessPartner.substring(5, BpLength);
					receivedData.BusinessPartnerType = json.d.results[i].BusinessPartnerType;
					receivedData.SearchTerm2 = json.d.results[i].SearchTerm2;

					let attributeFromSAP;
					try {
						attributeFromSAP = json.d.results[i].to_Customer.Attribute1;
					} catch (e) {

						// return;
					}

					switch (attributeFromSAP) {
					case "01":
						receivedData.Division = "10";
						receivedData.Attribute = "01"
						break;
					case "02":
						receivedData.Division = "20";
						receivedData.Attribute = "02"
						break;
					case "03":
						receivedData.Division = "Dual";
						receivedData.Attribute = "03"
						break;
					case "04":
						receivedData.Division = "10";
						receivedData.Attribute = "04"
						break;
					case "05":
						receivedData.Division = "Dual";
						receivedData.Attribute = "05"
						break;
					default:
						receivedData.Division = "10"; //  lets put that as a toyota dealer
						receivedData.Attribute = "01"

					}

					if ((receivedData.BusinessPartner == legacyDealer || receivedData.SearchTerm2 == legacyDealer) && (userType == 'Dealer')) {
						sendToUi.legacyDealer = receivedData.BusinessPartner,
							sendToUi.legacyDealerName = receivedData.BusinessPartnerName
						sendToUi.attributes.push(receivedData);
						break;
					}

					if (userType == 'Dealer') {
						continue;
					} else {
						sendToUi.attributes.push(receivedData);
					}
				}

				res.type("application/json").status(200).send(sendToUi);

			} else {

				var result = JSON.stringify(body);
				res.type('application/json').status(400).send(result);
			}
		});

	});

	app.get("/attributes", (req, res) => {
		console.log("attributes fetch started")

		var receivedData = {};

		var sendToUi = {
			"attributes": [],
			"samlAttributes": [],
			legacyDealer: "",
			legacyDealerName: ""

		};

		console.log(req.authInfo.userAttributes);
		var parsedData = JSON.stringify(req.authInfo.userAttributes);
		console.log('After Json Stringify', parsedData);

		var obj = JSON.stringify(req.authInfo.userAttributes);
		var obj_parsed = JSON.parse(obj);
		var csrfToken;
		var obj_data = JSON.parse(parsedData);
		var csrfToken;
		var samlData = parsedData;

		console.log('saml data', samlData);

		console.log('send to ui data', sendToUi);

		let checkSAMLDetails;
		try {
			checkSAMLDetails = obj_data.DealerCode[0];
		} catch (e) {
			console.log("Dealer Code is blank or is a local testing run")
				// return;
			var nosamlData = true;
		}

		sendToUi.samlAttributes.push(obj_parsed);

		console.log('after json Parse', obj_data);
		var userType = obj_data.UserType[0];

		if (userType == 'Dealer') {
			var legacyDealer = obj_data.DealerCode[0];
		}

		console.log('Dealer Number logged in and accessed parts Availability App', legacyDealer);

		//	if  usertype eq dealer then just get the details for that dealer,  otherwise get everything else

		if (userType == 'Dealer') {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$filter=SearchTerm2 eq'" + legacyDealer +
				"' &$expand=to_Customer&$format=json&?sap-client=" + client;

		} else {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$expand=to_Customer&?sap-client=" + client +
				"&$filter=(BusinessPartnerType eq 'Z001' or BusinessPartnerType eq 'Z004' or BusinessPartnerType eq 'Z005') and zstatus ne 'X' &$orderby=BusinessPartner asc";

		}
		console.log('Final url being fetched', url + url1);
		request({
			url: url + url1,
			headers: reqHeader

		}, function (error, response, body) {

			var attributeFromSAP;
			if (!error && response.statusCode == 200) {
				csrfToken = response.headers['x-csrf-token'];

				var json = JSON.parse(body);
				// console.log(json);  // // TODO: delete it Guna

				for (var i = 0; i < json.d.results.length; i++) {

					receivedData = {};

					var BpLength = json.d.results[i].BusinessPartner.length;
					receivedData.BusinessPartnerName = json.d.results[i].OrganizationBPName1;
					receivedData.BusinessPartnerKey = json.d.results[i].BusinessPartner;
					receivedData.BusinessPartner = json.d.results[i].BusinessPartner.substring(5, BpLength);
					receivedData.BusinessPartnerType = json.d.results[i].BusinessPartnerType;
					receivedData.SearchTerm2 = json.d.results[i].SearchTerm2;

					let attributeFromSAP;
					try {
						attributeFromSAP = json.d.results[i].to_Customer.Attribute1;
					} catch (e) {
						console.log("The Data is sent without Attribute value for the BP", json.d.results[i].BusinessPartner)
							// return;
					}

					switch (attributeFromSAP) {
					case "01":
						receivedData.Division = "10";
						receivedData.Attribute = "01"
						break;
					case "02":
						receivedData.Division = "20";
						receivedData.Attribute = "02"
						break;
					case "03":
						receivedData.Division = "Dual";
						receivedData.Attribute = "03"
						break;
					case "04":
						receivedData.Division = "10";
						receivedData.Attribute = "04"
						break;
					case "05":
						receivedData.Division = "Dual";
						receivedData.Attribute = "05"
						break;
					default:
						receivedData.Division = "10"; //  lets put that as a toyota dealer
						receivedData.Attribute = "01"

					}

					if ((receivedData.BusinessPartner == legacyDealer || receivedData.SearchTerm2 == legacyDealer) && (userType == 'Dealer')) {
						sendToUi.legacyDealer = receivedData.BusinessPartner,
							sendToUi.legacyDealerName = receivedData.BusinessPartnerName
						sendToUi.attributes.push(receivedData);
						break;
					}

					if (userType == 'Dealer') {
						continue;
					} else {
						sendToUi.attributes.push(receivedData);
					}
				}

				res.type("application/json").status(200).send(sendToUi);
				console.log('Results sent successfully');
			} else {

				var result = JSON.stringify(body);
				res.type('application/json').status(400).send(result);
			}
		});

	});

	return app;
};