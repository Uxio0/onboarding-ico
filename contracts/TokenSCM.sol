pragma solidity ^0.4.24;

import "@gnosis.pm/util-contracts/contracts/StandardToken.sol";

contract TokenSCM is StandardToken {
	string public constant symbol = "SCM";
	string public constant name = "Scam";
	uint8 public constant decimals = 18;

	constructor(uint amount) public {
		totalTokens = amount;
		balances[msg.sender] = amount;
	}
}
