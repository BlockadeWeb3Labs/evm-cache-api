const hexToBytea = require('../../util/hexToBytea.js');

class BlockQueries {
	static getLatestBlock() {
		return {
			text: `
				SELECT
					number,
					hash,
					created_time,
					gas_limit,
					gas_used
				FROM
					block
				ORDER BY
					number DESC
				LIMIT
					1;
			`
		}
	}
}

module.exports = BlockQueries;
