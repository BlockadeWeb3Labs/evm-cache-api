const log  = require('loglevel');
const path = require('path');
const fs   = require('fs');

function router(server, _path = "") {
	let routes = fs.readdirSync(path.join(__dirname, '/routes/' + _path));

	for (let index in routes) {
		const route = routes[index];

		let link = path.join(__dirname, '/routes/' + _path + route);
		if (fs.lstatSync(link).isDirectory()) {
			router(server, _path + route + "/");
			continue;
		}

		// Only include .js files
		if (route.indexOf('.js') !== route.length - 3) {
			log.error("Invalid route file within routes folder:", route);
			continue;
		}

		// Request the file
		const methods = require(link);

		// If the `endpoint` value is passed, use it
		// Otherwise, use the filename
		const endpoint = (methods.hasOwnProperty('endpoint')) ?
			methods.endpoint : _path + route.replace('.js', '');

		if (methods.hasOwnProperty('get')) {
			server.get('/api/' + endpoint, methods.get);
		}

		if (methods.hasOwnProperty('post')) {
			server.post('/api/' + endpoint, methods.post);
		}
	}
}

module.exports = router;
