# DarkBid Frontend Developer Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm 8+
- Phantom Wallet extension (installed in Chrome/Brave)
- Solana CLI (optional, for testing)

### Installation

```bash
# Clone and navigate
cd darkbid

# Install dependencies (already done if you see node_modules)
npm install

# Start dev server
npm run dev

# In another terminal, for building
npm run build
```

Visit: `http://localhost:5173`

---

## What's Been Implemented (Phase 1-9)

### ✅ Wallet Integration
- **Provider Setup**: ConnectionProvider → WalletProvider → WalletModalProvider
- **Phantom Support**: Only Phantom wallet enabled (Devnet by default)
- **Custom UI**: Styled connect button, balance display, disconnect menu

### ✅ Component Library
- **PageTransition**: Smooth fade-in for every route
- **WalletButton**: Connect/Disconnect with address display
- **CountdownTimer**: MM:SS format with color changes
- **BidForm**: Validated form with balance and reserve checks

### ✅ Custom Hooks
- **useWalletInfo**: Get balance, address, connection state
- **useDarkBidProgram**: Initialize Anchor program (awaiting Program ID)
- **usePlaceBid**: Place sealed bid with hash + nonce storage
- **useRevealBid**: Reveal bid during reveal phase

### ✅ Design System
- **CSS Variables**: All colors, fonts, shadows defined in `globals.css`
- **Responsive Layout**: Mobile-first design
- **Dark Theme**: Violet + Cyan accent palette

---

## File Structure Explained

```
src/
│
├── App.jsx
│   └── Main entry point with all 4 providers (Solana, Wallet, Modal, Router)
│
├── styles/globals.css
│   └── Design tokens (--bg-base, --violet-400, etc)
│   └── Component styles (wallet-btn, countdown, bid-form)
│
├── hooks/
│   ├── useWalletInfo.js        [READ: Get user's balance & address]
│   ├── useDarkBidProgram.js    [WRITE: Initialize Anchor program]
│   ├── usePlaceBid.js          [WRITE: Submit sealed bid to contract]
│   └── useRevealBid.js         [WRITE: Reveal bid during reveal phase]
│
├── components/
│   ├── shared/
│   │   ├── PageTransition.jsx  [Fade-in animation wrapper]
│   │   ├── WalletButton.jsx    [Connect/Disconnect UI]
│   │   └── TxToast.jsx         [Transaction notifications - TODO]
│   │
│   └── auction/
│       ├── BidForm.jsx         [Place bid form - needs contract integration]
│       ├── CountdownTimer.jsx  [MM:SS timer with colors]
│       ├── ActivityFeed.jsx    [Recent bids feed]
│       ├── AuctionCard.jsx     [Auction preview card]
│       ├── RevealPanel.jsx     [Reveal bid UI]
│       └── WinnerPanel.jsx     [Winner display]
│
├── pages/
│   ├── Landing.jsx             [Home page with hero]
│   ├── Dashboard.jsx           [Browse all auctions]
│   ├── Auction.jsx             [Single auction page]
│   └── Launch.jsx              [Create new auction]
│
└── lib/
    ├── darkbid.json            [Anchor IDL - placeholder, get from Dev 2]
    ├── constants.js            [Routes, app config]
    └── utils.js                [Helper functions]
```

---

## Key Design Decisions

### Why These Providers?
1. **ConnectionProvider** → Talks to Solana RPC (currently devnet)
2. **WalletProvider** → Manages wallet connection state
3. **WalletModalProvider** → Shows the "Connect Wallet" modal
4. **BrowserRouter** → Handles page routing

### Why localStorage for Bid Nonce?
- Bid is hashed before sending to contract
- Need to store `amount + nonce` locally for reveal phase
- User approves reveal later, contract re-hashes to verify match
- ⚠️ Not secure for mainnet (use encrypted localStorage or IndexedDB)

### Why Design Tokens?
- CSS variables in `:root` for consistency
- Easy to change theme (just update one place)
- Already used: `--violet-400`, `--text-primary`, etc.

---

## Connecting to Smart Contract (Next Phase)

When Dev 2 deploys the contract:

### Step 1: Get the IDL
```bash
# Dev 2 will provide this file after deploying
# Place it here:
cp <path-to-idl>/darkbid.json src/lib/darkbid.json
```

### Step 2: Get Program ID
```bash
# Dev 2 runs this on their machine after deployment:
anchor deploy --provider.cluster devnet
# Output: "Program Id: DarkB1d..."
```

### Step 3: Update useDarkBidProgram.js
```js
// Before:
const PROGRAM_ID = new PublicKey('DarkB1dXXXXXXXXXXXXX...') // placeholder

// After:
const PROGRAM_ID = new PublicKey('DarkB1d<actual-id-from-dev-2>')
```

### Step 4: Connect BidForm Submit
```js
// In BidForm.jsx, handleSubmit() currently has TODO
const { placeBid, loading } = usePlaceBid()

async function handleSubmit() {
  if (!validateBid(bidAmount)) return
  try {
    const tx = await placeBid(auctionId, parseFloat(bidAmount))
    // Show success toast
  } catch (err) {
    setError(err.message)
  }
}
```

---

## Testing Checklist

### Local Development
```bash
# Start dev server
npm run dev

# In browser:
1. Visit http://localhost:5173
2. Click "Connect Wallet"
3. Phantom popup → "Connect to localhost"
4. See address show up in WalletButton
5. Navigate pages → see fade transitions
6. Check Console → no errors
```

### With Phantom Wallet
```bash
# Requirements:
- Phantom extension installed
- Set to DEVNET (Phantom Settings → Network → Devnet)
- Have at least 0.5 SOL (airdrop on devnet if needed)

# Test flows:
1. Connect to app → approve Phantom popup
2. Click disconnect → wallet disconnects
3. Refresh page → wallet auto-connects (if autoConnect enabled)
4. Change network in Phantom → app still works on devnet
```

### With 3 Wallets (End-to-End)
```bash
# Open 3 separate browsers or browser profiles:
Profile 1 (Chrome): Wallet A - Launcher
Profile 2 (Brave):  Wallet B - Bidder 1
Profile 3 (Edge):   Wallet C - Bidder 2

# Flow:
1. Wallet A creates auction (set reserve, duration)
2. Wallet B places bid → sees sealed confirmation
3. Wallet C places bid → sees sealed confirmation
4. Timer ends → enters reveal phase
5. Wallet B reveals → amount shows on-chain
6. Wallet C reveals → amount shows on-chain
7. Contract settles → shows winner
8. Verify all 3 transactions on Solana Explorer
```

---

## Common Issues & Debugging

### Issue: "Can't connect to Phantom"
```
✓ Make sure Phantom extension installed
✓ Make sure Phantom is set to Devnet
✓ Try: Phantom Settings → Reset account
✓ Try: Phantom → Disconnect app, then reconnect
```

### Issue: "Balance shows 0 SOL"
```
✓ Need to airdrop devnet SOL:
  solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet

✓ Or use Phantom's built-in faucet:
  Click network dropdown → Request Airdrop
```

### Issue: Build fails with "MISSING_EXPORT"
```
✓ Check export statement:
  ❌ export { default as X } (wrong in some cases)
  ✓ export { X }
  ✓ export default X
```

### Issue: "Transaction failed: instruction error"
```
✓ This means smart contract rejected it
✓ Check contract logs (Dev 2's error messages)
✓ Likely causes:
  - Bid below reserve
  - Wrong auction account
  - Not in correct phase (Active/Revealing)
```

### Issue: Bid nonce not found during reveal
```
✓ localStorage might be cleared
✓ Test in incognito mode (no localStorage)
✓ Solution: 
  - Store in IndexedDB instead
  - Or ask user to copy/paste nonce
```

---

## Performance Tips

### Reduce Bundle Size
```bash
# Check what's large:
npm run build
# Output shows dist/assets sizes
# Currently ~850kb minified (acceptable for MVP)

# Later optimizations:
- Code-split pages with React.lazy()
- Tree-shake unused Anchor functions
- Remove dev dependencies from prod build
```

### Optimize Re-renders
```jsx
// Bad: useWalletInfo() called on every render
export function Auction() {
  const info = useWalletInfo()  // ❌ recalculates every time
  return <div>{info.address}</div>
}

// Good: Memoized
export function Auction() {
  const info = useWalletInfo()  // ✓ cached via hook
  return <div>{info.address}</div>
}
```

---

## Environment Variables

Create `.env.local` (Git-ignored):

```env
# Solana Network
VITE_NETWORK=devnet

# Smart Contract (get from Dev 2 after deploy)
VITE_PROGRAM_ID=DarkB1dXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: RPC Endpoint override
VITE_RPC_URL=https://api.devnet.solana.com
```

Access in code:
```js
const programId = import.meta.env.VITE_PROGRAM_ID
```

---

## Next Developer Onboarding

When a new dev joins:

1. **Read**: This guide (5 min)
2. **Read**: `IMPLEMENTATION_STATUS.md` (10 min)
3. **Read**: Code comments in `src/hooks/` (15 min)
4. **Run**: `npm install` && `npm run dev` (2 min)
5. **Test**: Connect Phantom, see balance (5 min)
6. **Ask**: "Where is the contract?" 👉 Dev 2

---

## Security Reminders

### What Your Code Protects
- ✅ User doesn't input private key
- ✅ Phantom handles signing
- ✅ App validates inputs before sending

### What You Must NOT Do
- ❌ console.log(privateKey)
- ❌ Store seed phrases
- ❌ Send transaction without user approval
- ❌ Hardcode wallet addresses

### What Smart Contract Protects
- ✅ Invalid bids get rejected
- ✅ Double-spending impossible
- ✅ ZK proofs verify correctness
- ✅ Auto-refunds on failure

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server (hot reload)
npm run build           # Production build
npm run build && npm run preview  # Build + preview prod

# Code Quality
npm run lint            # Check code style
npm run lint -- --fix   # Auto-fix style issues

# Debugging
# Add breakpoint in VSCode debugger
# Or use console.log() and check DevTools (F12)

# Git
git status              # See changes
git add .               # Stage all changes
git commit -m "msg"     # Commit
git push                # Push to GitHub
```

---

## Links & Resources

### Solana Documentation
- https://docs.solana.com
- https://docs.rs/solana-program
- https://book.anchor-lang.com

### Phantom Wallet
- https://docs.phantom.app
- Phantom Settings → Devnet is here

### Solana Explorer
- https://explorer.solana.com (mainnet)
- https://explorer.solana.com?cluster=devnet (devnet)

### Our Code
- GitHub: (link to repo)
- Issues: (link to issues)
- Docs: See IMPLEMENTATION_STATUS.md

---

## Team Communication

- **Questions about UI?** → Ask Akshaya (Frontend)
- **Questions about contract?** → Ask Dev 2 (Smart Contract)
- **Questions about proving?** → Ask Dev 3 (ZK Circuits)
- **Questions about connecting?** → Ask Dev 4 (Integration)

---

*Last Updated: 2026-04-25*
*Status: Ready for Smart Contract Integration*
*Next Phase: Integration Week (May 1-4)*
