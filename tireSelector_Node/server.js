/*eslint no-console: 0, no-unused-vars: 0, no-undef:0*/
/*eslint-env node, es6 */

'use strict';
var https = require('https');
var port = process.env.PORT || 3000;
var xsenv = require('@sap/xsenv');
var server = require('http').createServer();
https.globalAgent.options.ca = xsenv.loadCertificates();
global.__base = __dirname + '/';

//Initialize Express App for XSA UAA and HDBEXT Middleware
var passport = require('passport');
// var xssec = require('@sap/xssec');
var xsHDBConn = require('@sap/hdbext');
var express = require('express');

//logging
var logging = require('@sap/logging');
var appContext = logging.createAppContext();

//Initialize Express App for XS UAA and HDBEXT Middleware
var app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // TODO: 

app.use(logging.expressMiddleware(appContext));

//passport and security staff 
var xsUaaServices = xsenv.getServices({ uaa: { tag: "xsuaa" } });
passport.use('JWT', new xssec.JWTStrategy(xsUaaServices.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));


//Setup Routes
var router = require('./myRouter')(app, server);

//Start the Server
server.on('request', app);
server.listen(port, function () {
	console.info(`HTTP Server: ${server.address().port}`);
});