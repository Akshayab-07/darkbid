import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import idl from '../lib/darkbid.json'

const PROGRAM_ID = new PublicKey('7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK')

export function useRefund() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const claimRefund = async (auctionCreatorPublicKey) => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected')
    }

    if (!connection) {
      throw new Error('Connection not available')
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Claiming refund...')

      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )
      const program = new Program(idl, PROGRAM_ID, provider)

      const auctionCreator = new PublicKey(auctionCreatorPublicKey)

      const [auctionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('auction'), auctionCreator.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Auction PDA:', auctionPDA.toString())

      const [bidPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('bid'), auctionPDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Bid PDA:', bidPDA.toString())

      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), auctionPDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Escrow PDA:', escrowPDA.toString())

      console.log('📤 Submitting refund transaction...')
      const tx = await program.methods
        .refund()
        .accounts({
          auction: auctionPDA,
          bid: bidPDA,
          escrow: escrowPDA,
          bidder: wallet.publicKey,
        })
        .rpc()

      console.log('✅ Refund successful!')
      console.log('  TX:', tx)

      return { tx }
    } catch (err) {
      const errorMsg = err?.message || err?.toString() || 'Unknown error'
      console.error('❌ claimRefund failed:', errorMsg)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { claimRefund, loading, error }
}
