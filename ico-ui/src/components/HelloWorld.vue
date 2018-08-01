<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ coinbase }}</h1>
    <h2>Balance {{ balance }}</h2>
    <h2>Weth Balance {{ wethBalance }}</h2>
    <button @click="wrapEth">Wrap Eth</button>
    <h2>SCM Balance {{ scmBalance }}</h2>
    <h2>Ico Status {{ icoStatus }}</h2>
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
      coinbase: null,
      balance: 0,
      scmBalance: 0,
      wethBalance: 0,
      icoTimestamp: null,
      web3: () => null,
      weth: () => null,
      token: () => null,
      ico: () => null
    }
  },
  created() {
    this.loadWeb3()
  },
  methods: {
    async loadWeb3() {
      if (typeof web3 !== 'undefined') {
        // eslint-disable-next-line
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 Fluyd, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")

        // Use Mist/MetaMask's provider
        // eslint-disable-next-line
        let w3 = new Web3(web3.currentProvider)
        this.$set(this, 'web3', () => w3)
        Ico.setProvider(w3.currentProvider)
        Token.setProvider(w3.currentProvider)
        Weth.setProvider(w3.currentProvider)

        let [weth, token, ico] = await Promise.all([Weth.deployed(), Token.deployed(), Ico.deployed()])
        this.$set(this, 'weth', () => weth)
        this.$set(this, 'token', () => token)
        this.$set(this, 'ico', () => ico)

        weth.Deposit((error, result) => {
          console.log(result)
          this.loadBalances(this.coinbase) 
        })
        setInterval(() => {if (this.getCoinbase() != this.coinbase) this.loadCoinbase()}, 1000);
      }
    },
    getCoinbase() {
      return this.web3().eth.coinbase
    },
    loadCoinbase() {
      this.$set(this, 'coinbase', this.getCoinbase())
    },
    loadBalances(address) {
      let values = [this.web3(), this.weth(), this.token()]
      if (values.every(x => x != null) && address != null ) {
        let [web3, weth, token] = values
        web3.eth.getBalance(address, (error, result) => this.$set(this, 'balance', result.valueOf()))
        weth.balanceOf.call(address).then(result => this.$set(this, 'wethBalance', result.valueOf()))
        token.balanceOf.call(address).then(result => this.$set(this, 'scmBalance', result.valueOf()))
      }
    },
    loadIcoStatus() {
      let web3 = this.web3()
      let ico = this.ico()
      ico.closedOn.call().then(result => this.$set(this, 'icoTimestamp', result.valueOf()))
    },
    wrapEth() {
      let weis = this.web3().toWei(1, 'ether')
      this.weth().deposit({value: weis, from: this.coinbase})
    }
  },
  watch: {
    coinbase(address) {
      this.loadBalances(address)
    }
  },
  computed: {
    icoStatus() {
      return (this.icoTimestamp == "0")?"Opened":"Closed"
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
