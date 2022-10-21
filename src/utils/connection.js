import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';


const connection = new MyAlgoConnect({ bridgeUrl: 'https://dev.myalgo.com/bridge' });
const algodClient = new algosdk.Algodv2('', 'https://node.testnet.algoexplorerapi.io', '');


const indexer_token = JSON.parse('')
const indexer_host = "https://testnet-algorand.api.purestake.io/idx2"
const indexer_port = ""
const indexerClient = new algosdk.Indexer(indexer_token, indexer_host, indexer_port)

export {
    connection,
    algodClient,
    indexerClient
}