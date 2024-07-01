#!/bin/bash

curl "${RPC_RELAY_URL}" \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{"method":"eth_getBlockByNumber","params":["latest",false],"id":1,"jsonrpc":"2.0"}'
