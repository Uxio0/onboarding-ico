<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ coinbase }}</h1>
    <h2>Balance {{ balanceEther }}Ξ</h2>
    <h2>Weth Balance {{ wethBalanceEther }}Ξ</h2>
    <button @click="wrapEth">Wrap {{ ethToWrap }} Eth</button>
    <button @click="unwrapEth">UnWrap {{ ethToWrap }} Eth</button>
    <input type="number" min="1" max="1000" v-model="ethToWrap"></input>
    <h2>SCM Balance {{ scmBalanceEther }}</h2>
    <h2>Total Invested in Ico {{ icoTotalInvestedEther }}Ξ</h2>
    <h2>Invested by {{ coinbase }} in Ico {{ icoInvestedEther }}Ξ</h2>
    <h2>Ico Status {{ icoStatus }}</h2>
    <span v-if="icoTimestamp">
      <button @click="claim" >Claim</button>
    </span>
    <span v-else>
      <button @click="invest">Invest</button>
      <input type="number" min="1" max="1000" v-model="wethToInvest"></input>
    </span>
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
      ethToWrap: 0,
      wethToInvest: 0,
      icoInvested: 0,
      icoTotalInvested: 0,
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
          this.loadBalances(this.coinbase)
        })
        weth.Withdrawal((error, result) => {
          this.loadBalances(this.coinbase)
        })
        ico.Invest((error, result) => {
          this.loadBalances(this.coinbase)
          this.loadIcoStatus()
        })
        ico.Claim((error, result) => {
          this.loadBalances(this.coinbase)
          this.loadIcoStatus()
        })
        this.loadIcoStatus()
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
        web3.eth.getBalance(address, (error, result) => this.$set(this, 'balance', result))
        weth.balanceOf.call(address).then(result => this.$set(this, 'wethBalance', result))
        token.balanceOf.call(address).then(result => this.$set(this, 'scmBalance', result))
      }
    },
    loadIcoStatus() {
      this.ico().closedOn.call().then(result => this.$set(this, 'icoTimestamp', result.valueOf()))
      this.ico().storedWeth.call().then(result => this.$set(this, 'icoTotalInvested', result))
      if (this.coinbase != null)
        this.ico().balances.call(this.coinbase).then(result => this.$set(this, 'icoInvested', result))
    },
    wrapEth() {
      let weis = this.web3().toWei(this.ethToWrap, 'ether')
      this.weth().deposit({value: weis, from: this.coinbase})
      this.ethToWrap = 0
    },
    unwrapEth() {
      let weis = this.web3().toWei(this.ethToWrap, 'ether')
      this.weth().withdraw(weis, {from: this.coinbase})
      this.ethToWrap = 0
    },
    async invest() {
      let weisToInvest = this.web3().toBigNumber(this.web3().toWei(this.wethToInvest, 'ether'))
      if (this.wethBalance != 0 && this.wethBalance.greaterThanOrEqualTo(weisToInvest)) {
        let batch = this.web3().createBatch()
        await this.weth().approve(this.ico().address, weisToInvest, {'from': this.coinbase})
        await this.ico().invest(weisToInvest, {'from': this.coinbase})
      }
    },
    claim() {
        this.ico().claim({'from': this.coinbase})
    },
  },
  watch: {
    coinbase(address) {
      this.loadBalances(address)
      this.loadIcoStatus()
    }
  },
  computed: {
    icoStatus() {
      return (this.icoTimestamp == "0")?"Opened":"Closed"
    },
    balanceEther() {
      return this.web3().fromWei(this.balance, 'ether').valueOf()
    },
    wethBalanceEther() {
      return this.web3().fromWei(this.wethBalance, 'ether').valueOf()
    },
    scmBalanceEther() {
      return this.web3().fromWei(this.scmBalance, 'ether').valueOf()
    },
    icoTotalInvestedEther() {
      return this.web3().fromWei(this.icoTotalInvested, 'ether').valueOf()
    },
    icoInvestedEther() {
      return this.web3().fromWei(this.icoInvested, 'ether').valueOf()
    },
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
