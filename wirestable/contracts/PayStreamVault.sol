// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title PayStreamVault
 * @notice Allows employers to lock USDC and stream continuous wages to recipients.
 */
contract PayStreamVault {
    struct Stream {
        address sender;
        address recipient;
        uint256 amountPerSecond; // in micro-USDC (6 decimals) per second
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalance;
        uint256 lastWithdrawalTime;
    }

    IERC20 public immutable usdc;
    uint256 public nextStreamId;
    mapping(uint256 => Stream) public streams;
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 amountPerSecond,
        uint256 startTime,
        uint256 stopTime
    );
    event Withdrawal(uint256 indexed streamId, address indexed recipient, uint256 amount);
    event StreamCancelled(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 remainingAmount);

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        nextStreamId = 1;
    }

    /**
     * @notice Locks employer's tokens and registers a new payment stream.
     */
    function createStream(address recipient, uint256 amountPerSecond, uint256 stopTime) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amountPerSecond > 0, "Amount per second must be > 0");
        require(stopTime > block.timestamp, "Stop time must be in the future");
        
        uint256 duration = stopTime - block.timestamp;
        uint256 totalAmount = amountPerSecond * duration;

        require(usdc.transferFrom(msg.sender, address(this), totalAmount), "USDC deposit failed");

        uint256 streamId = nextStreamId++;
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            amountPerSecond: amountPerSecond,
            startTime: block.timestamp,
            stopTime: stopTime,
            remainingBalance: totalAmount,
            lastWithdrawalTime: block.timestamp
        });

        emit StreamCreated(streamId, msg.sender, recipient, amountPerSecond, block.timestamp, stopTime);
        return streamId;
    }

    /**
     * @notice Withdraws accrued streaming earnings to the recipient's wallet.
     */
    function withdrawFromStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.recipient || msg.sender == stream.sender, "Unauthorized");
        require(stream.remainingBalance > 0, "No remaining balance");

        uint256 claimable = balanceOfStream(streamId);
        require(claimable > 0, "Nothing accrued to withdraw");

        stream.remainingBalance -= claimable;
        stream.lastWithdrawalTime = block.timestamp > stream.stopTime ? stream.stopTime : block.timestamp;

        require(usdc.transfer(stream.recipient, claimable), "USDC transfer failed");

        emit Withdrawal(streamId, stream.recipient, claimable);
    }

    /**
     * @notice Cancels stream, returning remaining tokens to the sender and accrued to the recipient.
     */
    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.sender, "Only sender can cancel");
        require(stream.remainingBalance > 0, "Stream already complete/cancelled");

        uint256 claimable = balanceOfStream(streamId);
        uint256 refundAmount = stream.remainingBalance - claimable;

        stream.remainingBalance = 0;

        if (claimable > 0) {
            require(usdc.transfer(stream.recipient, claimable), "Recipient transfer failed");
            emit Withdrawal(streamId, stream.recipient, claimable);
        }

        if (refundAmount > 0) {
            require(usdc.transfer(stream.sender, refundAmount), "Refund transfer failed");
        }

        emit StreamCancelled(streamId, stream.sender, stream.recipient, refundAmount);
    }

    /**
     * @notice Returns the amount of tokens currently claimable by the stream recipient.
     */
    function balanceOfStream(uint256 streamId) public view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (stream.remainingBalance == 0) return 0;
        if (block.timestamp <= stream.lastWithdrawalTime) return 0;

        uint256 duration;
        if (block.timestamp >= stream.stopTime) {
            duration = stream.stopTime - stream.lastWithdrawalTime;
        } else {
            duration = block.timestamp - stream.lastWithdrawalTime;
        }

        uint256 accrued = duration * stream.amountPerSecond;
        return accrued > stream.remainingBalance ? stream.remainingBalance : accrued;
    }
}
