const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const AddressQueries   = require('../../database/queries/AddressQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getContractTokenCounts(req,res) {
	let params = getParams(req);

	// Get the defaults
	let address = params.address;
	let limit   = Math.min(parseInt(params.limit, 10) || 50, 200);
	let offset  = parseInt(params.offset, 10) || 0;

	// Sanity checks
	limit  = limit > 0   ? limit  : 50;
	offset = offset >= 0 ? offset :  0;

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(AddressQueries.getContractTokenCounts(address), (result) => {
			let contractTokenCounts = [];

			for (let idx = 0; idx < result.rowCount; idx++) {
				let row = result.rows[idx];
				contractTokenCounts.push({
					...row,
					'contract' : byteaBufferToHex(row.contract),
					'address' : byteaBufferToHex(row.address),
				});
			}

			return response.send(
				res,
				response.OK,
				{ contractTokenCounts }
			);
		});
	});
}

module.exports = {
	get  : getContractTokenCounts,
	post : getContractTokenCounts
};
