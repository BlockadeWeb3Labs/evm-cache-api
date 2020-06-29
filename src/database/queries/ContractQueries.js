const hexToBytea = require('../../util/hexToBytea.js');

class ContractQueries {
	static getList() {
		return {
			text: `
				SELECT
					address,
					COALESCE(name, custom_name, NULL) AS name,
					symbol,
					standard,
					abi IS NOT NULL AS using_abi
				FROM
					contract_meta
				ORDER BY
					name ASC;
			`
		}
	}

	static getTokenHolders(
		contract
	) {
		return {
			text: `
				SELECT
					address,
					SUM(COALESCE(input, 0) - COALESCE(output, 0)) AS amount
				FROM
					event_transfer_owner
				WHERE
					contract_address = $1
				GROUP BY
					address;
			`,
			values: [
				hexToBytea(contract)
			]
		}
	}

	static getTokenCountByAddress(
		contract,
		address
	) {
		return {
			text: `
				SELECT
					address,
					SUM(COALESCE(input, 0) - COALESCE(output, 0)) AS amount
				FROM
					event_transfer_owner
				WHERE
					contract_address = $1 AND
					address = $2
				GROUP BY
					address;
			`,
			values: [
				hexToBytea(contract),
				hexToBytea(address)
			]
		}
	}

	static hasTokenId(
		contract,
		id,
		address
	) {
		return {
			text: `
				SELECT
					address,
					SUM(COALESCE(input, 0) - COALESCE(output, 0)) AS amount
				FROM
					event_transfer_owner
				WHERE
					contract_address = $1 AND
					id = $2::NUMERIC AND
					address = $3
				GROUP BY
					address;
			`,
			values: [
				hexToBytea(contract),
				id,
				hexToBytea(address)
			]
		}
	}
}

module.exports = ContractQueries;
