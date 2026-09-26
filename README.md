# FaucetFlow frontend

Visual shell for the faucet. Wallet connection and contract calls are left for you.

The page runs with preview numbers from `lib/sampleData.ts`. Search the project for `TODO(connect)` — those comments are the only places that need chain logic.

## Run it

```bash
npm install
npm run dev
```

## Where to add your code

| File | What you add |
| --- | --- |
| `app/providers.tsx` | Wagmi, React Query, and RainbowKit providers |
| `lib/contracts.ts` | Deployed addresses and the ABIs |
| `app/page.tsx` | `useAccount`, `useReadContract`, `useWriteContract`, and `showToast` around those writes |

Suggested packages, installed by you when you are ready:

```bash
npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

Copy `.env.example` to `.env.local` and fill in the WalletConnect project id plus the addresses from `faucetflow-contracts/deployments/sepolia.json`.
