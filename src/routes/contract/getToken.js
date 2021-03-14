const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const ContractQueries   = require('../../database/queries/ContractQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getToken(req,res) {
	let params = getParams(req);

	// Get the defaults
	let contract = params.contract;
	let id       = params.id;

	if (!contract || contract.length !== 42 || contract.indexOf('0x') !== 0) {
		return response.send(
			res,
			response.ERROR,
			{ "error" : "No contract address provided." }
		);
	}

	if (id === null || id === undefined || id === "" || id < 0) {
		return response.send(
			res,
			response.ERROR,
			{ "error" : "Invalid token ID provided." }
		);
	}

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(ContractQueries.getToken(contract, id), (result) => {
			Client.release();

			let token = {};
			if (result.rowCount) {
				token = result.rows[0];
				token.contract = byteaBufferToHex(token.contract);
			}

			return response.send(
				res,
				response.OK,
				token
			);
		});
	});
}

module.exports = {
	get  : getToken,
	post : getToken
};
