const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const AddressQueries   = require('../../database/queries/AddressQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getEventTransferOwnership(req,res) {
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
		Client.query(AddressQueries.getEventTransferOwnership(address), (result) => {
			Client.release();

			let eventTransfers = [];

			for (let idx = 0; idx < result.rowCount; idx++) {
				let row = result.rows[idx];
				eventTransfers.push({
					...row,
					'contract_address' : byteaBufferToHex(row.contract_address)
				});
			}

			return response.send(
				res,
				response.OK,
				{ eventTransfers }
			);
		});
	});
}

module.exports = {
	get  : getEventTransferOwnership,
	post : getEventTransferOwnership
};
