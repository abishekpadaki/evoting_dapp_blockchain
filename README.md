# evoting_dapp_blockchain

install ganache UI

Run `npm i`

Start ganache UI, Quickstart (Should be running on localhost and port 7545)

Run `truffle migrations --development`

Note down contract address and which account created contract (usually first account in Ganache ui)

Take abi object from build/contracts/VotingSystem.json (This is not required anymore as app.js now reads the abi from the json automatically)

Add the contract address noted down in previous step in the variable `contractAddress` in frontend/app.js

Open the frontend/index.html file and play around with the functions. (Sometimes due to CORS error you might not be able to just open the html file. In this case you will need to run a live-server on your local to run the frontend. A Suggested application would be the live server extension on VSCode.)

Remember, only contract creator account is admin, and only that account can Create proposals, delete proposals or Register other accounts.
All accounts, only those who have been registered by admin, can vote.

Once 5 voters (configurable) have been registered, the 'commit' phase or voting phase begins.

Once the configurable timer ends, the commit phase ends, and each voter needs to reveal their votes.

Once all voters have revealed their vote, click the End Voting button in the admin account to view the final results.