<template>
  <div id="app">
    <img src="./assets/logo.png">
    <IcoView :coinbase="coinbase" v-if="coinbase" />
    <h1 v-else>Unlock metamask, please</h1>
  </div>
</template>

<script>
import IcoView from './components/IcoView.vue'
import { getWeb3 } from './metamask.js'

const web3 = getWeb3()

export default {
  name: 'app',
  components: {
    IcoView
  },
  data () {
    return {
      coinbase: null
    }
  },
  created () {
    setInterval(() => {
      if (web3.eth.coinbase !== this.coinbase) { this.$set(this, 'coinbase', web3.eth.coinbase) }
    }, 1000)
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
