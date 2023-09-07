'use strict';

var xsenv = require('@sap/xsenv');
var async_xsjs = require('@sap/async-xsjs');

var port = process.env.PORT || 3000;
var options = xsenv.getServices({
	hana: {
		tag: 'hana-hdi',
		plan: 'hana-hdi'
	},
	xsuaa: {
		tag: 'xsuaa'
	},
	secureStore: 'secureStore'

});
async_xsjs(options).then((async_xsjs_server) => {
	async_xsjs_server.listen(port, (err) => {
		if (!err) {
			console.log('Node XS server listening on port %d', port);
		} else {
			console.log('Node XS server failed to start on port %d', port);
		}
	});
});