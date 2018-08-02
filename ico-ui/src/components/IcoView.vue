<template>
  <div class="hello">
    <h1>{{ coinbase }}</h1>
    <h2>Balance {{ balanceEther }}Ξ</h2>
    <h2>Weth Balance {{ wethBalanceEther }}Ξ</h2>
    <button @click="wrapEth">Wrap {{ ethToWrap }} Eth</button>
    <input type="number" min="1" max="1000" v-model="ethToWrap">
    <span v-if="wethBalanceEther != '0'">
      <button @click="unwrapEth">UnWrap {{ ethToUnwrap }} Eth</button>
      <input type="number" min="1" max="1000" v-model="ethToUnwrap">
    </span>
    <h2>SCM Balance {{ scmBalanceEther }}</h2>
    <h2>Total Invested in Ico {{ icoTotalInvestedEther }}Ξ</h2>
    <h2>Invested by {{ coinbase }} in Ico {{ icoInvestedEther }}Ξ</h2>
    <h2>Ico Status {{ icoStatus }}</h2>
    <span v-if="icoTimestamp == 0">
      <span v-if="wethBalanceEther != '0'">
        <button @click="invest">Invest</button>
        <input type="number" min="1" max="1000" v-model="wethToInvest">
      </span>
      <h2 v-else>You need to wrap some ether to invest!</h2>
    </span>
    <span v-else-if="icoInvestedEther > 0">
      <button @click="claim" >Claim</button>
    </span>
  </div>
</template>

<script>
import { getWeb3, getIco, getToken, getWeth } from '../metamask.js'

const web3 = getWeb3()

export default {
  name: 'IcoView',
  props: {
    coinbase: String
  },
  data () {
    return {
      balance: 0,
      scmBalance: 0,
      wethBalance: 0,
      ethToWrap: 0,
      ethToUnwrap: 0,
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
  async created () {
    await this.loadWeb3()
    await Promise.all([this.loadIcoStatus(), this.loadBalances()])
  },
  methods: {
    loadWeb3 () {
      return Promise.all([getWeth(), getToken(), getIco()]).then(([weth, token, ico]) => {
        this.$set(this, 'weth', () => weth)
        this.$set(this, 'token', () => token)
        this.$set(this, 'ico', () => ico)
        weth.Deposit((_, result) => {
          this.loadBalances(this.coinbase)
        })
        weth.Withdrawal((_, result) => {
          this.loadBalances(this.coinbase)
        })
        ico.Invest((_, result) => {
          this.loadBalances(this.coinbase)
          this.loadIcoStatus()
        })
        ico.Claim((_, result) => {
          this.loadBalances(this.coinbase)
          this.loadIcoStatus()
        })
      })
    },
    loadBalances () {
      let address = this.coinbase
      let values = [web3, this.weth(), this.token()]
      if (values.every(x => x != null) && address != null) {
        let [web3, weth, token] = values
        web3.eth.getBalance(address, (_, result) => this.$set(this, 'balance', result))
        weth.balanceOf.call(address).then(result => this.$set(this, 'wethBalance', result))
        token.balanceOf.call(address).then(result => this.$set(this, 'scmBalance', result))
      }
    },
    loadIcoStatus () {
      this.ico().closedOn.call().then(result => this.$set(this, 'icoTimestamp', result.valueOf()))
      this.ico().storedWeth.call().then(result => this.$set(this, 'icoTotalInvested', result))
      if (this.coinbase != null) { this.ico().balances.call(this.coinbase).then(result => this.$set(this, 'icoInvested', result)) }
    },
    wrapEth () {
      let weis = web3.toWei(this.ethToWrap, 'ether')
      this.weth().deposit({value: weis, from: this.coinbase})
      this.ethToWrap = 0
    },
    unwrapEth () {
      let weis = web3.toWei(this.ethToUnwrap, 'ether')
      this.weth().withdraw(weis, {from: this.coinbase})
      this.ethToWrap = 0
    },
    async invest () {
      let weisToInvest = web3.toBigNumber(web3.toWei(this.wethToInvest, 'ether'))
      if (this.wethBalance !== 0 && this.wethBalance.greaterThanOrEqualTo(weisToInvest)) {
        await this.weth().approve(this.ico().address, weisToInvest, {'from': this.coinbase})
        let gas = 2 * await this.ico().invest.estimateGas(weisToInvest, {'from': this.coinbase})
        return this.ico().invest(weisToInvest, {'from': this.coinbase, 'gas': gas})
      }
    },
    async claim () {
      let gas = 2 * await this.ico().claim.estimateGas({'from': this.coinbase})
      this.ico().claim({'from': this.coinbase, 'gas': gas})
    }
  },
  watch: {
    coinbase (address) {
      this.loadBalances()
      this.loadIcoStatus()
    },
    wethBalance (balance) {
      let balanceEther = web3.fromWei(balance, 'ether').toNumber()
      this.$set(this, 'ethToUnwrap', balanceEther)
      this.$set(this, 'wethToInvest', balanceEther)
    }
  },
  computed: {
    icoStatus () {
      return (this.icoTimestamp == '0') ? 'Opened' : 'Closed'
    },
    balanceEther () {
      return web3.fromWei(this.balance, 'ether').valueOf()
    },
    wethBalanceEther () {
      return web3.fromWei(this.wethBalance, 'ether').valueOf()
    },
    scmBalanceEther () {
      return web3.fromWei(this.scmBalance, 'ether').valueOf()
    },
    icoTotalInvestedEther () {
      return web3.fromWei(this.icoTotalInvested, 'ether').valueOf()
    },
    icoInvestedEther () {
      return web3.fromWei(this.icoInvested, 'ether').valueOf()
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
