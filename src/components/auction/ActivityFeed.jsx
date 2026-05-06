import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { AUCTION_STATES } from "@/lib/constants"

export function ActivityFeed({ state }) {
  const { publicKey } = useWallet()
  const [activities, setActivities] = useState([])

  // Periodic check for user's bid updates (every 500ms for faster detection)
  useEffect(() => {
    if (!publicKey) {
      console.log('⏳ ActivityFeed: Waiting for publicKey...')
      return
    }

    console.log('✅ ActivityFeed: publicKey available:', publicKey.toString())
    
    const checkInterval = setInterval(() => {
      const auctionId = window.location.pathname.split('/').pop()
      const bidKey = `bid_nonce_${auctionId}`
      const savedBid = localStorage.getItem(bidKey)
      
      if (savedBid) {
        try {
          const bidData = JSON.parse(savedBid)
          const userAddress = publicKey.toString()
          const shortAddress = userAddress.slice(0, 4) + '...' + userAddress.slice(-4)
          const bidKey = `${auctionId}-${bidData.amount}`
          
          setActivities(prev => {
            const hasThisBid = prev.some(a => a.id === `user-${bidKey}`)
            if (hasThisBid) {
              console.log('ℹ️  Bid already in activity feed')
              return prev
            }
            
            console.log('✅ NEW USER BID DETECTED!')
            console.log('   Address:', shortAddress)
            console.log('   Amount:', bidData.amount, 'SOL')
            
            return [{
              id: `user-${bidKey}`,
              address: shortAddress,
              time: "just now",
              text: "placed a sealed bid",
              isUser: true,
              amount: bidData.amount
            }, ...prev].slice(0, 10)
          })
        } catch (e) {
          console.error('❌ Error parsing bid data:', e)
        }
      }
    }, 500)  // Check more frequently
    
    return () => clearInterval(checkInterval)
  }, [publicKey])

  useEffect(() => {
    if (state !== AUCTION_STATES.BIDDING) return
    
    // Fake stream of network activities (less frequently)
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const fakeAddress = `3jxz...${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`
        setActivities(prev => [{
          id: Date.now(),
          address: fakeAddress,
          time: "just now",
          text: "placed a sealed bid"
        }, ...prev].slice(0, 10))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [state])

  // Initial loaded
  useEffect(() => {
    setActivities([
      { id: 1, address: "3jxz...f3a2", time: "2m ago", text: "placed a sealed bid" },
      { id: 2, address: "3jxz...1a2b", time: "5m ago", text: "created the auction" },
    ])
  }, [])

  return (
    <div className="w-full mt-12 bg-bg-surface border border-border-default rounded-2xl p-6 text-sm">
      <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-violet-400"></span> Live Activity
      </h3>
      
      <div className="flex flex-col gap-3 overflow-hidden" style={{ minHeight: '120px' }}>
        <AnimatePresence>
          {activities.map(act => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-between items-center text-text-secondary py-1"
              style={act.isUser ? {
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                padding: '8px 10px',
                borderRadius: '6px',
                borderLeft: '2px solid rgba(139, 92, 246, 0.5)'
              } : {}}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: act.isUser ? '#a78bfa' : 'var(--border-strong)'}}></span>
                <span className="font-mono" style={{color: act.isUser ? '#c4b5fd' : 'var(--text-primary)'}}>{act.address}</span>
                <span>{act.text}</span>
                {act.amount && <span style={{color: '#a78bfa', fontWeight: '600'}}>({act.amount} SOL)</span>}
              </div>
              <span className="text-text-muted">{act.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
