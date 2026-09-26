export const tokenAddress =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
export const faucetAddress =
  process.env.NEXT_PUBLIC_FAUCET_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

/**
 * TODO(connect): copy the `abi` arrays out of the compiled artifacts:
 *   faucetflow-contracts/artifacts/contracts/MyToken.sol/MyToken.json
 *   faucetflow-contracts/artifacts/contracts/Faucet.sol/Faucet.json
 *
 * Pass the ABI plus the address to wagmi's useReadContract / useWriteContract.
 *
 * Reads (useReadContract):
 *   token.balanceOf(connectedAddress)     -> balance on the claim slip
 *   token.symbol()                         -> "FLOW"
 *   faucet.claimAmount()                   -> amount in the meter and on the button
 *   faucet.cooldown()                      -> length of a full ring, in seconds
 *   faucet.nextClaimAt(connectedAddress)   -> unix time the countdown ends (0 if never claimed)
 *   faucet.owner()                         -> show the admin form only when this equals the connected address
 *
 * Writes (useWriteContract):
 *   faucet.claim()                         -> claim button
 *   faucet.setClaimAmount(amountInWei)    -> admin "claim amount" field
 *   faucet.setCooldown(seconds)            -> admin "cooldown" field
 *
 * Amounts on chain use 18 decimals. viem's parseEther("100") and formatEther(value)
 * convert between the "100" shown in the UI and the integer the contract stores.
 */
