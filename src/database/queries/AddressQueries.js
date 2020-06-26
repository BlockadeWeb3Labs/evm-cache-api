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
					cm.name,
					cm.symbol,
					SUM(COALESCE(eto.input, 0) - COALESCE(eto.output, 0)) AS amount
				FROM
					event_transfer_owner eto,
					contract_meta cm
				WHERE
					eto.address = $1 AND
					cm.address = eto.contract_address
				GROUP BY
					contract,
					cm.name,
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
					cm.name,
					cm.symbol,
					eto.id,
					SUM(COALESCE(eto.input, 0) - COALESCE(eto.output, 0)) AS amount
				FROM
					event_transfer_owner eto,
					contract_meta cm
				WHERE
					eto.address = $1 AND
					cm.address = eto.contract_address
				GROUP BY
					contract,
					cm.name,
					cm.symbol,
					eto.id;
			`,
			values: [
				hexToBytea(address)
			]
		}
	}
}      

module.exports = AddressQueries;
