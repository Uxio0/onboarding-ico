import contract from 'truffle-contract'
import Web3 from 'web3'

import icoJson from '../../build/contracts/IcoSCM.json'
import tokenJson from '../../build/contracts/TokenSCM.json'
import weth9Json from '../../build/contracts/WETH9.json'

const Ico = contract(icoJson)
const Token = contract(tokenJson)
const Weth = contract(weth9Json)

function getWeb3() {
      // Use Mist/MetaMask's provider
      if (typeof web3 !== 'undefined') {
        // eslint-disable-next-line
        return new Web3(web3.currentProvider)
      }
}

function deployed(my_contract)  {
  let web3 = getWeb3()
  my_contract.setProvider(web3.currentProvider)
  return my_contract.deployed()
}

function getIco() {
  return deployed(Ico)
}

function getToken() {
  return deployed(Token)
}

function getWeth() {
  return deployed(Weth)
}

export { getWeb3, getIco, getToken, getWeth }