var Weth = artifacts.require("canonical-weth/contracts/WETH9.sol");
var TokenSCM = artifacts.require("./TokenSCM.sol");

module.exports = function(deployer) {
  deployer.deploy([
    [TokenSCM, 10000e18],
    [Weth, {overwrite: false}],
  ])
};
