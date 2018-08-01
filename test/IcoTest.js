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
    var totalWeisToInvest = (await icoSCM.wethToRaise()).valueOf()
    var weisToInvest = totalWeisToInvest - web3.toWei(1, 'ether')
    var scmPerWeth = (await icoSCM.scmPerWeth()).valueOf()
    weth.deposit({'value': totalWeisToInvest})
    wethBalance = await weth.balanceOf(accounts[0])
    assert.equal(wethBalance.valueOf(), totalWeisToInvest)
    weth.approve(IcoSCM.address, totalWeisToInvest)

    // Invest everything - 1 ether
    assert.ok(icoSCM.invest(weisToInvest))
    assert.equal(await icoSCM.closedOn(), 0)

    // Invest remaining 1 ether
    assert.ok(icoSCM.invest(totalWeisToInvest - weisToInvest))
    assert.equal(await icoSCM.balances.call(accounts[0]), totalWeisToInvest)

    // Now ico should be closed
    assert.ok(await icoSCM.closedOn() > 0)

    // Try to get the tokens from the Ico
    var expectedTokens = scmPerWeth * totalWeisToInvest
    try {
      await icoSCM.claim()
      assert.fail('Exception not raised')
    } catch (error) {
    }

    // Go 2 minutes in the future
    web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [121], id: 0})
    web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0})
    assert.ok(await icoSCM.claim())
    assert.equal(await tokenSCM.balanceOf.call(accounts[0]), expectedTokens)
    assert.equal(await icoSCM.balances.call(accounts[0]), 0)
  })
})
