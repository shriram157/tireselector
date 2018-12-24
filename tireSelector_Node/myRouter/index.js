/*eslint-env node, es6 */
'use strict';
module.exports = (app, server) => {
	app.use('/node', require('./myRoutes/myNode')());
	app.use('/appdata', require('./myRoutes/env')());

};
