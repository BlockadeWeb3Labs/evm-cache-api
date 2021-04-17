const response             = require('../../util/response.js');
const getParams            = require('../../util/getParams.js');
const Database             = require('../../database/Database.js');
const AssetMetadataQueries = require('../../database/queries/AssetMetadataQueries.js');

function refreshTokenMetadata(req,res) {
	let params = getParams(req);

	// Get the defaults
	let contract = params.contract;
	let id       = params.id;

	if (!contract || !id) {
		return response.send(
			res,
			response.FAILURE,
			{ success : false, error : 'Missing contract or id' }
		);
	}

	// Make sure that the email doesn't exist already
	Database.connect((Client) => {
		Client.query(AssetMetadataQueries.forceUpdateMetadata(contract, id), (result) => {
			Client.release();
			return response.send(
				res,
				response.OK,
				{ success : true }
			);
		});
	});
}

module.exports = {
	get  : refreshTokenMetadata,
	post : refreshTokenMetadata
};
