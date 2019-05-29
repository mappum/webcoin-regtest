import anyTest, { TestInterface } from 'ava'
let test = anyTest as TestInterface<{
  bitcoind: any
}>

let createBitcoind = require('bitcoind')
let { mkdirSync, removeSync } = require('fs-extra')
let { tmpdir } = require('os')
let getPort = require('get-port')
let { join } = require('path')
let SPVNode = require('../src/index')

async function makeBitcoind() {
  let rpcport = await getPort()
  let port = await getPort()
  let dataPath = join(tmpdir(), Math.random().toString(36) + rpcport + port)
  mkdirSync(dataPath)
  let bitcoind = createBitcoind({
    rpcport,
    port,
    listen: 1,
    regtest: true,
    datadir: dataPath,
    debug: 1,
    deprecatedrpc: 'signrawtransaction',
    txindex: 1
  })
  await bitcoind.started()
  return { rpc: bitcoind.rpc, port, rpcport, node: bitcoind, dataPath }
}
test.beforeEach(async function(t) {
  let btcd = await makeBitcoind()
  t.context.bitcoind = btcd
})
test.afterEach.always(async function(t) {
  t.context.bitcoind.node.kill()
  removeSync(t.context.bitcoind.dataPath)
})

test('regtest node', async function(t) {
  let btcd = t.context.bitcoind

  let node = await SPVNode(btcd)
  t.is(node.chain.height(), 0)
})
