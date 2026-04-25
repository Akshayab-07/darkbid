import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { AUCTION_STATES } from "@/lib/constants"

export function ActivityFeed({ state }) {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (state !== AUCTION_STATES.BIDDING) return
    
    // Fake stream of network activities
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const fakeAddress = `0x...${Math.floor(Math.random()*16777215).toString(16).padEnd(4, '0')}`
        setActivities(prev => [{
          id: Date.now(),
          address: fakeAddress,
          time: "just now",
          text: "placed a sealed bid"
        }, ...prev].slice(0, 10))
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [state])

  // Initial loaded
  useEffect(() => {
    setActivities([
      { id: 1, address: "0x...f3a2", time: "2m ago", text: "placed a sealed bid" },
      { id: 2, address: "0x...1a2b", time: "5m ago", text: "created the auction" },
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
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-border-strong"></span>
                <span className="font-mono text-text-primary">{act.address}</span>
                <span>{act.text}</span>
              </div>
              <span className="text-text-muted">{act.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
