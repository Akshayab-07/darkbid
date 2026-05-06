import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import darkbidIdl from '../lib/darkbid.json'
import { ON_CHAIN_AUCTION } from '../lib/constants'

const PROGRAM_ID = new PublicKey(ON_CHAIN_AUCTION.PROGRAM_ID)
const AUCTION_PDA = new PublicKey(ON_CHAIN_AUCTION.PDA)

/**
 * ✅ Replace existing bid with a new bid
 * 
 * Workflow:
 * 1. Close old bid account (refund SOL to wallet)
 * 2. Generate new secret
 * 3. Place new bid
 */
export function useReplaceBid() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const replaceBid = async (newBidAmountSOL) => {
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
      console.log('🔄 Replacing bid...')
      console.log('  Old bid will be closed and refunded')
      console.log('  New bid amount:', newBidAmountSOL, 'SOL')

      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )

      // Step 1: Close old bid account
      console.log('📍 Deriving old bid PDA...')
      const [bidPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('bid'), AUCTION_PDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Old Bid PDA:', bidPDA.toString())

      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), AUCTION_PDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Old Escrow PDA:', escrowPDA.toString())

      // Check if bid exists
      const bidAccountInfo = await connection.getAccountInfo(bidPDA)
      if (!bidAccountInfo) {
        throw new Error('No existing bid found to replace')
      }

      // Check if escrow exists
      const escrowAccountInfo = await connection.getAccountInfo(escrowPDA)
      if (!escrowAccountInfo) {
        console.warn('⚠️ Escrow account does not exist yet (might be newly created)')
      }

      // Check if auction exists
      const auctionAccountInfo = await connection.getAccountInfo(AUCTION_PDA)
      if (!auctionAccountInfo) {
        throw new Error('Auction account not found')
      }

      console.log('📤 Step 1: Closing old bid account and refunding escrow...')
      console.log('  Bid account size:', bidAccountInfo.lamports, 'lamports')
      if (escrowAccountInfo) {
        console.log('  Escrow account size:', escrowAccountInfo.lamports, 'lamports')
      }
      
      // Try Anchor Program first, fallback to manual transaction building
      let program
      let refundTx
      let useAnchorProgram = true
      
      try {
        program = new Program(darkbidIdl, PROGRAM_ID, provider)
        
        refundTx = await program.methods
          .refund()
          .accounts({
            auction: AUCTION_PDA,
            bid: bidPDA,
            escrow: escrowPDA,
            bidder: wallet.publicKey,
          })
          .rpc()
          
        console.log('✅ Old bid closed and refunded (Anchor)!')
      } catch (anchorError) {
        console.warn('⚠️ Anchor refund failed, using manual transaction:', anchorError?.message)
        useAnchorProgram = false
        
        // Manual transaction building for refund
        try {
          const refundInstr = darkbidIdl.instructions.find(i => i.name === 'refund')
          if (!refundInstr) {
            throw new Error('refund instruction not found in IDL')
          }

          const discriminator = Buffer.from(refundInstr.discriminator)
          const instructionData = discriminator

          const instruction = new TransactionInstruction({
            programId: PROGRAM_ID,
            keys: [
              { pubkey: AUCTION_PDA, isSigner: false, isWritable: false },
              { pubkey: bidPDA, isSigner: false, isWritable: true },
              { pubkey: escrowPDA, isSigner: false, isWritable: true },
              { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            ],
            data: instructionData,
          })

          const { blockhash } = await connection.getLatestBlockhash()
          const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: wallet.publicKey,
          })

          tx.add(instruction)

          const signed = await wallet.signTransaction(tx)
          refundTx = await connection.sendRawTransaction(signed.serialize())
          await connection.confirmTransaction(refundTx, 'confirmed')
          
          console.log('✅ Old bid closed and refunded (Manual)!')
        } catch (manualError) {
          console.error('❌ Manual refund transaction failed:', manualError?.message)
          throw new Error(`Failed to close bid: ${manualError?.message}`)
        }
      }

      console.log('  Refund TX:', refundTx)

      // Step 2: Wait a moment for the account to be closed
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('📤 Step 2: Placing new bid...')
      
      // Generate new secret
      const newSecret = Math.floor(Math.random() * 1_000_000_000).toString()
      console.log('🔐 Generated new secret:', newSecret)

      // Generate hash
      const lamports = Math.floor(newBidAmountSOL * 1_000_000_000)
      
      // Hash generation (same as usePlaceBid)
      const amountBytes = new ArrayBuffer(8)
      const amountView = new DataView(amountBytes)
      amountView.setBigUint64(0, BigInt(Math.floor(lamports)), true)

      const secretNum = BigInt(newSecret)
      const secretBytes = new ArrayBuffer(8)
      const secretView = new DataView(secretBytes)
      secretView.setBigUint64(0, secretNum, true)

      const combined = new Uint8Array([
        ...new Uint8Array(amountBytes),
        ...new Uint8Array(secretBytes),
      ])

      const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
      const hash = new Uint8Array(hashBuffer)

      console.log('🔄 Generating SHA256 hash...')
      console.log('✅ Hash generated')

      // Place new bid using Anchor or manual fallback
      let newBidTx
      try {
        if (!program) {
          program = new Program(darkbidIdl, PROGRAM_ID, provider)
        }
        
        newBidTx = await program.methods
          .commitBid(hash, new BN(lamports))
          .accounts({
            auction: AUCTION_PDA,
            bid: bidPDA,
            escrow: escrowPDA,
            bidder: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
          
        console.log('✅ New bid placed successfully (Anchor)!')
      } catch (commitError) {
        console.warn('⚠️ Anchor commitBid failed, using manual transaction:', commitError?.message)
        
        // Manual transaction building for commitBid
        try {
          const commitBidInstr = darkbidIdl.instructions.find(i => i.name === 'commit_bid')
          if (!commitBidInstr) {
            throw new Error('commit_bid instruction not found in IDL')
          }

          const discriminator = Buffer.from(commitBidInstr.discriminator)
          const hashBuffer = Buffer.from(hash)
          const lamportsBuffer = Buffer.allocUnsafe(8)
          lamportsBuffer.writeBigUInt64LE(BigInt(lamports), 0)

          const instructionData = Buffer.concat([discriminator, hashBuffer, lamportsBuffer])

          const instruction = new TransactionInstruction({
            programId: PROGRAM_ID,
            keys: [
              { pubkey: AUCTION_PDA, isSigner: false, isWritable: false },
              { pubkey: bidPDA, isSigner: false, isWritable: true },
              { pubkey: escrowPDA, isSigner: false, isWritable: true },
              { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            data: instructionData,
          })

          const { blockhash } = await connection.getLatestBlockhash()
          const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: wallet.publicKey,
          })

          tx.add(instruction)

          const signed = await wallet.signTransaction(tx)
          newBidTx = await connection.sendRawTransaction(signed.serialize())
          await connection.confirmTransaction(newBidTx, 'confirmed')
          
          console.log('✅ New bid placed successfully (Manual)!')
        } catch (manualError) {
          console.error('❌ Manual commitBid transaction failed:', manualError?.message)
          throw new Error(`Failed to place new bid: ${manualError?.message}`)
        }
      }

      console.log('  New Bid TX:', newBidTx)
      console.log('  New secret (save this!):', newSecret)

      // Save new secret
      localStorage.setItem(`bid_secret_${AUCTION_PDA.toString()}`, JSON.stringify({
        secret: newSecret,
        amount: newBidAmountSOL,
        lamports,
        hash: Array.from(hash),
        txSignature: newBidTx,
        timestamp: Date.now()
      }))

      return { 
        refundTx, 
        newBidTx, 
        secret: newSecret, 
        lamports,
        hash 
      }
    } catch (err) {
      const errorMsg = err?.message || err?.toString() || 'Unknown error'
      console.error('❌ replaceBid failed:', errorMsg)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { replaceBid, loading, error }
}
