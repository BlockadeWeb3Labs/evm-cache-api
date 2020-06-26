// Core Modules
const express    = require('express');
const server     = express();
const bodyParser = require('body-parser');
const log        = require('loglevel');
const Database   = require('./database/Database.js');

// Set up configuration
const config = require('./config/config.js');

// Application-specific Code
const router = require('./router.js');

// Entry point
async function app() {

	// Server Settings
	server.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({ extended: false }));

	// Setup Routes
	router(server);

	// Accept connections
	server.listen(
		config.SERVER_PORT,
		() => log.info(`Server listening on port ${config.SERVER_PORT}`)
	);

}

module.exports = app;
