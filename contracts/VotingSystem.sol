pragma solidity ^0.8.0;

contract VotingSystem {
    // State variables
    address public admin;
    uint256 public proposalsCount;
    uint256 public constant maxVoters = 5;
    uint256 public resultDelay = 2 minutes;
    uint256 public resultTime;
    uint256 public winningProposal;

    enum VotingPhase {Commit, Reveal, End}

    VotingPhase public currentPhase;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 voteIndex;
        bytes32 voteCommit;
    }

    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount;
    }

    mapping(address => Voter) public voters;
    mapping(uint256 => Proposal) public proposals;

    mapping(uint256 => address) public voterAddresses;
    uint256 public voterCount;


    // Events
    event VoterRegistered(address voterAddress);
    event ProposalCreated(uint256 proposalId, string description);
    event VoteCommitted(address voter);
    event VoteCasted(address voter, uint256 proposalId);
    event VoteRevealed(address voter, uint256 proposalId);
    event ProposalDeleted(uint256 proposalId);
    event VotingEnded(uint256 winningProposalId, uint256 winningVoteCount);

    // Constructor
    constructor() {
        admin = msg.sender;
        currentPhase = VotingPhase.Commit;
    }

    // Modifier
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Functions

    function registerVoter(address _voterAddress) public onlyAdmin {
        require(!voters[_voterAddress].isRegistered, "Voter is already registered");

        voters[_voterAddress] = Voter(true, false, 0, "");
        voterAddresses[voterCount] = _voterAddress;
        voterCount++;

        emit VoterRegistered(_voterAddress);

        if (voterCount == maxVoters) {
            resultTime = block.timestamp + resultDelay;
            currentPhase = VotingPhase.Commit;
        }
    }

    function getWinningProposal() public view returns (Proposal memory) {
        return proposals[winningProposal];
    }


    function createProposal(string memory _description) public onlyAdmin {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(proposalsCount, _description, 0);

        emit ProposalCreated(proposalsCount, _description);
    }

    function commitVote(bytes32 _voteCommit) public {
        require(currentPhase == VotingPhase.Commit, "Not in commit phase");
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");

        voters[msg.sender].voteCommit = _voteCommit;
        emit VoteCommitted(msg.sender);
    }

    function revealVote(uint256 _proposalId, string memory _secret) public {
        currentPhase == VotingPhase.Reveal;
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");

        // Check if committed hash matches the revealed vote
        require(keccak256(abi.encodePacked(_proposalId, _secret)) == voters[msg.sender].voteCommit, "Vote doesn't match commit");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].voteIndex = _proposalId;
        proposals[_proposalId].voteCount++;

        emit VoteRevealed(msg.sender, _proposalId);
    }


    function deleteProposal(uint256 _proposalId) public onlyAdmin {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");

    // Reset the voting power of voters who have voted for the deleted proposal
    for (uint256 i = 0; i < voterCount; i++) {
        address voterAddress = voterAddresses[i];
        Voter storage voter = voters[voterAddress];
        if (voter.hasVoted && voter.voteIndex == _proposalId) {
            voter.hasVoted = false;
            voter.voteIndex = 0;
        }
    }

        Proposal storage lastProposal = proposals[proposalsCount];
        proposals[_proposalId] = lastProposal;
        delete proposals[proposalsCount];
        proposalsCount--;

        emit ProposalDeleted(_proposalId);
    }

    function vote(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");
    require(voters[msg.sender].isRegistered, "Voter is not registered");
    require(!voters[msg.sender].hasVoted || voters[msg.sender].voteIndex == _proposalId, "Voter has already voted");

    if (!voters[msg.sender].hasVoted) {
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].voteIndex = _proposalId;
        proposals[_proposalId].voteCount++;
        emit VoteCasted(msg.sender, _proposalId);
    }
    }

    function getResults() public view returns (Proposal[] memory) {
        Proposal[] memory results = new Proposal[](proposalsCount);

        for (uint256 i = 1; i <= proposalsCount; i++) {
            results[i - 1] = proposals[i];
        }

        return results;
    }

    function getVoteCount(uint256 _proposalId) public view returns (uint256) {
    require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");

    return proposals[_proposalId].voteCount;
    }


    function endVoting() public onlyAdmin {
        currentPhase = VotingPhase.End;
        require(block.timestamp >= resultTime, "Voting result time has not been reached");


        uint256 winningProposalId = 0;
        uint256 winningVoteCount = 0;

        for (uint256 i = 1; i <= proposalsCount; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        emit VotingEnded(winningProposalId, winningVoteCount);
        winningProposal = winningProposalId;
    }

}
