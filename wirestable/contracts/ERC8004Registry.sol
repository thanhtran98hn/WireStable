// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC8004Registry
 * @dev Implementation of the ERC-8004 Autonomous Agent Registry standard.
 * It provides a public ledger where conversational/autonomous agents can publish
 * their cryptographic identity, capabilities metadata (stored on IPFS), and track reputation metrics.
 */
contract ERC8004Registry {
    struct Agent {
        address wallet;
        string name;
        string ipfsHashMetadata;
        int256 rating;
        bool registered;
        uint256 registrationTime;
    }

    // Owner of the registry (can override reputation or manage controllers)
    address public owner;

    // Mapping of agent address to agent profile details
    mapping(address => Agent) private _agents;

    // List of all registered agent addresses
    address[] private _agentList;

    event AgentRegistered(address indexed agent, string name, string ipfsHashMetadata);
    event ReputationUpdated(address indexed agent, int256 rating);

    modifier onlyOwner() {
        require(msg.sender == owner, "ERC8004: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register MSG.SENDER as an autonomous agent in the directory.
     * @param name Name of the autonomous agent.
     * @param ipfsHashMetadata IPFS CID containing capabilities metadata schema (inputs, scopes, API version).
     */
    function registerAgent(string calldata name, string calldata ipfsHashMetadata) external {
        require(!_agents[msg.sender].registered, "ERC8004: Agent already registered");
        
        _agents[msg.sender] = Agent({
            wallet: msg.sender,
            name: name,
            ipfsHashMetadata: ipfsHashMetadata,
            rating: 100, // Starts with a baseline reputation of 100
            registered: true,
            registrationTime: block.timestamp
        });

        _agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, name, ipfsHashMetadata);
    }

    /**
     * @notice Allows the registry owner to update the reputation score of a registered agent.
     * @param agent Address of the registered agent.
     * @param rating New integer reputation score for the agent.
     */
    function updateReputation(address agent, int256 rating) external onlyOwner {
        require(_agents[agent].registered, "ERC8004: Agent is not registered");
        _agents[agent].rating = rating;
        emit ReputationUpdated(agent, rating);
    }

    /**
     * @notice Retrieve the metadata and status of a registered agent.
     */
    function getAgent(address agent) external view returns (
        address wallet,
        string memory name,
        string memory ipfsHashMetadata,
        int256 rating,
        bool registered,
        uint256 registrationTime
    ) {
        Agent memory a = _agents[agent];
        return (
            a.wallet,
            a.name,
            a.ipfsHashMetadata,
            a.rating,
            a.registered,
            a.registrationTime
        );
    }

    /**
     * @notice Retrieve the total number of registered agents.
     */
    function getAgentCount() external view returns (uint256) {
        return _agentList.length;
    }

    /**
     * @notice Get the agent address at a specific index in the registry list.
     */
    function getAgentAtIndex(uint256 index) external view returns (address) {
        require(index < _agentList.length, "ERC8004: Index out of bounds");
        return _agentList[index];
    }
}
