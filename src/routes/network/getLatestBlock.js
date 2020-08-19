const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const BlockQueries     = require('../../database/queries/BlockQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getLatestBlock(req,res) {
	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(BlockQueries.getLatestBlock(), (result) => {
			Client.release();

			if (!result || !result.rowCount) {
				return response.send(
					res,
					response.ERROR,
					{ 'error' : 'Unable to retrieve network information.' }
				);
			}

			let block = result.rows[0];
			block.hash = byteaBufferToHex(block.hash);

			return response.send(
				res,
				response.OK,
				{ block }
			);
		});
	});
}

module.exports = {
	get  : getLatestBlock,
	post : getLatestBlock
};
