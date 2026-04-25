import { useState } from "react"
import { Button } from "@/components/ui/button"

export function RevealPanel({ onReveal, state }) {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => {
    setRevealed(true)
    onReveal()
  }

  return (
    <div className="bg-bg-surface border border-border-default shadow-raised rounded-2xl p-8 w-full flex flex-col items-center justify-center text-center">
      <h3 className="text-xl font-bold text-text-primary mb-4">Reveal Your Bid</h3>
      
      {revealed ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-success-bg border-2 border-success flex items-center justify-center text-success text-2xl font-bold mb-2 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
            ✓
          </div>
          <span className="text-success font-medium">Bid revealed successfully</span>
          <span className="text-sm text-text-muted">Waiting for all participants...</span>
        </div>
      ) : (
        <>
          <p className="text-text-secondary mb-8 max-w-sm">
            Click below to reveal your sealed bid. Your wallet will sign the reveal transaction.
          </p>
          <Button 
            onClick={handleReveal}
            className="w-full py-6 bg-success/10 border border-success/50 hover:bg-success/20 text-success hover:text-success font-bold text-lg rounded-xl shadow-[0_0_24px_rgba(52,211,153,0.1)] hover:shadow-[0_0_32px_rgba(52,211,153,0.25)] transition-all"
          >
            Reveal Bid Now →
          </Button>
        </>
      )}
    </div>
  )
}
