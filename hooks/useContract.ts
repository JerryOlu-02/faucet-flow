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

  // Unix timestamp when this wallet can claim again. 0 if they never have.
  const { data: secondsRemaining, refetch: refetchNextClaimAt } =
    useReadContract({
      address: faucetAddress as `0x${string}`,
      abi: faucetAbi,
      functionName: "nextClaimAt",
      args: address ? [address as `0x${string}`] : undefined,
      query: { enabled: !!address },
    });

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // nextClaimAt is a unix timestamp in seconds. 0 means this wallet has never claimed.
    const unlockAt = Number(secondsRemaining ?? 0);

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setCountdown(unlockAt > now ? unlockAt - now : 0);
    };

    tick();
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
