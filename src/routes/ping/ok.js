const response = require('../../util/response.js');

function ping(req,res) {
	return response.send(
		res,
		response.OK,
		{ 'msg' : 'Successful ping' }
	);
}

// Provide the same method for both GET and POST calls
//const endpoint = 'ping';
const get      = ping;
const post     = ping;

module.exports = {
	//endpoint,
	get,
	post
};
