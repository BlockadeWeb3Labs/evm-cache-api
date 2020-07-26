const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const ContractQueries   = require('../../database/queries/ContractQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getTokenHolders(req,res) {
	return response.send(
		res,
		response.NOT_IMPLEMENTED,
		{ "notice" : "Not yet available." }
	);

	let params = getParams(req);

	// Get the defaults
	let contract = params.contract;
	let limit    = Math.min(parseInt(params.limit, 10) || 50, 200);
	let offset   = parseInt(params.offset, 10) || 0;

	// Sanity checks
	limit  = limit > 0   ? limit  : 50;
	offset = offset >= 0 ? offset :  0;

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(ContractQueries.getTokenHolders(contract), (result) => {
			Client.release();

			let addresses = [];

			for (let idx = 0; idx < result.rowCount; idx++) {
				let row = result.rows[idx];

				if (parseInt(row.amount, 10) <= 0) {
					continue;
				}

				addresses.push({
					'address' : byteaBufferToHex(row.address),
					'amount' : row.amount
				});
			}

			return response.send(
				res,
				response.OK,
				{ addresses }
			);
		});
	});
}

module.exports = {
	get  : getTokenHolders,
	post : getTokenHolders
};
