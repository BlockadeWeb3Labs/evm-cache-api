const app = require('../src/server.js');
const log = require('loglevel');

before(function(done) {
	log.info("Setup server prior to tests...");

	app().then(function() {
		done();
	});
});
