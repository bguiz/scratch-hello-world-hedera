#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs/promises');
const dotenv = require('dotenv');

async function init01RpcRelay() {
    // read the .env file.
    // this has either been created manually,
    // or generated using the init-00-main script
    dotenv.config();
    const {
        OPERATOR_ACCOUNT_ID,
        OPERATOR_ACCOUNT_PRIVATE_KEY,
    } = process.env;

    // construct a .env file for the RPC relay
    const dotEnvFileContentsProposed =
`
HEDERA_NETWORK="testnet"
OPERATOR_ID_MAIN="${OPERATOR_ACCOUNT_ID}"
OPERATOR_KEY_MAIN="${OPERATOR_ACCOUNT_PRIVATE_KEY}"
CHAIN_ID="0x128"
MIRROR_NODE_URL="https://testnet.mirrornode.hedera.com/"
`;

    // write the .env file in the RPC relay directory
const fileName = path.resolve('.rpcrelay.env');
await fs.writeFile(fileName, dotEnvFileContentsProposed);

    // Next, need to:
    // 1. Install the RPC relay
    // 2. Copy the .rpcrelay.env file into its directory
    // 3. Run the RPC relay server
    // 4. Notify the user
    // These will be taken care of in a shell script (better suited than NodeJs)
}

init01RpcRelay();
