const response         = require('../../util/response.js');
const getParams        = require('../../util/getParams.js');
const Database         = require('../../database/Database.js');
const ContractQueries   = require('../../database/queries/ContractQueries.js');
const byteaBufferToHex = require('../../util/byteaBufferToHex.js');

function getEvents(req,res) {
	let params = getParams(req);

	// Get the defaults
	let contract    = params.contract;
	let order       = params.hasOwnProperty('order') && params.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
	let limit       = params.hasOwnProperty('limit')       ? Math.min(parseInt(params.limit, 10) || 50, 200) : 50;
	let offset      = params.hasOwnProperty('offset')      ? parseInt(params.offset, 10)                     : 0;
	let start_block = params.hasOwnProperty('start_block') ? parseInt(params.start_block, 10)                : null;
	let end_block   = params.hasOwnProperty('end_block')   ? parseInt(params.end_block, 10)                  : null;

	let show_topics = params.hasOwnProperty('show_topics') ? !!params.show_topics : false;

	// Sanity checks
	limit  = limit > 0   ? limit  : 50;
	offset = offset >= 0 ? offset :  0;

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(ContractQueries.getEvents(
			contract, order, limit, offset, start_block, end_block
		), (result) => {
			Client.release();

			// Clean or parse results
			for (let row of result.rows) {
				row.transaction_hash = byteaBufferToHex(row.transaction_hash);
				if (show_topics) {
					row.topic_0 = byteaBufferToHex(row.topic_0);
					row.topic_1 = byteaBufferToHex(row.topic_1);
					row.topic_2 = byteaBufferToHex(row.topic_2);
					row.topic_3 = byteaBufferToHex(row.topic_3);
				} else {
					delete row.topic_0;
					delete row.topic_1;
					delete row.topic_2;
					delete row.topic_3;
				}
			}

			return response.send(
				res,
				response.OK,
				{ 'rows' : result.rows }
			);
		});
	});
}

module.exports = {
	get  : getEvents,
	post : getEvents
};
