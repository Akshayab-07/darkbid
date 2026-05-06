import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import IDL from '../lib/darkbid.json'

// Program ID from Dev 2
// Deployed on Devnet at: 7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK
const PROGRAM_ID = new PublicKey('7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK')

export function useDarkBidProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()

  // Memoize program creation to avoid re-creation on every render
  const program = useMemo(() => {
    // Check basic requirements
    if (!wallet.publicKey) {
      return null
    }

    if (!connection) {
      return null
    }

    try {
      // Validate wallet adapter has required methods
      if (typeof wallet.signTransaction !== 'function') {
        console.error('❌ Wallet missing signTransaction method')
        return null
      }

      if (typeof wallet.sendTransaction !== 'function') {
        console.error('❌ Wallet missing sendTransaction method')
        return null
      }

      // Create provider
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )

      console.debug('✅ AnchorProvider initialized')
      console.debug('   Wallet:', wallet.publicKey.toString().slice(0, 8) + '...')
      
      // Create program instance
      const programInstance = new Program(IDL, PROGRAM_ID, provider)
      console.debug('✅ Program ready: commitBid method available')
      
      return programInstance
    } catch (err) {
      console.error('❌ Program initialization error:', err?.message)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Error details:', {
          walletKeys: Object.keys(wallet),
          hasSignTransaction: typeof wallet.signTransaction,
          hasSendTransaction: typeof wallet.sendTransaction,
          connectionRPC: connection.rpcEndpoint
        })
      }
      return null
    }
  }, [wallet.publicKey, wallet.signTransaction, wallet.sendTransaction, connection])

  return program
}
