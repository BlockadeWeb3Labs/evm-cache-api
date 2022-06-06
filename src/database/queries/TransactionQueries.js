const hexToBytea = require('../../util/hexToBytea.js');

class TransactionQueries {
	static getTransactionByHash(
		transaction_hash
	) {
		return {
			text: `
				SELECT
					*
				FROM
					transaction
				WHERE
					hash = $1
			`,
			values: [
				hexToBytea(transaction_hash)
			]
		}
	}

	static getTransactionLogs(
		transaction_hash
	) {
		return {
			text: `
				SELECT
					l.*,
					cm.standard,
					cm.abi
				FROM
					log l
				LEFT JOIN
					contract_meta cm ON
						cm.address = l.address
				WHERE
					l.transaction_hash = $1
			`,
			values: [
				hexToBytea(transaction_hash)
			]
		}
	}
}

module.exports = TransactionQueries;
