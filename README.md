# webcoin-regtest

Create a [Webcoin](https://github.com/mappum/webcoin) SPV client that connects to a local [bitcoind](https://github.com/nomic-io/node-bitcoind) node running in regtest mode.

## Usage

```
$ npm install webcoin-regtest
```

```js
let SPVNode = require('webcoin-regtest')
let bitcoind = require('bitcoind')

let btcd = bitcoind({
  regtest: true
})

async function main() {
  let node = await SPVNode(btcd)
  console.log(node.chain.height())
}
main()
```
