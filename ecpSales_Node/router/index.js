/*eslint-env node, es6 */
'use strict';
module.exports = (app, server) => {
	app.use('/node', require('./routes/myNode')());
	app.use("/userDetails", require("./routes/userDetails")());
};