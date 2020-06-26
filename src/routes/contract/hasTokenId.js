const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const ContractQueries   = require('../../database/queries/ContractQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function hasTokens(req,res) {
	let params = getParams(req);

	// Get the defaults
	let contract = params.contract;
	let id       = params.id;
	let address  = params.address;

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(ContractQueries.hasTokenId(contract, id, address), (result) => {
			let hasToken = false;

			if (result.rowCount) {
				let row = result.rows[0];

				if (parseInt(row.amount, 10) > 0) {
					hasToken = true;
				}
			}

			return response.send(
				res,
				response.OK,
				{ contract, id, address, hasToken }
			);
		});
	});
}

module.exports = {
	get  : hasTokens,
	post : hasTokens
};
