#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const {
    PrivateKey,
    Mnemonic,
} = require ('@hashgraph/sdk');
const dotenv = require('dotenv');

async function init01Main() {
    dotenv.config();
    const {
        RPC_RELAY_URL,
    } = process.env;

    const rlPrompt = readline.createInterface({
        input: stdin,
        output: stdout,
    });

    let restart;
    do {
        restart = false;
        // prompt user to input their operator account details
        console.log('What is your operator account ID? e.g. "0.0.12345" ');
        const operatorId = await rlPrompt.question('> ');
        console.log('What is your operator account private key?? e.g. "0x1234abcdef5678abcdef90d7edc0242ce802d1c3d5a2bccf7a9aa0cae63632d" ');
        const operatorKey = await rlPrompt.question('> ');

        // validate operator account details
        const privateKey = PrivateKey.fromStringECDSA(operatorKey);
        const publicKeyHex = `0x${privateKey.publicKey.toStringRaw()}`;

        console.log(publicKeyHex);
        const accountFetchApiUrl =
            `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=${publicKeyHex}&balance=true&limit=1&order=desc`;
        let accountBalanceTinybar;
        let accountId;
        try {
            const accountFetch = await fetch(accountFetchApiUrl);
            const accountJson = await accountFetch.json();
            console.log(accountJson?.accounts[0]);
            accountId = accountJson?.accounts[0]?.account;
            accountBalanceTinybar = accountJson?.accounts[0]?.balance?.balance;
        } catch (ex) {
            // do nothing
        }
        if (accountId !== operatorId || !accountBalanceTinybar) {
            console.error('Specified operator account does not exist, its private key is a mismatch, or is currently unfunded.');
            restart = true;
            continue;
        }

        // prompt user to input their seed phrase or leave blank to generate new one
        console.log('What is your BIP-39 seed phrase? (leave blank if you do not have one, a new one will be generated for you)');
        console.log('e.g. "produce youth second tiger social diagram area jeans frequent casual kingdom major"');
        console.log('(leave blank if you do not have one, a new one will be generated for you)');
        let seedPhrase = await rlPrompt.question('> ');

        // validate seed phrase OR generate new one
        if (!seedPhrase) {
            // generate a new seed phrase
            const mnemonic = await Mnemonic.generate12();
            seedPhrase = mnemonic.toString();
        } else {
            // validate specified seed phrase
            let isValidSeedPhrase = true;
            try {
                const mnemonic = await Mnemonic.fromString(seedPhrase);
            } catch (ex) {
                isValidSeedPhrase = false;
            }
            if (!isValidSeedPhrase) {
                console.error('Specified seed phrase is invalid.');
                restart = true;
                continue;
            }
        }

        // generate account ID and key from seed phrase
        // TODO waiting on https://github.com/hashgraph/hedera-sdk-js/pull/2341 to be published

        // work out what the RPC URL should be
        // Note that when run in gitpod, the task is expected to set RPC_RELAY_URL.
        // Otherwise it default to a localhost instance of the RPC relay
        const rpcUrl = RPC_RELAY_URL || 'http://localhost:7546/';

        // write out new env vars to console
        const dotEnvFileContentsProposed =
`
OPERATOR_ACCOUNT_ID="${operatorId}"
OPERATOR_ACCOUNT_PRIVATE_KEY="${operatorKey}"

SEED_PHRASE="${seedPhrase}"
ACCOUNT_ID="YOUR_ACCOUNT_ID"
ACCOUNT_PRIVATE_KEY="YOUR_HEX_ENCODED_PRIVATE_KEY"

RPC_URL="${rpcUrl}"
`;

        console.log(dotEnvFileContentsProposed);

        // prompt user y/n to overwrite .env file
        console.log('Are you OK to overwrite the .env file in this directory with the above? (restart/yes/No)');
        const allowOverwrite = await rlPrompt.question('> ');

        const allowOverwrite1stChar = allowOverwrite.toLowerCase().charAt(0);
        if (allowOverwrite1stChar === 'y') {
            console.log('OK, overwriting');
            const fileName = path.resolve('.env');
            await fs.writeFile(fileName, dotEnvFileContentsProposed);
        } else if (allowOverwrite1stChar == 'r') {
            console.log('OK, restarting');
            restart = true;
        } else {
            console.log('OK, doing nothing');
        }
    } while (restart);

    rlPrompt.close();
}

init01Main();
