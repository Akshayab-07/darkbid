import { useState } from "react"
import { PageTransition } from "@/components/shared/PageTransition"
import { AuctionCard } from "@/components/auction/AuctionCard"

export default function Dashboard() {
  const [filter, setFilter] = useState("Live")

  const auctions = [
    { id: "1", name: "PhantomToken", symbol: "$PHNTM", reserve: "1", time: "00:45", bids: "21", status: "Live" },
    { id: "2", name: "ZeroCoin", symbol: "$ZERO", reserve: "2", time: "02:15", bids: "14", status: "Live" },
    { id: "3", name: "Eclipse", symbol: "$ECL", reserve: "3", time: "14:00", bids: "5", status: "Live" },
    { id: "4", name: "Nebula", symbol: "$NBLA", reserve: "25.00", time: "24:00", bids: "0", status: "Upcoming" },
    { id: "5", name: "Axiom", symbol: "$AX", reserve: "150.00", time: "72:00", bids: "0", status: "Upcoming" },
    { id: "6", name: "Stardust", symbol: "$DUST", reserve: "10.00", time: "Ended", bids: "145", status: "Ended" },
  ]

  const filtered = auctions.filter(a => a.status === filter)

  return (
    <PageTransition className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-display mb-4">Dashboard</h1>
          <p className="text-text-secondary text-lg max-w-xl">Browse all token launches. Bid on live auctions securely, verify past cryptography, or prepare for upcoming drops.</p>
        </div>
        
        <div className="flex bg-bg-surface p-1 rounded-xl border border-border-default">
          {["Live", "Upcoming", "Ended"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-bg-elevated shadow-card text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {f === "Live" && filter === f ? (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                  Live
                </span>
              ) : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(a => (
          <AuctionCard 
            key={a.id} 
            {...a} 
            isLive={a.status === "Live"} 
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center border border-dashed border-border-default rounded-2xl bg-bg-surface/30">
            <h3 className="text-xl font-bold text-text-primary mb-2">No {filter.toLowerCase()} auctions</h3>
            <p className="text-text-muted">Check back later or launch your own token.</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
