"use client";

import { useState, useEffect, useCallback } from "react";
import { keccak256, encodePacked } from "viem";

export interface UserOperation {
  sender: `0x${string}`;
  nonce: bigint;
  initCode: `0x${string}`;
  callData: `0x${string}`;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: `0x${string}`;
  signature: `0x${string}`;
}

export function useSmartAccount(eoaAddress: string | null) {
  const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | null>(null);
  const [isGasless, setIsGasless] = useState<boolean>(true);
  const [isDeployed, setIsDeployed] = useState<boolean>(false);

  useEffect(() => {
    if (eoaAddress) {
      // Deterministically generate Smart Account address based on EOA address
      const hash = keccak256(
        encodePacked(
          ["address", "string"],
          [eoaAddress as `0x${string}`, "erc4337-smart-account-salt-v1"]
        )
      );
      const deterministicAddress = `0x${hash.slice(26)}` as `0x${string}`;
      setSmartAccountAddress(deterministicAddress);
      setIsDeployed(true);
    } else {
      setSmartAccountAddress(null);
    }
  }, [eoaAddress]);

  const constructUserOp = useCallback(async (
    target: `0x${string}`,
    amount: string,
    callData: `0x${string}`
  ): Promise<UserOperation | null> => {
    if (!smartAccountAddress) return null;

    // Build standard UserOperation payload
    return {
      sender: smartAccountAddress,
      nonce: 1n,
      initCode: "0x" as `0x${string}`,
      callData,
      callGasLimit: 250000n,
      verificationGasLimit: 100000n,
      preVerificationGas: 50000n,
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
      paymasterAndData: "0x" as `0x${string}`, // To be signed by Paymaster on backend
      signature: "0x" as `0x${string}`       // To be signed by EOA client
    };
  }, [smartAccountAddress]);

  const submitUserOp = useCallback(async (
    userOp: UserOperation,
    userSignature: string
  ): Promise<{ success: boolean; txHash: string; explorerUrl: string }> => {
    const res = await fetch("/api/paymaster/sponsor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userOp: {
          ...userOp,
          nonce: userOp.nonce.toString(),
          callGasLimit: userOp.callGasLimit.toString(),
          verificationGasLimit: userOp.verificationGasLimit.toString(),
          preVerificationGas: userOp.preVerificationGas.toString(),
          maxFeePerGas: userOp.maxFeePerGas.toString(),
          maxPriorityFeePerGas: userOp.maxPriorityFeePerGas.toString()
        },
        signature: userSignature
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Paymaster sponsorship failed.");
    }

    const data = await res.json();
    return {
      success: true,
      txHash: data.txHash,
      explorerUrl: `https://testnet.arcscan.app/tx/${data.txHash}`
    };
  }, []);

  return {
    smartAccountAddress,
    isGasless,
    setIsGasless,
    isDeployed,
    constructUserOp,
    submitUserOp
  };
}
