export const PAYSTREAM_VAULT_ADDRESS = "0xaa838872afb7ab462856123ffe97ed47d95e8dc5" as const;
export const USYC_TOKEN_ADDRESS = "0x5110000000000000000000000000000000000000" as const;

export const PAYSTREAM_VAULT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdc", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "streamId", type: "uint256" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amountPerSecond", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "startTime", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "stopTime", type: "uint256" }
    ],
    name: "StreamCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "streamId", type: "uint256" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "remainingAmount", type: "uint256" }
    ],
    name: "StreamCancelled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "streamId", type: "uint256" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "Withdrawal",
    type: "event"
  },
  {
    inputs: [
      { internalType: "uint256", name: "streamId", type: "uint256" }
    ],
    name: "balanceOfStream",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amountPerSecond", type: "uint256" },
      { internalType: "uint256", name: "stopTime", type: "uint256" }
    ],
    name: "createStream",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "streamId", type: "uint256" }
    ],
    name: "withdrawFromStream",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "streamId", type: "uint256" }
    ],
    name: "cancelStream",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    name: "streams",
    outputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amountPerSecond", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "stopTime", type: "uint256" },
      { internalType: "uint256", name: "remainingBalance", type: "uint256" },
      { internalType: "uint256", name: "lastWithdrawalTime", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;
