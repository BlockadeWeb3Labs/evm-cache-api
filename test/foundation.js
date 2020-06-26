const axios = require('axios');
const assert = require('assert');

describe('Foundation', function() {

	it('Should connect and receive OK ping', function(done) {
		axios.get('http://localhost:5000/api/ping/ok').then(function(response) {
			let body = response.data;
			assert(body && typeof body === 'object');
			assert(body.hasOwnProperty('data') && body.hasOwnProperty('status'));
			assert(body.status === 200);

			assert(typeof body.data === 'object' && body.data.hasOwnProperty('msg'));
			assert(typeof body.data.msg === 'string');

			done();
		});
	});

});
