pragma solidity ^0.8.0;

contract VotingSystem {
    // State variables
    address public admin;
    uint256 public proposalsCount;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 voteIndex;
    }

    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount;
    }

    mapping(address => Voter) public voters;
    mapping(uint256 => Proposal) public proposals;

    // Events
    event VoterRegistered(address voterAddress);
    event ProposalCreated(uint256 proposalId, string description);
    event VoteCasted(address voter, uint256 proposalId);

    // Constructor
    constructor() {
        admin = msg.sender;
    }

    // Modifier
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Functions
    function registerVoter(address _voterAddress) public onlyAdmin {
        require(!voters[_voterAddress].isRegistered, "Voter is already registered");

        voters[_voterAddress].isRegistered = true;

        emit VoterRegistered(_voterAddress);
    }

    function createProposal(string memory _description) public onlyAdmin {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(proposalsCount, _description, 0);

        emit ProposalCreated(proposalsCount, _description);
    }

    function vote(uint256 _proposalId) public {
        Voter storage voter = voters[msg.sender];

        require(voter.isRegistered, "Voter is not registered");
        require(!voter.hasVoted, "Voter has already voted");
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");

        voter.hasVoted = true;
        voter.voteIndex = _proposalId;

        proposals[_proposalId].voteCount++;

        emit VoteCasted(msg.sender, _proposalId);
    }

    function getResults() public view returns (Proposal[] memory) {
        Proposal[] memory results = new Proposal[](proposalsCount);

        for (uint256 i = 1; i <= proposalsCount; i++) {
            results[i - 1] = proposals[i];
        }

        return results;
    }
}
