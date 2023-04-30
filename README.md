# evoting_dapp_blockchain

install ganache UI

Run `npm i`

Start ganache UI, Quickstart (Should be running on localhost and port 7545)

Run `truffle migrations --development`

Note down contract address and which account created contract (usually first account in Ganache ui)

Take abi object from build/contracts/VotingSystem.json

Add the abi object and contract address noted down in previous step in the variables `contractAbi` and `contractAddress` in frontend/app.js

Open the frontend/index.html file and play around with the functions.

Remember, only contract creator account is admin, and only that account can Create proposals or Register other accounts.
All accounts, only those who have been registered by admin, can vote.