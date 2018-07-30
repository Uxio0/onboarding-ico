var Weth = artifacts.require("canonical-weth/contracts/WETH9.sol");
var TokenSCM = artifacts.require("./TokenSCM.sol");
var IcoSCM = artifacts.require("./IcoSCM.sol");

contract('Ico', function(accounts) {

  /*
  beforeEach(async function () {
  })
  */

  it('should invest in Ico', async () => {
    var [weth, tokenSCM, icoSCM] = await Promise.all([Weth.deployed(), TokenSCM.deployed(), IcoSCM.deployed()])
    var weisToInvest = web3.toWei(1, 'ether')
    weth.deposit({'value': weisToInvest})
    wethBalance = await weth.balanceOf(accounts[0])
    assert.equal(wethBalance.valueOf(), weisToInvest)
    weth.approve(IcoSCM.address, weisToInvest)
    assert.ok(icoSCM.invest(weisToInvest))

    var scmPerWeth = (await icoSCM.scmPerWeth()).valueOf()
  })
})
