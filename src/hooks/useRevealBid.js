import { useDarkBidProgram } from './useDarkBidProgram'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'

export function useRevealBid() {
  const program = useDarkBidProgram()
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function revealBid(auctionId) {
    if (!program || !publicKey) return

    // Retrieve saved bid data
    const saved = localStorage.getItem(`bid_nonce_${auctionId}`)
    if (!saved) throw new Error('No bid found to reveal')

    const { amount, nonce } = JSON.parse(saved)

    setLoading(true)
    setError(null)
    try {
      const tx = await program.methods
        .revealBid(amount, nonce)
        .accounts({
          auction: auctionId,
          bidder: publicKey,
        })
        .rpc()

      return tx
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { revealBid, loading, error }
}
