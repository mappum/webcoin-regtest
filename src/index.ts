let SPVNode = require('webcoin')
let testnetParams = require('webcoin-bitcoin-testnet')

async function getRegtestParams(btcd) {
  let webcoinGenesisHeader = await rpcFetchHeader(btcd.rpc)

  let regtestParams = Object.assign({}, testnetParams)

  regtestParams.net = Object.assign({}, regtestParams.net, {
    dnsSeeds: [],
    webSeeds: [],
    staticPeers: ['localhost'],
    defaultPort: btcd.port,
    magic: 0xdab5bffa
  })

  regtestParams.blockchain = Object.assign({}, regtestParams.blockchain, {
    genesisHeader: webcoinGenesisHeader,
    checkpoints: []
  })

  return regtestParams
}

/**
 * Given an rpc client, return webcoin-formatted genesis header
 *
 */
async function rpcFetchHeader(rpc) {
  let genesisHash = await rpc.getBlockHash(0)
  let genesisBlock = await rpc.getBlock(genesisHash)
  return formatHeader(genesisBlock)
}

/**
 * rpc header format -> webcoin format
 */
function formatHeader(header) {
  return {
    height: header.height,
    version: header.version,
    prevHash: header.previousblockhash
      ? Buffer.from(header.previousblockhash, 'hex').reverse()
      : Buffer.alloc(32),
    merkleRoot: Buffer.from(header.merkleroot, 'hex').reverse(),
    timestamp: header.time,
    bits: parseInt(header.bits, 16),
    nonce: header.nonce
  }
}

function CreateSPVNode(bitcoind) {
  return new Promise(async (resolve, reject) => {
    let { rpc } = bitcoind
    let header = await rpcFetchHeader(rpc)

    let regtestParams = await getRegtestParams(bitcoind)

    let node = SPVNode({
      network: 'regtest',
      params: regtestParams,
      netOpts: { maxPeers: 1 },
      chainOpts: {
        store: [header],
        maxTarget: Buffer.from(
          '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          'hex'
        ),
        noRetargeting: true,
        allowMinDifficultyBlocks: true
      }
    })

    node.peers.once('peer', function(peer) {
      resolve(node)
    })
    node.start()
  })
}

export = CreateSPVNode
