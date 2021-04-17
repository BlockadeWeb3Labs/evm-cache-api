const hexToBytea = require('../../util/hexToBytea.js');

class AssetMetadataQueries {
	static forceUpdateMetadata(
		contract_address,
		id
	) {
		return {
			text: `
				UPDATE
					asset_metadata
				SET
					needs_update = true
				WHERE
					contract_address = $1 AND
					id = $2;
			`,
			values: [
				hexToBytea(contract_address),
				id
			]
		}
	}
}

module.exports = AssetMetadataQueries;
