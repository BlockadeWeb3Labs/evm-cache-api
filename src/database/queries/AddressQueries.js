const hexToBytea = require('../../util/hexToBytea.js');

class AddressQueries {
	static getEventTransferOwnership(
		address
	) {
		return {
			text: `
				SELECT
					*
				FROM
					event_transfer_owner
				WHERE
					address = $1
				LIMIT
					1;
			`,
			values: [
				hexToBytea(address)
			]
		}
	}

	static getContractTokenCounts(
		address
	) {
		return {
			text: `
				SELECT
					eto.contract_address AS contract,
					COALESCE(cm.name, cm.custom_name, NULL) AS name,
					cm.symbol,
					SUM(GREATEST(COALESCE(eto.input, 0) - COALESCE(eto.output, 0), 0)) AS amount
				FROM
					event_transfer_owner eto,
					contract_meta cm
				WHERE
					eto.address = $1 AND
					cm.address = eto.contract_address
				GROUP BY
					contract,
					cm.name,
					cm.custom_name,
					cm.symbol,
					eto.address;
			`,
			values: [
				hexToBytea(address)
			]
		}
	}

	static getTokens(
		address
	) {
		return {
			text: `
				SELECT
					eto.contract_address AS contract,
					COALESCE(cm.name, cm.custom_name, NULL) AS name,
					cm.symbol,
					eto.id,
					SUM(COALESCE(eto.input, 0) - COALESCE(eto.output, 0)) AS amount,
					am.token_uri,
					am.metadata
				FROM
					event_transfer_owner eto
				JOIN
					contract_meta cm ON cm.address = eto.contract_address
				LEFT JOIN
					asset_metadata am ON
						am.contract_address = eto.contract_address AND
						am.id = eto.id
				WHERE
					eto.address = $1
				GROUP BY
					contract,
					cm.name,
					cm.custom_name,
					cm.symbol,
					eto.id,
					am.token_uri,
					am.metadata;
			`,
			values: [
				hexToBytea(address)
			]
		}
	}

	static getTokensForContract(
		address,
		contract,
		limit,
		offset
	) {
		return {
			text: `
				SELECT
					eto.contract_address AS contract,
					COALESCE(cm.name, cm.custom_name, NULL) AS name,
					cm.symbol,
					eto.id,
					SUM(COALESCE(eto.input, 0) - COALESCE(eto.output, 0)) AS amount,
					am.token_uri,
					am.metadata
				FROM
					event_transfer_owner eto
				JOIN
					contract_meta cm ON cm.address = eto.contract_address
				LEFT JOIN
					asset_metadata am ON
						am.contract_address = eto.contract_address AND
						am.id = eto.id
				WHERE
					eto.address = $1 AND
					cm.address = $2 AND
					COALESCE(eto.input, 0) > COALESCE(eto.output, 0)
				GROUP BY
					contract,
					cm.name,
					cm.custom_name,
					cm.symbol,
					eto.id,
					am.token_uri,
					am.metadata
				ORDER BY
					eto.id ASC
				LIMIT
					$3
				OFFSET
					$4
			`,
			values: [
				hexToBytea(address),
				hexToBytea(contract),
				limit,
				offset
			]
		}
	}

	static getTokensForContractAmount(
		address,
		contract,
	) {
		return {
			text: `
				SELECT
					COUNT(*)
				FROM
					event_transfer_owner eto
				WHERE
					eto.address = $1 AND
					eto.contract_address = $2 AND
					COALESCE(eto.input, 0) > COALESCE(eto.output, 0);
			`,
			values: [
				hexToBytea(address),
				hexToBytea(contract),
			]
		}
	}
}      

module.exports = AddressQueries;
