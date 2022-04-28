const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const AddressQueries   = require('../../database/queries/AddressQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getToken(req,res) {
	let params = getParams(req);

	// Get the defaults
	const {tokenId}  = params;
	
	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(AddressQueries.getToken(tokenId), (result) => {
			Client.release();

			let contract, name, symbol;
			
			const [token] = result.rows.map((row) => {
				contract = byteaBufferToHex(row.contract);
				name = row.name;
				symbol = row.symbol;

				return {
					'assetId': row.id,
					'amount': row.amount,
					'token_uri': row.token_uri,
					'metadata': row.metadata
				}
      })
      
			return response.send(
				res,
				response.OK,
				{ contract, name, symbol, token }
			);
		});
	});
}

module.exports = {
	get  : getToken
};
