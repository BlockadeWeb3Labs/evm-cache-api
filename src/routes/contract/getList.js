const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const ContractQueries   = require('../../database/queries/ContractQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getList(req,res) {
	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(ContractQueries.getList(), (result) => {

			for (let idx = 0; idx < result.rowCount; idx++) {
				result.rows[idx].address = byteaBufferToHex(result.rows[idx].address);
			}

			let count = 0;
			if (result.rows && result.rows.length) {
				count = result.rows.length;
			}

			return response.send(
				res,
				response.OK,
				{ count, contracts: result.rows }
			);
		});
	});
}

module.exports = {
	get  : getList,
	post : getList
};
