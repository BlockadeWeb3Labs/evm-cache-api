// Requirements
const log = require('loglevel');
require('dotenv').config();

// Set the default logging behavior
let DEFAULT_LOG_LEVEL;
if (process.env.LOG_LEVEL) {
	DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL;
} else if (process.env.NODE_ENV === 'production') {
	DEFAULT_LOG_LEVEL = 'info';
} else {
	DEFAULT_LOG_LEVEL = 'trace';
}
log.setDefaultLevel(DEFAULT_LOG_LEVEL);

let config = {
	// Server
	"SERVER_PORT"        : process.env.SERVER_PORT        || 5000,

	// Database
	"DB_LIMIT"           : process.env.DB_LIMIT           || 400,
	"DB_IDLE_TIMEOUT_MS" : process.env.DB_IDLE_TIMEOUT_MS || 10000,
	"DB_CONN_TIMEOUT_MS" : process.env.DB_CONN_TIMEOUT_MS || 0,
	"DB_PORT"            : process.env.DB_PORT,
	"DB_HOST"            : process.env.DB_HOST,
	"DB_NAME"            : process.env.DB_NAME,
	"DB_USER"            : process.env.DB_USER,
	"DB_PASS"            : process.env.DB_PASS,

	// Configuration
	"USE_EVM_CACHE_LEGACY" : process.env.USE_EVM_CACHE_LEGACY === 'true' || false
};

module.exports = config;
