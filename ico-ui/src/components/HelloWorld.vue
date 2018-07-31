<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ coinbase }}</h1>
    <h2>Balance {{ balance }}</h2>
    <h2>Weth Balance {{ wethBalance }}</h2>
    <h2>SCM Balance {{ scmBalance }}</h2>
  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import icoJson from '../../../build/contracts/IcoSCM.json'
import tokenJson from '../../../build/contracts/TokenSCM.json'
import weth9Json from '../../../build/contracts/WETH9.json'

const Ico = contract(icoJson)
const Token = contract(tokenJson)
const Weth = contract(weth9Json)

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      web3: null,
      coinbase: null,
      balance: 0,
      scmBalance: 0,
      wethBalance: 0,
    }
  },
  created() {
    this.loadWeb3()
    setInterval(() => {if (this.getCoinbase() != this.coinbase) this.loadCoinbase()}, 1000);
  },
  methods: {
    loadWeb3() {
      if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 Fluyd, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")

        // Use Mist/MetaMask's provider
        let w3 = new Web3(web3.currentProvider)
        this.$set(this, 'web3', () => w3)
        Ico.setProvider(web3.currentProvider)
        Token.setProvider(web3.currentProvider)

        this.loadCoinbase()
        /*
      SimpleStorage.deployed()
        .then((instance) => instance.address)
        .then((address) => {
          this.contractAddress = address
          this.updateCurrentNumber()
        })
         */
      }
    },
    getCoinbase() {
      return this.web3().eth.coinbase
    },
    loadCoinbase() {
      this.$set(this, 'coinbase', this.getCoinbase())
    },
    loadBalances(address) {
      if (this.web3 != null && address != null) {
        let web3 = this.web3()
        web3.eth.getBalance(address, (error, result) => this.$set(this, 'balance', result.valueOf()))
      } else {
        return 0
      }
    },
  },
  watch: {
    coinbase(address) {
      this.loadBalances(address)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
