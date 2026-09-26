import { faucetAbi, tokenAbi } from "@/lib/abi";
import { faucetAddress, tokenAddress } from "@/lib/contracts";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

export const useContract = () => {
  const { address, isConnected } = useAccount();

  // Read the balance of the token
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Read the amount of tokens that can be claimed from the faucet
  const { data: claimAmount, refetch: refetchClaimAmount } = useReadContract({
    address: faucetAddress as `0x${string}`,
    abi: faucetAbi,
    functionName: "claimAmount",
    query: { enabled: !!address },
  });

  // Read the cooldown seconds of the faucet
  const { data: cooldownSeconds, refetch: refetchCooldown } = useReadContract({
    address: faucetAddress as `0x${string}`,
    abi: faucetAbi,
    functionName: "cooldown",
    query: { enabled: !!address },
  });

  // Read the owner of the faucet
  const { data: isOwner } = useReadContract({
    address: faucetAddress as `0x${string}`,
    abi: faucetAbi,
    functionName: "owner",
    query: { enabled: !!address },
  });

  // Read the symbol of the token
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: tokenAbi,
    functionName: "symbol",
    query: { enabled: !!address },
  });

  // Read the seconds remaining until the next claim
  const { data: secondsRemaining, refetch: refetchNextClaimAt } =
    useReadContract({
      address: faucetAddress as `0x${string}`,
      abi: faucetAbi,
      functionName: "nextClaimAt",
      args: address ? [address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    });

  const [countdown, setCountdown] = useState<number>(
    secondsRemaining ? Number(secondsRemaining) : 0,
  );

  useEffect(() => {
    // Set the countdown to the seconds remaining
    const unlockAt = Date.now() + Number(secondsRemaining) * 1000;

    const tick = () => {
      setCountdown(Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000)));
    };

    const id = window.setInterval(tick, 1000);

    return () => window.clearInterval(id);
  }, [secondsRemaining]);

  return {
    balance,
    claimAmount,
    cooldownSeconds,
    isOwner,
    secondsRemaining,
    countdown,
    isConnected,
    symbol,
    refetchBalance,
    refetchClaimAmount,
    refetchCooldown,
    refetchNextClaimAt,
  };
};
