import { motion } from "framer-motion"
import { Trophy } from "lucide-react"

export function WinnerPanel({ isWinner }) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`border rounded-2xl p-8 mb-8 text-center flex flex-col items-center shadow-[0_0_48px_rgba(52,211,153,0.15)] ${
        isWinner ? 'bg-success-bg border-success border-2' : 'bg-bg-surface border-border-default'
      }`}
    >
      <Trophy className={`w-16 h-16 mb-4 ${isWinner ? 'text-success' : 'text-violet-500'}`} />
      
      <h2 className="text-2xl font-bold mb-2 text-text-primary">
        {isWinner ? "🏆 You Won the Auction!" : "Auction Complete"}
      </h2>
      
      <p className="text-lg text-text-secondary mb-6">
        {isWinner 
          ? "Congratulations! Your tokens are ready to be claimed." 
          : "The winning bid was ◎ 750 USDC. Your bid has been refunded."}
      </p>

      {isWinner ? (
        <button className="px-8 py-3 bg-success hover:bg-emerald-400 text-bg-base font-bold rounded-xl transition-all shadow-[0_0_24px_rgba(52,211,153,0.4)]">
          Claim Tokens →
        </button>
      ) : (
        <button className="px-8 py-3 bg-transparent border border-border-default hover:bg-bg-elevated text-text-primary font-medium rounded-xl transition-all">
          View Refund Transaction ↗
        </button>
      )}

      {/* Leaderboard */}
      <div className="mt-12 w-full max-w-lg text-left">
        <h4 className="text-sm uppercase tracking-wider text-text-muted mb-4 font-semibold">Revealed Bids Leaderboard</h4>
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="grid grid-cols-4 px-4 py-2 text-xs font-mono text-text-muted bg-bg-elevated rounded-lg mb-2">
            <span>Rank</span>
            <span>Wallet</span>
            <span className="text-right">Bid</span>
            <span className="text-right">Result</span>
          </div>
          {/* Rows */}
          {[
            { rank: 1, wallet: "0x...abc", bid: 750, result: "WINNER ✓", won: true },
            { rank: 2, wallet: "0x...def", bid: 600, result: "Refunded", won: false },
            { rank: 3, wallet: "0x...ghi", bid: 500, result: "Refunded", won: false },
          ].map(row => (
            <div key={row.rank} className={`grid grid-cols-4 px-4 py-3 rounded-xl border font-mono text-sm items-center transition-colors ${row.won ? 'bg-success/10 border-success/30 text-success' : 'bg-bg-surface border-border-subtle text-text-secondary'}`}>
              <span className={row.won ? 'text-success font-bold' : ''}>{row.rank}</span>
              <span className={row.won ? 'text-success font-bold' : ''}>{row.wallet}</span>
              <span className="text-right">{row.bid}</span>
              <span className="text-right font-semibold">{row.result}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
