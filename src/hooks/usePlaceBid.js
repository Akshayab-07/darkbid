import { useDarkBidProgram } from './useDarkBidProgram'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'

// Simple hash function for the bid
// Dev 3 will replace this with proper Pedersen hash
async function hashBid(amount, nonce) {
  const data = `${amount}:${nonce}`
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
}

export function usePlaceBid() {
  const program = useDarkBidProgram()
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txHash, setTxHash] = useState(null)

  async function placeBid(auctionId, bidAmount) {
    if (!program || !publicKey) return

    setLoading(true)
    setError(null)

    try {
      // Generate random nonce for this bid
      const nonce = Math.floor(Math.random() * 1000000)

      // Hash the bid (keeps it secret)
      const hashedBid = await hashBid(bidAmount, nonce)

      // Save nonce locally so user can reveal later
      localStorage.setItem(
        `bid_nonce_${auctionId}`,
        JSON.stringify({ amount: bidAmount, nonce })
      )

      // Call the smart contract
      const tx = await program.methods
        .commitBid(hashedBid, bidAmount)
        .accounts({
          auction: auctionId,
          bidder: publicKey,
          // Dev 2 will fill in remaining accounts
        })
        .rpc()

      setTxHash(tx)
      return tx

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { placeBid, loading, error, txHash }
}
