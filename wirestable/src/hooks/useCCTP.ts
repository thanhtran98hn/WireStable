"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http, type Hash, encodeAbiParameters, keccak256 } from "viem";
import { sepolia, baseSepolia, arbitrumSepolia, arcTestnet } from "viem/chains";

export type BridgeStep =
  | "idle"
  | "switching-origin"
  | "approving"
  | "burning"
  | "polling-attestation"
  | "switching-destination"
  | "minting"
  | "success"
  | "failed";

export interface BridgeState {
  step: BridgeStep;
  burnHash: string | null;
  mintHash: string | null;
  messageHash: string | null;
  attestationSignature: string | null;
  error: string | null;
}

// CCTP Chain registry configs
export const CCTP_NETWORKS: Record<string, {
  chainId: number;
  viemChain: any;
  usdc: `0x${string}`;
  tokenMessenger: `0x${string}`;
  messageTransmitter: `0x${string}`;
  domainId: number;
}> = {
  Sepolia: {
    chainId: 11155111,
    viemChain: sepolia,
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    tokenMessenger: "0x9fb96e83411b60737190749291509fa7ec5dfaa3",
    messageTransmitter: "0x78654c60b9f1d071987c5324c4e5feac7a124185",
    domainId: 0,
  },
  Base: {
    chainId: 84532,
    viemChain: baseSepolia,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    tokenMessenger: "0x9fb96e83411b60737190749291509fa7ec5dfaa3",
    messageTransmitter: "0x78654c60b9f1d071987c5324c4e5feac7a124185",
    domainId: 6,
  },
  Arbitrum: {
    chainId: 421614,
    viemChain: arbitrumSepolia,
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    tokenMessenger: "0x9fb96e83411b60737190749291509fa7ec5dfaa3",
    messageTransmitter: "0x78654c60b9f1d071987c5324c4e5feac7a124185",
    domainId: 3,
  },
  Arc_Testnet: {
    chainId: 5042002,
    viemChain: arcTestnet,
    usdc: "0x3600000000000000000000000000000000000000",
    tokenMessenger: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8",
    messageTransmitter: "0x946b1c09893d596489b4de5de586616fe28c0571",
    domainId: 12,
  }
};

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "boolean" }],
    type: "function"
  }
] as const;

const TOKEN_MESSENGER_ABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "destinationRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" }
    ],
    name: "depositForBurn",
    outputs: [{ name: "nonce", type: "uint64" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

const MESSAGE_TRANSMITTER_ABI = [
  {
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" }
    ],
    name: "receiveMessage",
    outputs: [{ name: "success", type: "boolean" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export function useCCTP() {
  const [state, setState] = useState<BridgeState>({
    step: "idle",
    burnHash: null,
    mintHash: null,
    messageHash: null,
    attestationSignature: null,
    error: null,
  });

  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const resetBridge = useCallback(() => {
    setState({
      step: "idle",
      burnHash: null,
      mintHash: null,
      messageHash: null,
      attestationSignature: null,
      error: null,
    });
  }, []);

  const executeBridge = useCallback(async (
    amount: string,
    sourceChainName: string,
    recipientAddress: string
  ) => {
    const source = CCTP_NETWORKS[sourceChainName];
    const destination = CCTP_NETWORKS["Arc_Testnet"];

    if (!source) {
      setState(prev => ({ ...prev, step: "failed", error: `Invalid source network: ${sourceChainName}` }));
      return false;
    }

    // REAL WEB3 CCTP EXECUTION PATH
    try {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected.");
      }

      // 1. Switch chain to source if required
      if (chainId !== source.chainId) {
        setState(prev => ({ ...prev, step: "switching-origin" }));
        try {
          await walletClient.switchChain({ id: source.chainId });
        } catch (switchErr) {
          throw new Error(`Please switch your wallet chain to ${sourceChainName} Sepolia.`);
        }
      }

      const publicClientSource = createPublicClient({
        chain: source.viemChain,
        transport: http()
      });

      const parsedAmount = BigInt(parseFloat(amount) * 1e6); // USDC uses 6 decimals

      // 2. Approve TokenMessenger
      setState(prev => ({ ...prev, step: "approving" }));
      const approveTx = await walletClient.writeContract({
        address: source.usdc,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [source.tokenMessenger, parsedAmount],
        account: address
      });
      await publicClientSource.waitForTransactionReceipt({ hash: approveTx });

      // 3. Deposit for Burn
      setState(prev => ({ ...prev, step: "burning" }));
      // Pad recipient address to bytes32
      const recipientBytes32 = encodeAbiParameters(
        [{ type: "address" }],
        [recipientAddress as `0x${string}`]
      );
      // bytes32 pad is 32 bytes (64 hex characters)
      const paddedRecipient = ("0x" + recipientBytes32.substring(26).padStart(64, "0")) as `0x${string}`;

      const burnTx = await walletClient.writeContract({
        address: source.tokenMessenger,
        abi: TOKEN_MESSENGER_ABI,
        functionName: "depositForBurn",
        args: [parsedAmount, destination.domainId, paddedRecipient, source.usdc],
        account: address
      });

      const burnReceipt = await publicClientSource.waitForTransactionReceipt({ hash: burnTx });
      setState(prev => ({ ...prev, burnHash: burnTx }));

      // 4. Retrieve Message bytes from logs to compute messageHash
      // CCTP MessageSent event is emitted inside depositForBurn
      // Log parsing to extract raw bytes
      const messageSentTopic = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"; // event topic hash
      const log = burnReceipt.logs.find((l: any) => l.topics[0] === messageSentTopic);
      if (!log) {
        throw new Error("MessageSent log not found in burn receipt.");
      }

      const messageBytes = log.data;
      const computedMessageHash = keccak256(messageBytes);
      setState(prev => ({ ...prev, messageHash: computedMessageHash }));

      // 5. Poll Circle Attestation API
      setState(prev => ({ ...prev, step: "polling-attestation" }));
      let attestationSig = "";
      const attestationUrl = `https://iris-api-sandbox.circle.com/attestations/${computedMessageHash}`;
      
      for (let i = 0; i < 60; i++) { // Poll for up to 5 minutes
        try {
          const apiRes = await fetch(attestationUrl);
          const data = await apiRes.json();
          if (data.status === "complete" && data.attestation) {
            attestationSig = data.attestation;
            break;
          }
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (!attestationSig) {
        throw new Error("Attestation polling timed out or failed.");
      }

      setState(prev => ({ ...prev, attestationSignature: attestationSig }));

      // 6. Switch network to Arc Testnet for minting
      setState(prev => ({ ...prev, step: "switching-destination" }));
      try {
        await walletClient.switchChain({ id: destination.chainId });
      } catch (switchErr) {
        throw new Error("Please switch your wallet chain to Arc Testnet to complete minting.");
      }

      const publicClientDest = createPublicClient({
        chain: destination.viemChain,
        transport: http()
      });

      // 7. Call receiveMessage on Destination chain
      setState(prev => ({ ...prev, step: "minting" }));
      const mintTx = await walletClient.writeContract({
        address: destination.messageTransmitter,
        abi: MESSAGE_TRANSMITTER_ABI,
        functionName: "receiveMessage",
        args: [messageBytes, attestationSig as `0x${string}`],
        account: address
      });

      const mintReceipt = await publicClientDest.waitForTransactionReceipt({ hash: mintTx });
      setState(prev => ({
        ...prev,
        step: "success",
        mintHash: mintTx
      }));
      return true;
    } catch (err: any) {
      setState(prev => ({ ...prev, step: "failed", error: err.message || "Bridging failed." }));
      return false;
    }
  }, [walletClient, address, chainId]);

  return {
    ...state,
    executeBridge,
    resetBridge,
  };
}
