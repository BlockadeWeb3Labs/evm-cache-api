const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const AddressQueries   = require('../../database/queries/AddressQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getTokensForContract(req,res) {
	let params = getParams(req);

	// Get the defaults
	let address  = params.address;
	let contract = params.contract;
	let limit    = Math.min(parseInt(params.limit, 10) || 50, 200);
	let offset   = parseInt(params.offset, 10) || 0;

	// Sanity checks
	limit  = limit > 0   ? limit  : 50;
	offset = offset >= 0 ? offset :  0;

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(AddressQueries.getTokensForContract(address, contract, limit, offset), (result) => {
			Client.release();

			let tokens = [];
			let contract, name, symbol;

			for (let idx = 0; idx < result.rowCount; idx++) {
				let row = result.rows[idx];

				contract = byteaBufferToHex(row.contract);
				name = row.name;
				symbol = row.symbol;

				if (parseInt(row.amount, 10) <= 0) {
					continue;
				}

				tokens.push({
					'id' : row.id,
					'amount' : row.amount,
					'token_uri' : row.token_uri,
					'metadata' : row.metadata
				});
			}

			return response.send(
				res,
				response.OK,
				{ contract, name, symbol, tokens }
			);
		});
	});
}

module.exports = {
	get  : getTokensForContract,
	post : getTokensForContract
};
