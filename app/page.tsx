"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { useEffect, useState } from "react";

import { FlowMeter } from "@/components/FlowMeter";
import { Toast, ToastShelf, ToastStatus } from "@/components/ToastShelf";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { formatDuration } from "@/lib/format";
import { sample } from "@/lib/sampleData";
import { faucetAddress, tokenAddress } from "@/lib/contracts";
import { faucetAbi, tokenAbi } from "@/lib/abi";

import {
  useAccount,
  useAccountEffect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { useContract } from "@/hooks/useContract";

export default function HomePage() {
  const {
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
  } = useContract();

  const {
    mutateAsync: writeContract,
    data: hash,
    isPending: isWriting,
  } = useWriteContract();

  // State for the toast and the draft-(amount and hours)
  const [toast, setToast] = useState<Toast | null>(null);
  const [draftAmount, setDraftAmount] = useState(claimAmount);
  const [draftHours, setDraftHours] = useState(
    cooldownSeconds ? String(Number(cooldownSeconds) / 3600) : "0",
  );

  // Can claim if the wallet is connected and the seconds remaining is 0
  const canClaim =
    isConnected && secondsRemaining !== undefined && countdown === 0;

  function showToast(status: ToastStatus, message: string) {
    setToast({ status, message });
  }

  // Clear the toast after 4.2 seconds
  useEffect(() => {
    if (!toast || toast.status === "pending") return;

    const id = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Wait for the transaction to be successful
  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Refetch the balance and cooldown when the transaction is successful
  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
      refetchCooldown();
      refetchNextClaimAt();

      if (isOwner) {
        // Refetch the claim amount and cooldown when the owner is the one who saved the settings
        refetchClaimAmount();
        refetchCooldown();
      }
    }
  }, [isSuccess]);

  // Claim the tokens from the faucet
  async function onClaim() {
    try {
      showToast("pending", "Claim submitted");

      await writeContract({
        address: faucetAddress as `0x${string}`,
        abi: faucetAbi,
        functionName: "claim",
      });
      showToast("success", `Claimed ${claimAmount} ${symbol}`);
    } catch (error) {
      showToast("fail", "Claim failed");
    }
  }

  // Save the settings of the faucet
  async function onSave(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    //If the owner is not the one who saved the settings, show a toast
    if (!isOwner) return showToast("fail", "The token is not yours.");

    //Try to save the settings
    try {
      showToast("pending", "Saving settings");

      await writeContract({
        address: faucetAddress as `0x${string}`,
        abi: faucetAbi,
        functionName: "setClaimAmount",
        args: [parseEther(draftAmount ? String(draftAmount) : "0")],
      });

      await writeContract({
        address: faucetAddress as `0x${string}`,
        abi: faucetAbi,
        functionName: "setCooldown",
        args: [BigInt(Number(draftHours) * 60 * 60)],
      });

      showToast("success", "Settings saved");
    } catch (error) {
      showToast("fail", "Failed to save settings.");
    }
  }

  // Wait label for the countdown
  const waitLabel =
    countdown > 0
      ? `Next claim opens in ${formatDuration(countdown)}`
      : "This wallet can claim now";

  return (
    <div className="ff-page">
      <header className="ff-header">
        <div className="ff-brand">
          <TapMark />
          <div>
            <p className="ff-eyebrow">Public tap · Sepolia</p>
            <p className="ff-title">FaucetFlow</p>
          </div>
        </div>
        <ConnectButton accountStatus="address" />
      </header>

      <main className="ff-counter">
        <section className="ff-meter-panel">
          <p className="ff-kicker">Cooldown</p>
          <FlowMeter
            claimAmount={claimAmount ? formatEther(claimAmount) : "0"}
            symbol={symbol || ""}
            cooldownSeconds={cooldownSeconds ? Number(cooldownSeconds) : 0}
            secondsRemaining={countdown}
          />
          <p className="ff-meter-caption">
            {waitLabel}. The ring fills as the wait runs out.
          </p>
        </section>

        <section className="ff-slip">
          <p className="ff-kicker">Your balance</p>
          <p className="ff-balance">
            {formatEther(balance ? balance : BigInt(0))}
            <span>{symbol}</span>
          </p>
          <button
            type="button"
            className="ff-claim"
            disabled={!canClaim}
            onClick={onClaim}
          >
            {isConnected
              ? `Claim ${claimAmount ? formatEther(claimAmount) : "0"} ${symbol}`
              : "Connect wallet to claim"}
          </button>
          <p className="ff-wait">{waitLabel}</p>
          <dl className="ff-facts">
            <div>
              <dt>Each claim</dt>
              <dd>
                {claimAmount ? formatEther(claimAmount) : "0"} {symbol}
              </dd>
            </div>
            <div>
              <dt>Minimum wait</dt>
              <dd>
                {formatDuration(cooldownSeconds ? Number(cooldownSeconds) : 0)}
              </dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>Sepolia</dd>
            </div>
          </dl>
        </section>
      </main>

      <section className="ff-admin" aria-labelledby="admin-title">
        <div className="ff-admin-head">
          <div>
            <p className="ff-kicker">Owner cabinet</p>
            <h2 id="admin-title">Faucet settings</h2>
          </div>
          <p className="ff-admin-note">
            {isOwner
              ? "This wallet can change the tap."
              : "Only the faucet owner can change these."}
          </p>
        </div>

        <form className="ff-admin-form" onSubmit={onSave}>
          <fieldset disabled={!isOwner}>
            <label>
              Claim amount
              <span className="ff-field">
                <input
                  inputMode="decimal"
                  value={draftAmount ? String(draftAmount) : "0"}
                  onChange={(event) =>
                    setDraftAmount(BigInt(event.target.value))
                  }
                  aria-label="Claim amount"
                />
                <span>{symbol}</span>
              </span>
            </label>
            <label>
              Cooldown
              <span className="ff-field">
                <input
                  inputMode="numeric"
                  value={draftHours}
                  onChange={(event) => setDraftHours(event.target.value)}
                  aria-label="Cooldown in hours"
                />
                <span>hours</span>
              </span>
            </label>
            <button type="submit" className="ff-save">
              Save faucet settings
            </button>
          </fieldset>
        </form>
      </section>

      <footer className="ff-footer">
        <p>
          Numbers on this page are preview data until the contracts are
          connected.
        </p>
        <div className="ff-preview">
          <button
            type="button"
            onClick={() =>
              showToast("pending", "Claim submitted. Waiting for the receipt.")
            }
          >
            Preview pending
          </button>
          <button
            type="button"
            onClick={() =>
              showToast("success", `Claimed ${claimAmount} ${symbol}.`)
            }
          >
            Preview confirmed
          </button>
          <button
            type="button"
            onClick={() =>
              showToast("fail", "Cooldown still active for this wallet.")
            }
          >
            Preview failed
          </button>
        </div>
      </footer>

      <ToastShelf toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function TapMark() {
  return (
    <svg className="ff-tap" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="6" y="8" width="10" height="22" rx="2" />
      <path d="M16 14h16a6 6 0 0 1 6 6v2H22" />
      <path d="M34 26c2 6 2 10 0 14" />
      <circle cx="34" cy="42" r="1.6" />
    </svg>
  );
}
