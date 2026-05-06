import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useState, useEffect } from 'react'

// ✅ Optionally pass a refreshTrigger to force balance refetch after transactions
export function useWalletInfo(refreshTrigger = 0) {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If no wallet connected, skip
    if (!publicKey || !connected) {
      setBalance(0)
      return
    }

    setLoading(true)

    // Fetch balance from Solana
    connection
      .getBalance(publicKey)
      .then(lamports => {
        // Solana uses "lamports" — 1 SOL = 1,000,000,000 lamports
        const solBalance = lamports / LAMPORTS_PER_SOL
        console.log('💰 Wallet balance updated:', solBalance.toFixed(4), 'SOL')
        setBalance(solBalance)
      })
      .catch(err => console.error('Balance fetch failed:', err))
      .finally(() => setLoading(false))

  }, [publicKey, connected, connection, refreshTrigger])

  return {
    address: publicKey?.toString() ?? null,
    shortAddress: publicKey
      ? `${publicKey.toString().slice(0,4)}...${publicKey.toString().slice(-4)}`
      : null,
    balance,
    connected,
    loading
  }
}
