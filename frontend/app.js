let web3;
let votingSystem;
let timerInterval;
let totalVotesRevealed = 0;


async function init() {
    // // Replace this with the ABI and address of your deployed contract
    const response = await fetch('../build/contracts/VotingSystem.json');
    const contractData = await response.json();

  // Get the ABI from the parsed JSON data
    const contractAbi = contractData.abi;
    try{
    const ganacheUrl = "http://localhost:7545"; // Replace with the URL of your Ganache instance
    web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));
    const contractAddress = '0x1070a17AC954c43e033C9D994B69d141a95a4202';

    votingSystem = new web3.eth.Contract(contractAbi, contractAddress);
  web3.eth.defaultAccount = (await web3.eth.getAccounts())[0];
    }
    catch(err){
        console.log(err)
        showAlert("Error Connecting to a Wallet or Service", 'error')
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('create-proposal-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('delete-proposal-section').style.display = 'none';
        document.getElementById('account-selection').style.display = 'none';
        document.getElementById('voting-status-section').style.display = 'none';
        document.getElementById('main-container').innerHTML = 'No Web Wallet or Service Found. Check If Ganache/Metamask is running';

    
    }
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
    const currentAccount = document.getElementById('current-account');
    currentAccount.textContent = `Current Account: ${web3.eth.defaultAccount}`;
    // Update the UI based on the selected account
  await updateAdminUI();
  }
  

async function updateResults() {
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const votingDeadline = await votingSystem.methods.resultTime().call();

    const proposalCount = await votingSystem.methods.proposalsCount().call();
    const resultsList = document.getElementById('final-results');
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

    if (proposalCount === '0') {
        const noOptions = document.createElement('option');
        noOptions.value = '';
        noOptions.textContent = 'No Proposals Yet';
        proposalSelect.appendChild(noOptions);
      } else {

    for (let i = 1; i <= proposalCount; i++) {
        const proposal = await votingSystem.methods.proposals(i).call();
        const option = document.createElement('option');
        option.value = proposal.id;
        option.textContent = proposal.description;
        console.log(proposal)
        proposalSelect.appendChild(option);
    }
}
}

async function updateDeleteProposalList() {
    const proposalCount = await votingSystem.methods.proposalsCount().call();
    const deleteProposalSelect = document.getElementById('delete-proposal-select');
    deleteProposalSelect.innerHTML = '';

    if (proposalCount === '0') {
        const noOptions = document.createElement('option');
        noOptions.value = '';
        noOptions.textContent = 'No Proposals Yet';
        deleteProposalSelect.appendChild(noOptions);
      } else {

    for (let i = 1; i <= proposalCount; i++) {
        const proposal = await votingSystem.methods.proposals(i).call();
        const option = document.createElement('option');
        option.value = proposal.id;
        option.textContent = proposal.description;
        deleteProposalSelect.appendChild(option);
    }
}
}

async function deleteProposal() {
    const proposalId = document.getElementById('delete-proposal-select').value;
    const accounts = await web3.eth.defaultAccount;

    try {
        await votingSystem.methods.deleteProposal(proposalId).send({ from: accounts});
        checkVotingStatus();
        showAlert('Proposal deleted successfully', 'success');
    } catch (err) {
        showAlert('Error deleting proposal:'+ err, 'error');
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

  

async function updateAdminUI() {
    try{
    const adminAccount = (await web3.eth.getAccounts())[0] // Replace this with the admin account address
    console.log(adminAccount)
    const isAdmin = web3.eth.defaultAccount === adminAccount;
  
    document.getElementById('registration-section').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('create-proposal-section').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('results-section').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('delete-proposal-section').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('voting-status-section').style.display = 'block';
    }
    catch(err){
    console.log(err);
    }
  }

function showAlert(message, type, duration = 3000) {
    // Create the alert card
    const alertCard = document.createElement('div');
    alertCard.className = type === 'error' ? 'alert-card-err' : 'alert-card-success';
    alertCard.textContent = message;
  
    // Append the alert card to the body
    document.body.appendChild(alertCard);
  
    // Remove the alert card after a specified duration with a fade-out animation
    setTimeout(() => {
      alertCard.style.animation = `fade-out 0.5s forwards`;
      setTimeout(() => {
        document.body.removeChild(alertCard);
      }, 500);
    }, duration);
  }

  async function displayTimeRemaining() {
    try {
        const resultTime = await votingSystem.methods.resultTime().call();
        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = resultTime - currentTime;
    
        if (timeRemaining > 0) {
          const formattedTimeRemaining = moment.duration(timeRemaining, "seconds").format("h:mm:ss", { trim: false });
          document.getElementById("time-remaining").innerText = formattedTimeRemaining;
        } else {
          clearInterval(timerInterval);
          document.getElementById("time-remaining").innerText = "Voting has ended.";
          document.getElementById('cast-vote-btn').disabled = true;
          document.getElementById('reveal-vote-btn').disabled = false;
          document.getElementById('end-voting').disabled = false;
          await updateResults(); // Update the results when the voting period is over
          const currentPhase = await votingSystem.methods.currentPhase().call();
          console.log(currentPhase)
          if (currentPhase == "1") { // "1" would be the value for the Reveal phase
            await endVotingPeriod(); 
          }
        }
      } catch (error) {
        console.error("Error updating timer:", error);
      }
  }

  async function getWinningProposal() {
    try {
      const winningProposalId = await votingSystem.methods.winningProposal().call();
      const winningProposal = await votingSystem.methods.proposals(winningProposalId).call();
      console.log(winningProposal)
      //const winningProposalDesc = await votingSystem.methods.proposals(winningProposal[1]).call();
      winningProposalText = winningProposal[1];
      showAlert(`The Winning proposal with ${winningProposal[2]} votes is: ${winningProposal[1]}`,'success')
      document.getElementById('registration-section').style.display = 'none';
      document.getElementById('create-proposal-section').style.display = 'none';
      document.getElementById('results-section').style.display = 'none';
      document.getElementById('delete-proposal-section').style.display = 'none';
      document.getElementById('voting-status-section').style.display = 'none';
      document.getElementById('final-section').style.display = 'block';
      //const winningProposalElement = document.getElementById("winning-proposal");
      document.getElementById('winning-proposal-text').innerHTML = winningProposalText; 

    } catch (error) {
      console.error("Error getting winning proposal:", error);
    }
  }

  async function checkAllVotesRevealed() {
    const totalVoters = await votingSystem.methods.voterCount().call();
    console.log(totalVoters, totalVotesRevealed)

    if(parseInt(totalVoters) === parseInt(totalVotesRevealed)) {
        document.getElementById('reveal-vote-btn').disabled = true;
        document.getElementById('end-voting').disabled = false;
        
        showAlert("Voting has ended, Waiting for admin to end voting.", 'success');
        
    }
}

  async function endVotingPeriod() {
    // Implement this function to call the method that ends the voting period in your contract
    const accounts = await web3.eth.defaultAccount;
    try {
        await votingSystem.methods.endVoting().send({ from: accounts });
    } catch (error) {
        console.error("Error ending voting period:", error);
    }
}

  
async function main() {
    await init();
    await loadAccounts();

    document.getElementById("account-select").addEventListener("change", async(event) => {
        web3.eth.defaultAccount = event.target.value;
        checkVotingStatus();
        updateAdminUI();
      });
      
    // Register Voter
    document.getElementById('register-voter-btn').addEventListener('click', async () => {
        const voterAddress = document.getElementById('voter-address').value;
        const accounts = await web3.eth.defaultAccount;
        // Get the balance of the voter's account
        let voterStake = await web3.eth.getBalance(voterAddress);
        let balanceEth = web3.utils.fromWei(voterStake, 'ether');
        let str = balanceEth.toString();
        let firstFourDigits = str.replace('.', '').slice(0, 4);
        console.log(firstFourDigits); // Outputs: '99'

        try {
            await votingSystem.methods.registerVoter(voterAddress, firstFourDigits).send({ from: accounts, gas: 500000 });
            // Check the number of registered voters and start the commit phase if there are 5 or more
            const registeredVotersCount = await votingSystem.methods.voterCount().call();
            showAlert('Voter registered successfully','success');
            if (parseInt(registeredVotersCount) >= 5) {
              // Start the commit phase
              showAlert('Commit phase has started', 'success');
              timerInterval = setInterval(displayTimeRemaining, 1000);
          }
        } catch (err) {
            console.log(err);
        }
    });

    document.getElementById('end-voting').addEventListener('click', async () => {
      const accounts = await web3.eth.defaultAccount;

      try {
        await endVotingPeriod();
        await getWinningProposal();
        }
       catch (err) {
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
        showAlert('Proposal '+proposalName+' created successfully', 'success');
        
        // Wait for the transaction receipt and then update the proposal list
        await updateProposalList();
        await updateDeleteProposalList();
        await updateResults();

    } catch (err) {
        showAlert('Error creating proposal:'+ err, 'error');
    }
});


    // Cast Vote
    document.getElementById('cast-vote-btn').addEventListener('click', async () => {
        const proposalSelect = document.getElementById('proposal-select');
        const proposalId = proposalSelect.value;
        const proposalName = proposalSelect.options[proposalSelect.selectedIndex].text;
        const accounts = await web3.eth.defaultAccount;
        const voter = await votingSystem.methods.voters(accounts).call();
        const secret = 'justacastaway'; // This should be the secret used for voting

        if (voter.hasVoted) {
            showAlert('Your vote has already been cast!','error');
        } else {
        try {
            //let combined = `${proposalId}${secret}`
            //const voteHash = web3.utils.keccak256(combined); // Hashing the proposal ID as the vote
            let commitHash = web3.utils.soliditySha3(proposalId, secret);
            await votingSystem.methods.commitVote(commitHash).send({ from: accounts });
            //localStorage.setItem(`votingSecret_${accounts}`, voteHash);
            checkVotingStatus();
            showAlert("Successfully voted for the proposal "+proposalName, 'success')
        } catch (err) {
            console.error('Error casting vote:', err);
        }
    }
    });

    document.getElementById('reveal-vote-btn').addEventListener('click', async () => {
      const proposalSelect = document.getElementById('proposal-select');
      const proposalId = proposalSelect.value;
      const proposalName = proposalSelect.options[proposalSelect.selectedIndex].text;
      const accounts = await web3.eth.defaultAccount;
      const secret = 'justacastaway'; // This should be the secret used for voting
  
      try {
          //let commitHash = web3.utils.soliditySha3(proposalId, secret);
          console.log(proposalId, secret)
          await votingSystem.methods.revealVote(proposalId, secret).send({ from: accounts, gas: 300000 });
          checkVotingStatus();
          showAlert("Successfully revealed your vote for the proposal " + proposalName, 'success');
          updateResults();
          totalVotesRevealed++;
          await checkAllVotesRevealed();
      } catch (err) {
          console.error('Error revealing vote:', err);
      }
  });

    document.getElementById('delete-proposal-btn').addEventListener('click', async () => {
        await deleteProposal();

        updateProposalList();
        updateDeleteProposalList();
        updateResults();
    });

    // Initialize Proposal List and Results
    await updateProposalList();
    await updateResults();
    await updateDeleteProposalList();
    await displayTimeRemaining();
    timerInterval = setInterval(displayTimeRemaining, 1000); // Update the time remaining every 1 second
}

document.addEventListener("DOMContentLoaded", main);