let web3;
let votingSystem;

async function init() {
    // // Replace this with the ABI and address of your deployed contract
    // const contractAbi = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"ProposalCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"VoteCasted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voterAddress","type":"address"}],"name":"VoterRegistered","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"proposals","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"proposalsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"voters","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"bool","name":"hasVoted","type":"bool"},{"internalType":"uint256","name":"voteIndex","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_voterAddress","type":"address"}],"name":"registerVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_description","type":"string"}],"name":"createProposal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getResults","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"internalType":"struct VotingSystem.Proposal[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true}]')
    const ganacheUrl = "http://localhost:7545"; // Replace with the URL of your Ganache instance
    web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));
    const contractAbi = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"ProposalCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"VoteCasted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voterAddress","type":"address"}],"name":"VoterRegistered","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"proposals","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"proposalsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"voters","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"bool","name":"hasVoted","type":"bool"},{"internalType":"uint256","name":"voteIndex","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"_voterAddress","type":"address"}],"name":"registerVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_description","type":"string"}],"name":"createProposal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_proposalId","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getResults","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"internalType":"struct VotingSystem.Proposal[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true}]')
    const contractAddress = '0xceD2f965191D38738e86f79a6C4264ca60fEF2f4';

    votingSystem = new web3.eth.Contract(contractAbi, contractAddress);
  web3.eth.defaultAccount = (await web3.eth.getAccounts())[0];
}

async function loadAccounts() {
    const accounts = await web3.eth.getAccounts();
    const accountSelect = document.getElementById("account-select");
  
    accounts.forEach((account, index) => {
      const option = document.createElement("option");
      option.value = account;
      option.text = `Account ${index + 1}: ${account}`;
      accountSelect.add(option);
    });
  
    // Set the default account based on the selected option
    web3.eth.defaultAccount = accountSelect.value;
  }
  

async function updateResults() {
    const proposalCount = await votingSystem.methods.proposalsCount().call();
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';

    for (let i = 0; i < proposalCount; i++) {
        const proposal = await votingSystem.methods.proposals(i).call();
        const listItem = document.createElement('li');
        listItem.textContent = `${proposal.description}: ${proposal.voteCount} votes`;
        resultsList.appendChild(listItem);
    }
}

// Update Proposal List
async function updateProposalList() {
    const proposalCount = await votingSystem.methods.proposalsCount().call();
    const proposalSelect = document.getElementById('proposal-select');
    proposalSelect.innerHTML = '';

    for (let i = 0; i < proposalCount; i++) {
        const proposal = await votingSystem.methods.proposals(i).call();
        const option = document.createElement('option');
        option.value = proposal.id;
        option.textContent = proposal.description;
        console.log(proposal)
        proposalSelect.appendChild(option);
    }
}




async function main() {
    await init();
    await loadAccounts();

    document.getElementById("account-select").addEventListener("change", (event) => {
        web3.eth.defaultAccount = event.target.value;
      });
      
    // Register Voter
    document.getElementById('register-voter-btn').addEventListener('click', async () => {
        const voterAddress = document.getElementById('voter-address').value;
        const accounts = await web3.eth.defaultAccount;

        try {
            await votingSystem.methods.registerVoter(voterAddress).send({ from: accounts });
            console.log('Voter registered successfully');
        } catch (err) {
            console.error('Error registering voter:', err);
        }
    });

    // Create Proposal
    document.getElementById('create-proposal-btn').addEventListener('click', async () => {
        const proposalName = document.getElementById('proposal-name').value;
        const accounts = await web3.eth.defaultAccount;

        try {
            await votingSystem.methods.createProposal(proposalName).send({ from: accounts,  gas: 300000 });
            console.log('Proposal created successfully');
            updateProposalList();
        } catch (err) {
            console.error('Error creating proposal:', err);
        }
    });

    // Cast Vote
    document.getElementById('cast-vote-btn').addEventListener('click', async () => {
        const proposalId = document.getElementById('proposal-select').value;
        const accounts = await web3.eth.defaultAccount;

        try {
            await votingSystem.methods.vote(proposalId).send({ from: accounts });
            console.log('Vote cast successfully');
            updateResults();
        } catch (err) {
            console.error('Error casting vote:', err);
        }
    });

    // Initialize Proposal List and Results
    updateProposalList();
    updateResults();

}

document.addEventListener("DOMContentLoaded", main);