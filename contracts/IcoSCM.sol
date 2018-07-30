pragma solidity ^0.4.24;

import "canonical-weth/contracts/WETH9.sol";
import "./TokenSCM.sol";

// TODO Use SafeMath
// import "./SafeMath.sol";

contract IcoSCM {
  uint public constant wethToRaise = 1000 ether;
  uint public constant scmPerWeth = 10;
  uint public storedWeth = 0;
  uint public closedOn = 0;
  mapping(address => uint) public balances;

  TokenSCM public tokenSCM;
  WETH9 public weth9;

  event Claim(address indexed user, uint amount);

  constructor(address tokenAddress, address wethAddress) public {
      tokenSCM = TokenSCM(tokenAddress);
      weth9 = WETH9(wethAddress);
  }

  function invest(uint amountWei) public returns (bool) {
      // Don't invest more than wethToRaise
      if (amountWei + storedWeth >= wethToRaise) {
        amountWei = wethToRaise - storedWeth;
        closedOn = now;
      }

      require(weth9.transferFrom(msg.sender, address(this), amountWei), "Cannot transfer WEth");
      storedWeth += amountWei;
      balances[msg.sender] = balances[msg.sender] + amountWei * scmPerWeth;
      return true;
  }

  function claim() public returns (bool) {
    require(closedOn > 0 && (closedOn + 2 minutes) < now, "Ico not closed");
    uint tokens = balances[msg.sender];
    bool tokensFound = tokens > 0;
    if (tokensFound) {
        tokenSCM.transfer(msg.sender, tokens);
        emit Claim(msg.sender, tokens);
    }
    return tokensFound;
  }

}
