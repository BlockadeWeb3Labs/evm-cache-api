const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const AddressQueries   = require('../../database/queries/AddressQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getTokensForContract(req,res) {
	let params = getParams(req);

	// Get the defaults
	const {address, contract, limit = 10, offset = 0}  = params;
	
	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		let total = 0;
		Client.query(AddressQueries.getTokensForContractAmount(address, contract)).then(result => total = Number(result.rows[0].count));

		Client.query(AddressQueries.getTokensForContract(address, contract, Number(limit), Number(offset)), (result) => {
			Client.release();

			let contract, name, symbol;
			
			const tokens = result.rows.map((row) => {
				contract = byteaBufferToHex(row.contract);
				name = row.name;
				symbol = row.symbol;

				return {
					'id': row.id,
					'amount': row.amount,
					'token_uri': row.token_uri,
					'metadata': row.metadata
				}
			})

			return response.send(
				res,
				response.OK,
				{ contract, name, symbol, tokens, total }
			);
		});
	});
}

module.exports = {
	get  : getTokensForContract,
	post : getTokensForContract
};
