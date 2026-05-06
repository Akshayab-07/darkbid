import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import darkbidIdl from '../lib/darkbid.json'
import { ON_CHAIN_AUCTION } from '../lib/constants'

const PROGRAM_ID = new PublicKey(ON_CHAIN_AUCTION.PROGRAM_ID)
// ✅ Use the real deployed auction PDA (hardcoded)
const AUCTION_PDA = new PublicKey(ON_CHAIN_AUCTION.PDA)

// ✅ Ensure IDL is properly typed
const idl = darkbidIdl

// ✅ Fetch all auction accounts from the blockchain
async function fetchAuctionAccounts(connection) {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          dataSize: 1024, // Approximate size for Auction account
        },
      ],
    })
    return accounts
  } catch (err) {
    console.error('Failed to fetch auction accounts:', err?.message)
    return []
  }
}

// ✅ REAL hash function — matches Rust contract exactly
async function generateCommitHash(amountInLamports, secretString) {
  // Validate inputs to prevent BigInt errors
  if (typeof amountInLamports !== 'number' || isNaN(amountInLamports) || amountInLamports < 0) {
    throw new Error(`Invalid amount: ${amountInLamports}. Must be a non-negative number.`)
  }

  if (!secretString || isNaN(secretString)) {
    throw new Error(`Invalid secret: ${secretString}. Must be a valid number string.`)
  }

  const encoder = new TextEncoder()

  // Convert amount to 8-byte little-endian (matches .to_le_bytes() in Rust)
  const amountBytes = new ArrayBuffer(8)
  const amountView = new DataView(amountBytes)
  amountView.setBigUint64(0, BigInt(Math.floor(amountInLamports)), true) // true = little-endian

  // Convert secret to 8-byte little-endian
  const secretNum = BigInt(secretString)
  const secretBytes = new ArrayBuffer(8)
  const secretView = new DataView(secretBytes)
  secretView.setBigUint64(0, secretNum, true)

  // SHA256(amountBytes + secretBytes)
  const combined = new Uint8Array([
    ...new Uint8Array(amountBytes),
    ...new Uint8Array(secretBytes),
  ])

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
  // Return as Uint8Array instead of plain array for Anchor compatibility
  return new Uint8Array(hashBuffer)
}

// ✅ Generate random secret key (save this — needed for reveal)
export function generateSecret() {
  const randomNum = Math.floor(Math.random() * 1_000_000_000)
  return randomNum.toString()
}

export function usePlaceBid() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0)

  const placeBid = async (auctionCreatorPublicKey, bidAmountSOL) => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected')
    }

    if (!wallet.publicKey) {
      throw new Error('Wallet public key not available')
    }

    if (!connection) {
      throw new Error('Connection not available')
    }

    // ✅ Validate bid amount - ensure it's a valid number
    if (!bidAmountSOL || isNaN(bidAmountSOL)) {
      throw new Error('Bid amount is required and must be a valid number')
    }

    // Convert to number if it's a string
    const bidAmount = parseFloat(bidAmountSOL)
    if (isNaN(bidAmount) || bidAmount <= 0) {
      throw new Error('Bid amount must be greater than 0')
    }

    setLoading(true)
    setError(null)

    try {
      // Validate IDL is loaded
      if (!idl || !idl.instructions) {
        throw new Error('IDL not properly loaded')
      }

      console.log('✅ IDL loaded:', idl.name)

      // Generate random secret
      const secret = generateSecret()
      console.log('🔐 Generated secret:', secret)

      console.log('📊 Provider setup - Connection:', !!connection, 'Wallet:', !!wallet, 'PublicKey:', wallet.publicKey?.toString())

      // Create provider using wallet adapter
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      )

      console.log('✅ Provider created successfully')

      // Initialize Anchor Program with comprehensive error handling and fallback
      console.log('🔧 Initializing Anchor Program...')
      let program
      let useAnchorProgram = true
      
      try {
        program = new Program(idl, PROGRAM_ID, provider)
        console.log('✅ Program initialized successfully')
      } catch (programError) {
        console.warn('⚠️ Anchor Program initialization failed, will use manual transaction building:', programError?.message)
        useAnchorProgram = false
      }

      // Convert SOL to lamports
      const lamports = Math.floor(bidAmount * 1_000_000_000)
      console.log('💰 Bid amount in lamports:', lamports)

      // ✅ Real hash — SHA256(amount_le_bytes + secret_le_bytes)
      console.log('🔄 Generating SHA256 hash...')
      const hash = await generateCommitHash(lamports, secret)
      console.log('✅ Hash generated:', hash.slice(0, 8), '...')

      // ✅ KEY FIX: Use the real deployed auction PDA (hardcoded)
      console.log('📡 Using deployed auction PDA...')
      const auctionPDA = AUCTION_PDA
      console.log('✅ Using on-chain auction PDA:', auctionPDA.toString())

      const [bidPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('bid'), auctionPDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Bid PDA:', bidPDA.toString())
      // ✅ Check if bid account already exists
      console.log('🔍 Checking if bid account already exists...')
      const bidAccountInfo = await connection.getAccountInfo(bidPDA)
      if (bidAccountInfo) {
        console.log('⚠️ Bid account already exists. This may cause "already in use" error.')
        console.log('   Account size:', bidAccountInfo.lamports, 'lamports')
        console.log('   To place a new bid, close the existing bid first or try on a new transaction.')
      } else {
        console.log('✅ Bid account does not exist yet - ready to create')
      }
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), auctionPDA.toBuffer(), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )
      console.log('📍 Escrow PDA:', escrowPDA.toString())

      // Submit transaction
      console.log('📤 Submitting transaction...')
      console.log('  Hash type:', hash.constructor.name, 'Hash length:', hash.length)
      console.log('  Lamports:', lamports, 'Type:', typeof lamports)
      console.log('  Accounts:', {
        auction: auctionPDA.toString(),
        bid: bidPDA.toString(),
        escrow: escrowPDA.toString(),
        bidder: wallet.publicKey.toString(),
        systemProgram: SystemProgram.programId.toString()
      })

      // Validate inputs one more time
      if (!(hash instanceof Uint8Array)) {
        throw new Error(`Invalid hash type: expected Uint8Array, got ${hash.constructor.name}`)
      }
      if (hash.length !== 32) {
        throw new Error(`Invalid hash length: expected 32, got ${hash.length}`)
      }
      if (typeof lamports !== 'number' || !Number.isInteger(lamports)) {
        throw new Error(`Invalid lamports: expected integer, got ${typeof lamports}`)
      }

      // Final validation before RPC
      if (!wallet.connected) {
        throw new Error('Wallet disconnected during execution')
      }

      if (!wallet.publicKey) {
        throw new Error('Wallet public key lost during execution')
      }

      // Validate lamports is a safe integer
      if (!Number.isSafeInteger(lamports)) {
        throw new Error(`Lamports value ${lamports} is not a safe integer`)
      }

      // Build and send transaction using Anchor Program or manual fallback
      console.log('📤 Building transaction...')

      // Final validation before RPC
      if (!wallet.connected) {
        throw new Error('Wallet disconnected during execution')
      }

      if (!wallet.publicKey) {
        throw new Error('Wallet public key lost during execution')
      }

      // Validate lamports is a safe integer
      if (!Number.isSafeInteger(lamports)) {
        throw new Error(`Lamports value ${lamports} is not a safe integer`)
      }

      let tx
      
      if (useAnchorProgram && program) {
        // Path 1: Use Anchor Program (preferred, handles discriminator automatically)
        console.log('  📝 Using Anchor Program methods...')
        console.log('  ℹ️ Anchor will automatically compute and use the correct discriminator')
        try {
          tx = await program.methods
            .commitBid(hash, new BN(lamports))
            .accounts({
              auction: auctionPDA,
              bid: bidPDA,
              escrow: escrowPDA,
              bidder: wallet.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc()

          console.log('✅ Transaction successful!')
          console.log('  TX:', tx)
          console.log('  Secret (save this!):', secret)

          // Save secret locally for reveal phase
          localStorage.setItem(`bid_secret_${auctionCreatorPublicKey}`, JSON.stringify({
            secret,
            amount: bidAmountSOL,
            lamports,
            hash: Array.from(hash),
            txSignature: tx,
            timestamp: Date.now()
          }))

          return { tx, hash, lamports, secret }
        } catch (rpcError) {
          console.error('❌ Anchor Program RPC failed:', rpcError?.message)
          throw rpcError
        }
      } else {
        // Path 2: Manual transaction building (fallback)
        console.log('  📝 Using manual transaction building...')
        
        // Get commit_bid discriminator from IDL
        const commitBidInstr = idl.instructions.find(i => i.name === 'commit_bid')
        if (!commitBidInstr) {
          throw new Error('commit_bid instruction not found in IDL')
        }

        // Use discriminator directly from IDL
        const discriminator = Buffer.from(commitBidInstr.discriminator)
        
        console.log('  ℹ️ Discriminator (hex):', discriminator.toString('hex'))
        console.log('  ℹ️ Discriminator (decimal):', Array.from(discriminator).join(', '))
        
        const hashBuffer = Buffer.from(hash)
        const lamportsBuffer = Buffer.allocUnsafe(8)
        lamportsBuffer.writeBigUInt64LE(BigInt(lamports), 0)

        const instructionData = Buffer.concat([discriminator, hashBuffer, lamportsBuffer])
        console.log('  ✅ Instruction data built (total length:', instructionData.length + ')')

        // Create instruction with correct accounts: auction, bid, escrow, bidder, system_program
        const instruction = new TransactionInstruction({
          programId: PROGRAM_ID,
          keys: [
            { pubkey: auctionPDA, isSigner: false, isWritable: false },
            { pubkey: bidPDA, isSigner: false, isWritable: true },
            { pubkey: escrowPDA, isSigner: false, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data: instructionData,
        })

        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash()
        console.log('  ✅ Blockhash:', blockhash)

        // Create transaction
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: wallet.publicKey,
        }).add(instruction)

        console.log('  ✅ Transaction created')

        // Sign and send
        try {
          console.log('  🔐 Requesting wallet signature...')
          const signed = await wallet.signTransaction(transaction)
          console.log('  ✅ Transaction signed')

          console.log('  📡 Sending raw transaction...')
          tx = await connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          })
          console.log('  ✅ Transaction sent:', tx)

          // Wait for confirmation
          console.log('  ⏳ Waiting for confirmation...')
          await connection.confirmTransaction(tx, 'confirmed')
          console.log('  ✅ Transaction confirmed')

          console.log('✅ Transaction successful!')
          console.log('  TX:', tx)
          console.log('  Secret (save this!):', secret)

          // Save secret locally for reveal phase
          localStorage.setItem(`bid_secret_${auctionCreatorPublicKey}`, JSON.stringify({
            secret,
            amount: bidAmountSOL,
            lamports,
            hash: Array.from(hash),
            txSignature: tx,
            timestamp: Date.now()
          }))

          return { tx, hash, lamports, secret }
        } catch (txError) {
          console.error('❌ Manual transaction failed:', txError?.message)
          throw txError
        }
      }

      console.log('✅ Transaction successful!')
      console.log('  TX:', tx)
      console.log('  Secret (save this!):', secret)

      // Save secret locally for reveal phase
      localStorage.setItem(`bid_secret_${auctionCreatorPublicKey}`, JSON.stringify({
        secret,
        amount: bidAmountSOL,
        lamports,
        hash: Array.from(hash), // Convert Uint8Array to array for JSON serialization
        txSignature: tx,
        timestamp: Date.now()
      }))

      // ✅ Trigger balance refresh in parent component
      setBalanceRefreshTrigger(prev => prev + 1)

      return { tx, hash, lamports, secret, balanceRefreshTrigger }
    } catch (err) {
      const errorMsg = err?.message || err?.toString() || 'Failed to place bid'
      
      // Check for "already in use" error
      if (errorMsg.includes('already in use') || errorMsg.includes('0x0')) {
        console.error('❌ Bid account already exists!')
        console.error('   This means you already have an active bid for this auction.')
        console.error('   ')
        console.error('   ℹ️ To bid again:')
        console.error('   1. Reveal your current bid during the reveal phase')
        console.error('   2. Or wait for a new auction')
        console.error('   3. Or use a different wallet')
        console.error('   ')
        console.error('   Transaction log:', err?.logs || 'Check browser console')
      }
      
      // Check if it's the InstructionFallbackNotFound error
      if (errorMsg.includes('InstructionFallbackNotFound') || errorMsg.includes('0x65')) {
        console.error('❌ Instruction not recognized by contract!')
        console.error('   This usually means:')
        console.error('   1. The IDL (darkbid.json) does not match the deployed contract')
        console.error('   2. The instruction discriminator is wrong')
        console.error('   3. The contract was deployed with different code')
        console.error('')
        console.error('   Please verify:')
        console.error('   - The IDL matches the deployed contract on', PROGRAM_ID.toString())
        console.error('   - The contract has a commit_bid instruction')
        console.error('   - Check the contract source code or transaction history')
      }
      
      console.error('❌ placeBid failed:', errorMsg)
      console.error('  Full error:', err)
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { placeBid, loading, error, triggerBalanceRefresh: () => setBalanceRefreshTrigger(prev => prev + 1) }
}
