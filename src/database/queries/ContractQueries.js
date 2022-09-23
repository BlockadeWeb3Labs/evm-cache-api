const hexToBytea = require('../../util/hexToBytea.js');
const config = require('../../config/config.js');

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
		contract,
		limit  = 50,
		offset = 0
	) {
		return {
			text: `
				SELECT
					eto.address,
					SUM(COALESCE(eto.input, 0) - COALESCE(eto.output, 0)) AS amount
				FROM (
					SELECT DISTINCT ON (a.address)
						a.address,
						SUM(CASE WHEN a.address = et.to   THEN CASE WHEN et.value IS NOT NULL THEN et.value ELSE 1 END END) AS input,
						SUM(CASE WHEN a.address = et.from THEN CASE WHEN et.value IS NOT NULL THEN et.value ELSE 1 END END) AS output
					FROM
						event_transfer et,
						address a
					WHERE
						et.contract_address = $1 AND
						(a.address = et.to OR a.address = et.from)
					GROUP BY
						a.address
				) AS eto
				GROUP BY
					eto.address
				LIMIT
					$2
				OFFSET
					$3;
			`,
			values: [
				hexToBytea(contract),
				limit,
				offset
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

	static getEvents(
		contract,
		order       = 'ASC',
		limit       = 50,
		offset      = 0,
		start_block = null,
		end_block   = null
	) {
		// Force order to be either ASC or DESC
		// Hate injecting text directly into a query
		order = (order === 'DESC') ? 'DESC' : 'ASC';

		let topics_columns;
		if (config.USE_EVM_CACHE_LEGACY) {
			topics_columns = "l.topic_0, l.topic_1, l.topic_2, l.topic_3,";
		} else {
			topics_columns = "l.topics,"
		}

		return {
			text: `
				SELECT
					l.block_number,
					l.transaction_hash,
					l.log_index,
					${topics_columns}
					e.name,
					e.result
				FROM
					log l
				LEFT JOIN
					event e ON
						e.log_id = l.log_id
				WHERE
					l.address = $1 AND
					CASE WHEN $4::INTEGER IS NOT NULL THEN l.block_number >= $4::INTEGER ELSE TRUE END AND
					CASE WHEN $5::INTEGER IS NOT NULL THEN l.block_number <= $5::INTEGER ELSE TRUE END
				ORDER BY
					l.block_number ${order},
					l.log_index ${order}
				LIMIT
					$2
				OFFSET
					$3;
			`,
			values: [
				hexToBytea(contract),
				limit,
				offset,
				start_block,
				end_block
			]
		}
	}

	static getToken(
		contract,
		id
	) {
		return {
			text: `
				SELECT
					transfers.contract_address AS contract,
					COALESCE(cm.name, cm.custom_name, NULL) AS name,
					cm.symbol,
					transfers.id,
					transfers.input - transfers.output AS amount,
					am.token_uri,
					am.metadata
				FROM (
					SELECT
						eto.contract_address,
						eto.id,
						SUM(COALESCE(eto.input, 0)) AS input,
						SUM(CASE WHEN eto.address = $3 THEN 0 ELSE COALESCE(eto.output, 0) END) AS output
					FROM
						event_transfer_owner eto
					WHERE
						eto.contract_address = $1 AND
						eto.id = $2
					GROUP BY
						eto.contract_address,
						eto.id
				) AS transfers
				JOIN
					contract_meta cm ON
						cm.address = transfers.contract_address
				LEFT JOIN
					asset_metadata am ON
						am.contract_address = transfers.contract_address AND
						am.id = transfers.id
				WHERE
					transfers.contract_address = $1 AND
					transfers.id = $2;
			`,
			values: [
				hexToBytea(contract),
				id,
				hexToBytea('0x0000000000000000000000000000000000000000')
			]
		}
	}
}

module.exports = ContractQueries;
