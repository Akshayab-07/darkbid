import { useState } from "react"
import { PageTransition } from "@/components/shared/PageTransition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuctionCard } from "@/components/auction/AuctionCard"

export default function Launch() {
  const [formData, setFormData] = useState({
    name: "MyToken",
    symbol: "$MTK",
    supply: "1000000",
    reserve: "50",
    duration: "60",
    start: "now"
  })

  return (
    <PageTransition className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-display mb-4">Create Token Auction</h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Deploy a mathematically provable fair token launch. Your auction will be strictly sealed-bid, verified via ZK-SNARKs.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Form Container */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h3 className="text-h3 border-b border-border-subtle pb-4">Token Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted uppercase tracking-widest font-semibold">Token Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-bg-elevated border-border-default focus-visible:ring-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted uppercase tracking-widest font-semibold">Token Symbol</label>
                <Input 
                  value={formData.symbol} 
                  onChange={e => setFormData({...formData, symbol: e.target.value})}
                  className="bg-bg-elevated border-border-default focus-visible:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted uppercase tracking-widest font-semibold">Tokens to Sell</label>
              <div className="relative">
                <Input 
                  value={formData.supply}
                  onChange={e => setFormData({...formData, supply: e.target.value})}
                  className="bg-bg-elevated border-border-default focus-visible:ring-violet-500 pr-16 font-mono"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 hover:text-violet-300">MAX</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-h3 border-b border-border-subtle pb-4">Auction Settings</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted uppercase tracking-widest font-semibold">Reserve Price</label>
              <div className="relative">
                <Input 
                  value={formData.reserve}
                  onChange={e => setFormData({...formData, reserve: e.target.value})}
                  className="bg-bg-elevated border-border-default focus-visible:ring-violet-500 pr-16 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium text-sm">USDC</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted uppercase tracking-widest font-semibold">Auction Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "30 min", value: "30" },
                  { label: "60 min", value: "60" },
                  { label: "2 hrs", value: "120" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({...formData, duration: opt.value})}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                      formData.duration === opt.value 
                        ? 'bg-violet-600 border-violet-500 text-white' 
                        : 'bg-bg-surface border-border-default text-text-secondary hover:bg-bg-elevated'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full py-6 mt-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-lg font-bold shadow-[0_0_24px_rgba(124,92,191,0.25)] rounded-xl transition-all">
              Deploy Auction →
            </Button>
          </div>
        </div>

        {/* Live Preview Container */}
        <div>
          <div className="sticky top-24 border border-border-subtle bg-[#0A0D15]/80 p-8 rounded-3xl shadow-modal backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Live Preview</span>
            </div>
            
            <div className="pointer-events-none">
              <AuctionCard 
                id="preview"
                name={formData.name || "TokenName"}
                symbol={formData.symbol || "$SYM"}
                reserve={formData.reserve || "0"}
                time={`${formData.duration}:00`}
                bids="0"
                isLive={true}
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-violet-900/10 border border-violet-500/10 text-violet-300 text-sm flex gap-3 text-left">
              <span className="text-xl">ℹ</span>
              <p>This is exactly how bidders will see your auction card on the dashboard and landing page.</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
