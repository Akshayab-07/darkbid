import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageTransition } from "@/components/shared/PageTransition"
import { useAuction } from "@/hooks/useAuction"
import { CountdownTimer } from "@/components/auction/CountdownTimer"
import { BidForm } from "@/components/auction/BidForm"
import { RevealPanel } from "@/components/auction/RevealPanel"
import { WinnerPanel } from "@/components/auction/WinnerPanel"
import { ActivityFeed } from "@/components/auction/ActivityFeed"
import { AUCTION_STATES, ON_CHAIN_AUCTION } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"

export default function Auction() {
  const { id } = useParams()
  const reserve = parseFloat(id) || ON_CHAIN_AUCTION.RESERVE_PRICE_SOL
  
  // ✅ Use the real on-chain authority (creator) from constants
  const testAuctioneerAddress = ON_CHAIN_AUCTION.AUTHORITY
  
  const { state, timeLeft, bids, revealed, isWinner, totalDuration, placeBid } = useAuction(45)

  return (
    <PageTransition className="w-full">
      {/* Header */}
      <div className="border-b border-border-subtle bg-bg-surface/50 backdrop-blur-md sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-glow-v"></div>
          <h2 className="font-bold text-lg text-text-primary">DARKTOKEN <span className="text-text-muted font-normal ml-2">$DRK</span></h2>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-bg-elevated border border-border-default ml-auto">
            <span className="font-mono text-xs text-text-muted">{`${testAuctioneerAddress.slice(0, 6)}...${testAuctioneerAddress.slice(-4)}`}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
        <AnimatePresence mode="wait">
          {state === AUCTION_STATES.CLOSED ? (
            <motion.div 
              key="closed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <WinnerPanel isWinner={isWinner} />
            </motion.div>
          ) : state === AUCTION_STATES.CALCULATING ? (
            <motion.div 
              key="calculating"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <Loader2 className="w-16 h-16 text-violet-500 animate-spin mb-8" />
              <h2 className="text-2xl font-bold mb-2">Verifying ZK Proofs On-Chain</h2>
              <p className="text-text-muted">Smart contract is verifying all bids. This takes a few seconds.</p>
              <a href="#" className="mt-6 text-violet-400 hover:text-violet-300">View on Solana Explorer →</a>
            </motion.div>
          ) : (
            <motion.div 
              key="bidding-or-reveal"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-[1fr_400px] gap-12"
            >
              {/* Left Column: Info & Feed */}
              <div className="flex flex-col">
                <h1 className="text-h1 mb-8">
                  {state === AUCTION_STATES.BIDDING ? 'Sealed Bid Auction' : 'Auction Closed — Reveal Your Bid'}
                </h1>
                
                <div className="grid grid-cols-2 gap-8 mb-12 border-b border-border-subtle pb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-text-muted tracking-wider uppercase">Reserve Price</span>
                    <span className="font-mono text-2xl font-bold">◎ {reserve} SOL</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-text-muted tracking-wider uppercase">Min Bid</span>
                    <span className="font-mono text-xl text-text-secondary">◎ {reserve} SOL</span>
                  </div>
                </div>

                {state === AUCTION_STATES.BIDDING ? (
                  <>
                    <CountdownTimer timeLeft={timeLeft} state={state} totalDuration={totalDuration} bids={bids} />
                    <div className="mt-8 p-4 rounded-xl bg-violet-900/20 border border-violet-500/20 text-violet-300 text-sm">
                      <strong>Note:</strong> All bids are cryptographically sealed. No one — including the auctioneer — can see any bid until the reveal phase.
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-6">
                    <p className="text-lg text-text-secondary">
                      The bidding window has closed. Reveal your bid to be included in winner selection.
                    </p>
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center text-sm font-medium">
                         <span className="text-text-secondary">Reveal Progress</span>
                         <span className="text-text-muted font-mono">{revealed} of {bids} revealed</span>
                       </div>
                       <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                         <div className="h-full bg-success transition-all duration-500" style={{ width: `${(revealed/bids)*100}%` }} />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Action Panel */}
              <div className="flex flex-col pt-16">
                <AnimatePresence mode="wait">
                  {state === AUCTION_STATES.BIDDING ? (
                    <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <BidForm 
                        reservePrice={reserve} 
                        auctionId={id}
                        auctionCreatorAddress={testAuctioneerAddress}
                        onBid={placeBid} 
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="reveal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <RevealPanel onReveal={() => console.log('Revealed')} state={state} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <ActivityFeed state={state} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
