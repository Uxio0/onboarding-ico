var Weth = artifacts.require("canonical-weth/contracts/WETH9.sol");
var TokenSCM = artifacts.require("./TokenSCM.sol");
var IcoSCM = artifacts.require("./IcoSCM.sol");

module.exports = function(deployer) {
  deployer.deploy(IcoSCM, TokenSCM.address, Weth.address).then(async () => {
    var tokenSCM = await TokenSCM.deployed()
    var totalSupply = await tokenSCM.totalSupply()
    await tokenSCM.transfer(IcoSCM.address, totalSupply)
  })
};
