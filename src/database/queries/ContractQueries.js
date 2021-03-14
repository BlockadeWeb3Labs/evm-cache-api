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

	static getStats() {
		return {
			text: `
				SELECT
					sq.contract_address,
					COALESCE(cm.name, cm.custom_name, NULL) AS name,
					cm.symbol,
					COUNT(sq.owner) AS num_holders,
					SUM(sq.amount) AS total,
					ROUND(AVG(sq.amount), 2) AS mean,
					PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY sq.amount) AS pct_50th,
					PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY sq.amount) AS pct_75th,
					PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY sq.amount) AS pct_90th,
					PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY sq.amount) AS pct_95th
				FROM (
						SELECT contract_address, owner, SUM(value) AS amount
						FROM asset_owner
						WHERE value > 0
						GROUP BY contract_address, owner
					) AS sq,
					contract_meta cm
				WHERE
					sq.amount > 0 AND
					cm.address = sq.contract_address
				GROUP BY
					sq.contract_address,
					cm.name,
					cm.custom_name,
					cm.symbol
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

		return {
			text: `
				SELECT
					l.block_number,
					l.transaction_hash,
					l.log_index,
					l.topic_0,
					l.topic_1,
					l.topic_2,
					l.topic_3,
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
