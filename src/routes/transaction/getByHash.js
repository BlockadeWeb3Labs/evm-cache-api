const response           = require('../../util/response.js');
const getParams          = require('../../util/getParams.js');
const Database           = require('../../database/Database.js');
const TransactionQueries = require('../../database/queries/TransactionQueries.js');
const byteaBufferToHex   = require('../../util/byteaBufferToHex.js');

function getByHash(req,res) {
	// Get the transaction hash
	let params = getParams(req);

	// Get the defaults
	let hash = params.hash;
	if (!hash || !hash.startsWith('0x') || hash.length !== 66) {
		return response.send(
			res,
			response.FAILURE,
			{ error: "Invalid transaction hash" }
		);
	}

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(TransactionQueries.getTransactionByHash(hash), (result) => {
			Client.release();

			if (result.rowCount === 0) {
				return response.send(
					res,
					response.ERROR,
					{ "error" : "Transaction hash not found" }
				);
			}

			let tx = result.rows[0];

			tx.block_hash       = byteaBufferToHex(tx.block_hash);
			tx.hash             = byteaBufferToHex(tx.hash);
			tx.from             = byteaBufferToHex(tx.from);
			tx.to               = byteaBufferToHex(tx.to);
			tx.input            = byteaBufferToHex(tx.input);
			tx.contract_address = byteaBufferToHex(tx.contract_address);
			delete tx.v;
			delete tx.r;
			delete tx.s;

			return response.send(
				res,
				response.OK,
				{ ...tx }
			);
		});
	});
}

module.exports = {
	get  : getByHash,
	post : getByHash
};
