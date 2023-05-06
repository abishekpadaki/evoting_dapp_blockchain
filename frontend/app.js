let web3;
let votingSystem;


async function init() {
    // // Replace this with the ABI and address of your deployed contract
    const response = await fetch('../build/contracts/VotingSystem.json');
    const contractData = await response.json();

  // Get the ABI from the parsed JSON data
    const contractAbi = contractData.abi;
    const ganacheUrl = "http://localhost:7545"; // Replace with the URL of your Ganache instance
    web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));
    const contractAddress = '0xaa5d00A7eCC05e9d02241567f96840Be5d2EC00D';

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

    for (let i = 1; i <= proposalCount; i++) {
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

    for (let i = 1; i <= proposalCount; i++) {
        const proposal = await votingSystem.methods.proposals(i).call();
        const option = document.createElement('option');
        option.value = proposal.id;
        option.textContent = proposal.description;
        console.log(proposal)
        proposalSelect.appendChild(option);
    }
}

async function updateDeleteProposalList() {
    const proposalCount = await votingSystem.methods.proposalsCount().call();
    const deleteProposalSelect = document.getElementById('delete-proposal-select');
    deleteProposalSelect.innerHTML = '';

    for (let i = 1; i <= proposalCount; i++) {
        const proposal = await votingSystem.methods.proposals(i).call();
        const option = document.createElement('option');
        option.value = proposal.id;
        option.textContent = proposal.description;
        deleteProposalSelect.appendChild(option);
    }
}

async function deleteProposal() {
    const proposalId = document.getElementById('delete-proposal-select').value;
    const accounts = await web3.eth.defaultAccount;

    try {
        await votingSystem.methods.deleteProposal(proposalId).send({ from: accounts});
        checkVotingStatus();
        alert('Proposal deleted successfully');
    } catch (err) {
        console.error('Error deleting proposal:', err);
    }
}

async function checkVotingStatus() {
    const accounts = await web3.eth.defaultAccount;
    const voter = await votingSystem.methods.voters(accounts).call();
    const votingStatus = document.getElementById("voting-status");

    if (voter.hasVoted) {
        votingStatus.textContent = "You have already cast your vote.";
    } else {
        votingStatus.textContent = "You still have a vote left.";
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
            await votingSystem.methods.registerVoter(voterAddress).send({ from: accounts, gas: 300000 });
            alert('Voter registered successfully');
        } catch (err) {
            console.log(err);
        }
    });
    checkVotingStatus();

    // Create Proposal
document.getElementById('create-proposal-btn').addEventListener('click', async () => {
    const proposalName = document.getElementById('proposal-name').value;
    const accounts = await web3.eth.defaultAccount;

    try {
        await votingSystem.methods.createProposal(proposalName).send({ from: accounts, gas: 300000 });
        checkVotingStatus();
        alert('Proposal '+proposalName+' created successfully');
        
        // Wait for the transaction receipt and then update the proposal list
        await updateProposalList();
        await updateDeleteProposalList();

    } catch (err) {
        alert('Error creating proposal:', err);
    }
});


    // Cast Vote
    document.getElementById('cast-vote-btn').addEventListener('click', async () => {
        const proposalSelect = document.getElementById('proposal-select');
        const proposalId = proposalSelect.value;
        const proposalName = proposalSelect.options[proposalSelect.selectedIndex].text;
        const accounts = await web3.eth.defaultAccount;
        const voter = await votingSystem.methods.voters(accounts).call();

        if (voter.hasVoted) {
            alert('Your vote has already been cast.');
        } else {
        try {
            await votingSystem.methods.vote(proposalId).send({ from: accounts });
            checkVotingStatus();
            alert("Successfully voted for the proposal "+proposalName)
            updateResults();
        } catch (err) {
            console.error('Error casting vote:', err);
        }
    }
    });


    document.getElementById('delete-proposal-btn').addEventListener('click', async () => {
        await deleteProposal();

        updateProposalList();
        updateDeleteProposalList();
        updateResults();
    });

    // Initialize Proposal List and Results
    updateProposalList();
    updateResults();
    updateDeleteProposalList();

}

document.addEventListener("DOMContentLoaded", main);