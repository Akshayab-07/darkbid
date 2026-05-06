import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import idl from '../lib/darkbid.json'
import { ON_CHAIN_AUCTION } from '../lib/constants'

const PROGRAM_ID = new PublicKey(ON_CHAIN_AUCTION.PROGRAM_ID)
const AUCTION_PDA = new PublicKey(ON_CHAIN_AUCTION.PDA)

/**
 * ✅ Claim tokens after winning auction
 * 
 * Tokens are transferred from the auction escrow to the winner's token account
 */
export function useClaimTokens() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const claimTokens = async () => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected')
    }

    if (!wallet.publicKey) {
      throw new Error('Wallet public key not available')
    }

    if (!connection) {
      throw new Error('Connection not available')
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🏆 Claiming tokens...')
      console.log('  - Winner:', wallet.publicKey.toString())

      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )
      const program = new Program(idl, PROGRAM_ID, provider)

      // ✅ Use hardcoded auction PDA
      console.log('📍 Auction PDA:', AUCTION_PDA.toString())

      // Derive vault PDA (where tokens are held)
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), AUCTION_PDA.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Vault PDA (token source):', vaultPDA.toString())

      // Derive winner's token account (destination)
      // For now, assume an Associated Token Account (ATA)
      // In production, you'd derive this properly or create it
      const [winnerTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('winner_token'), AUCTION_PDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Winner token account:', winnerTokenAccountPDA.toString())

      console.log('📤 Submitting claim transaction...')
      
      // Call the claim_tokens instruction
      const tx = await program.methods
        .claimTokens()
        .accounts({
          auction: AUCTION_PDA,
          vault: vaultPDA,
          winnerTokenAccount: winnerTokenAccountPDA,
          winner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('✅ Tokens claimed successfully!')
      console.log('  TX:', tx)
      console.log('  💰 Tokens transferred to:', winnerTokenAccountPDA.toString())

      return { tx }
    } catch (err) {
      const errorMsg = err?.message || err?.toString() || 'Unknown error'
      console.error('❌ claimTokens failed:', errorMsg)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { claimTokens, loading, error }
}
