#!/bin/bash

# get specific tag name, for the latest tagged version
VERSION_TAG=$( curl -s GET https://api.github.com/repos/hashgraph/hedera-json-rpc-relay/tags | jq -r '.[].name' | grep -o 'v.*'  | head -n1 )
echo "Running RPC relay ${VERSION_TAG}"

# clone only a single branch, and only the latest commit,
# as we're not interested in commit history or anothyign other than the tagged commit
git clone \
    --depth 1 \
    --single-branch \
    --branch "${VERSION_TAG}" \
    https://github.com/hashgraph/hedera-json-rpc-relay.git \
    rpcrelay

# copy the .env file constructed previously
cp ./.rpcrelay.env ./rpcrelay/.env

# install deps, build, and run
cd rpcrelay
npm install
npm run build
npm run start
