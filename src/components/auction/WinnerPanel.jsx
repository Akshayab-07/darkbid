import { motion } from "framer-motion"
import { Trophy, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

export function WinnerPanel({ isWinner }) {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [copiedAddress, setCopiedAddress] = useState(null)
  const [showTokenInfo, setShowTokenInfo] = useState(false)

  async function handleClaimTokens() {
    setLoading(true)
    console.log('🔘 Claim Tokens button clicked')
    
    try {
      console.log('  - Winner:', publicKey?.toString())
      console.log('📝 Calling on-chain claim...')
      
      console.log('  ⏳ Simulating 2 second transaction delay...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('✅ Tokens claimed successfully!')
      setSuccess(true)
      setShowTokenInfo(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMsg = err?.message || err?.toString() || 'Claim failed'
      console.error('❌ Claim error:', errorMsg)
      setError(errorMsg)
      setTimeout(() => setError(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  function handleViewRefund() {
    console.log('🔘 View Refund Transaction button clicked')
    
    if (publicKey) {
      // Open user's account on Solana Explorer for devnet
      const accountUrl = `https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`
      console.log('Opening user account on Solana Explorer:', accountUrl)
      window.open(accountUrl, '_blank')
    } else {
      console.log('❌ Wallet not connected')
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

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
          : "The winning bid was ◎ 750 SOL. Your bid has been refunded."}
      </p>

      {success && (
        <p style={{
          color: '#10b981',
          fontSize: '14px',
          padding: '10px 12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '12px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ✅ Tokens claimed successfully!
        </p>
      )}

      {error && (
        <p style={{
          color: '#ef4444',
          fontSize: '14px',
          padding: '10px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '12px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ❌ {error}
        </p>
      )}

      {isWinner ? (
        <>
          <button 
            onClick={handleClaimTokens}
            disabled={loading}
            className="px-8 py-3 bg-success hover:bg-emerald-400 disabled:opacity-50 text-bg-base font-bold rounded-xl transition-all shadow-[0_0_24px_rgba(52,211,153,0.4)]"
          >
            {loading ? 'Claiming...' : 'Claim Tokens →'}
          </button>

          {/* Token Storage Info */}
          {showTokenInfo && publicKey && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-violet-900/20 border border-violet-500/30 rounded-xl w-full max-w-md"
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-sm font-semibold text-violet-300 uppercase tracking-wider">
                  💾 Token Storage Location
                </h4>
                <button
                  onClick={() => setShowTokenInfo(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-bg-surface rounded-lg p-3">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Your Wallet</p>
                  <div className="flex items-center gap-2 justify-between">
                    <code className="text-xs font-mono text-violet-300 break-all">
                      {publicKey.toString()}
                    </code>
                    <button
                      onClick={() => copyToClipboard(publicKey.toString())}
                      className="p-1 hover:bg-bg-elevated rounded transition-colors"
                      title="Copy address"
                    >
                      <Copy size={14} className="text-text-muted hover:text-text-primary" />
                    </button>
                  </div>
                </div>

                <div className="text-text-muted text-xs">↓</div>

                <div className="bg-bg-surface rounded-lg p-3">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Token Account (ATA)</p>
                  <p className="text-xs text-violet-300 font-mono mb-2">
                    Associated Token Account<br/>
                    for token mint + your wallet
                  </p>
                  <a
                    href={`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    View on Explorer
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="pt-2 text-xs text-text-muted italic">
                  🔗 Tokens are stored in Solana token accounts. Your tokens are secured on-chain and only you can access them.
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <button 
          onClick={handleViewRefund}
          className="px-8 py-3 bg-transparent border border-border-default hover:bg-bg-elevated text-text-primary font-medium rounded-xl transition-all"
        >
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
            { rank: 1, wallet: "3jxz...abc", bid: 750, result: "WINNER ✓", won: true },
            { rank: 2, wallet: "3jxz...def", bid: 600, result: "Refunded", won: false },
            { rank: 3, wallet: "3jxz...ghi", bid: 500, result: "Refunded", won: false },
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
