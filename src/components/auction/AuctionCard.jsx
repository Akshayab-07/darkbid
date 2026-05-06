import { Link } from "react-router-dom"
import { ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

export function AuctionCard({ id, name, symbol, reserve, time, bids, isLive }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-card hover:shadow-[0_4px_24px_rgba(124,92,191,0.15)] hover:border-border-strong hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6 group">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-bold text-lg text-text-primary">{name}</span>
          <span className="text-sm font-mono text-text-muted">{symbol}</span>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-success-bg border border-success/30">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span className="text-xs text-success font-bold tracking-widest">LIVE</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-muted uppercase tracking-wider">Reserve</span>
          <span className="font-mono text-text-primary font-medium">{reserve} SOL</span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-xs text-text-muted uppercase tracking-wider">Time Left</span>
          <span className="font-mono text-text-primary text-right">{time}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-muted uppercase tracking-wider">Bids</span>
        <span className="font-mono text-text-primary">{bids} sealed</span>
      </div>

      <Link to={ROUTES.AUCTION.replace(':id', id)}>
        <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-lg shadow-raised border-none group-hover:shadow-[0_0_24px_rgba(124,92,191,0.4)] transition-all">
          Place Bid →
        </Button>
      </Link>
    </div>
  )
}
