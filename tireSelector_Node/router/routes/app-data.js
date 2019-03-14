/*eslint new-cap: 0, no-console: 0, no-shadow: 0, no-unused-vars: 0*/
/*eslint-env es6, node*/

"use strict";

var express = require("express");
var xsenv = require("@sap/xsenv");
module.exports = function (appContext) {
	var router = express.Router();

	router.get("/whoAmI", (req, res) => {
		var userContext = req.authInfo;
		var result = JSON.stringify({
			userContext: userContext
		});
		res.type('application/json').status(200).send(result);
	});

	// TODO Remove this API if it is not used
	router.get("/configuration", (req, res) => {
		let options = {};
		options = Object.assign(options, xsenv.getServices({
			api: {
				name: "TIRE_SELECTOR_APIM_CUPS"
			}
		}));
		res.json(options);
	});

	return router;
};