// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ERC8183Escrow
 * @notice ERC-8183 compliant smart contract standard for trustless escrowed jobs and labor commerce between freelancers/agents.
 */
contract ERC8183Escrow {
    enum JobStatus {
        OPEN,
        FUNDED,
        SUBMITTED,
        COMPLETED,
        REJECTED
    }

    struct Job {
        address client;
        address provider;
        address evaluator;
        address token;
        uint256 amount;
        uint256 expiry;
        JobStatus status;
        bytes32 deliverableHash;
        string deliverableUrl;
    }

    IERC20 public immutable usdc;
    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;
    address public validatorAdmin; // Server admin that reviews links and verifies/releases jobs

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed provider,
        uint256 amount,
        bytes32 deliverableHash
    );
    event DeliverableSubmitted(uint256 indexed jobId, string url);
    event JobReleased(uint256 indexed jobId, address indexed provider, uint256 amount);
    event JobDisputed(uint256 indexed jobId);

    modifier onlyClient(uint256 jobId) {
        require(msg.sender == jobs[jobId].client, "Only client can execute");
        _;
    }

    constructor(address _usdc, address _validatorAdmin) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        validatorAdmin = _validatorAdmin;
        nextJobId = 1;
    }

    /**
     * @notice Locks employer's tokens and creates a new escrow job.
     */
    function createJob(
        address employee,
        uint256 amount,
        bytes32 deliverableHash
    ) external returns (uint256) {
        require(employee != address(0), "Invalid employee address");
        require(amount > 0, "Escrow amount must be > 0");

        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC deposit failed");

        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            client: msg.sender,
            provider: employee,
            evaluator: validatorAdmin,
            token: address(usdc),
            amount: amount,
            expiry: block.timestamp + 30 days,
            status: JobStatus.FUNDED,
            deliverableHash: deliverableHash,
            deliverableUrl: ""
        });

        emit JobCreated(jobId, msg.sender, employee, amount, deliverableHash);
        return jobId;
    }

    /**
     * @notice Workers submit the deliverable link/proof.
     */
    function submitDeliverable(uint256 jobId, string calldata url) external {
        Job storage job = jobs[jobId];
        require(msg.sender == job.provider, "Only employee can submit work");
        require(job.status == JobStatus.FUNDED, "Job is not in FUNDED state");
        require(bytes(url).length > 0, "URL cannot be empty");

        job.deliverableUrl = url;
        job.status = JobStatus.SUBMITTED;

        emit DeliverableSubmitted(jobId, url);
    }

    /**
     * @notice Releases escrowed tokens to the worker.
     * Can be called by the client directly, or by the designated validatorAdmin.
     */
    function releaseJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.client || msg.sender == validatorAdmin,
            "Only client or validator can release"
        );
        require(job.status == JobStatus.SUBMITTED || job.status == JobStatus.FUNDED, "Job status invalid for release");

        uint256 amount = job.amount;
        require(amount > 0, "No funds locked");
        
        job.status = JobStatus.COMPLETED;
        job.amount = 0;

        require(usdc.transfer(job.provider, amount), "USDC payment transfer failed");

        emit JobReleased(jobId, job.provider, amount);
    }

    /**
     * @notice Disputes/Rejects the job, updating status.
     */
    function disputeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.client || msg.sender == validatorAdmin || msg.sender == job.provider,
            "Unauthorized dispute call"
        );
        require(job.status == JobStatus.SUBMITTED || job.status == JobStatus.FUNDED, "Job status invalid for dispute");

        job.status = JobStatus.REJECTED;

        emit JobDisputed(jobId);
    }

    /**
     * @notice Allows client to reclaim locked funds if job is rejected/expired.
     */
    function reclaimRefund(uint256 jobId) external onlyClient(jobId) {
        Job storage job = jobs[jobId];
        require(
            job.status == JobStatus.REJECTED || block.timestamp > job.expiry,
            "Escrow has not failed or expired"
        );
        
        uint256 amount = job.amount;
        require(amount > 0, "No funds to refund");

        job.amount = 0;
        require(usdc.transfer(job.client, amount), "Refund transfer failed");
    }
}
