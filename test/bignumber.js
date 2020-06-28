const assert = require('assert');
const BN = require('bn.js');

describe('BN.js tests', function() {

	const NF_BIT = new BN(0).bincn(255);
	
	// Example tokens
	const CIM_PAWKETBMR = new BN("11081664790290028166024198331356625820082597304820149540258195988548388126902");
	const AOR_RUSTBITS  = new BN("54277541829991970107421667568590323026590803461896874578610080514640537714688");
	const AOR_CRYPTOSEN = new BN("10855508365998404086189256032722001339622921863551706494238735756561045520384");
	const AOR_CELLCHRGR = new BN("7237005577332282809143980366742580386054471585956046484294312286991807414272");

	it('Identify AOR Rustbits, Crypto Sensor, Cell Charger as 1155 Fungible Tokens', function() {
		assert(AOR_RUSTBITS.and(NF_BIT).eq(new BN(0)));
		assert(AOR_CRYPTOSEN.and(NF_BIT).eq(new BN(0)));
		assert(AOR_CELLCHRGR.and(NF_BIT).eq(new BN(0)));
	});

	it('Identify CiM Pawket Boomer as 1155 Fungible Token', function() {
		assert(CIM_PAWKETBMR.and(NF_BIT).eq(new BN(0)));
	});

});
