import { PublicKey } from '@solana/web3.js'

const PROGRAM_ID = new PublicKey('7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK')

/**
 * Derive the Auction PDA for a given auction ID
 * @param {string|PublicKey} auctionId - The auction identifier (as string or PublicKey)
 * @returns {object} {pda: PublicKey, bump: number}
 */
export function deriveAuctionPDA(auctionId) {
  try {
    const seed = typeof auctionId === 'string' ? auctionId : auctionId.toString()
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('auction'), Buffer.from(seed)],
      PROGRAM_ID
    )
    console.log('📍 Derived Auction PDA:', pda.toString(), 'bump:', bump)
    return { pda, bump }
  } catch (error) {
    console.error('❌ Error deriving auction PDA:', error)
    throw error
  }
}

/**
 * Derive the Bid PDA for a given auction and bidder
 * @param {PublicKey} auctionPDA - The auction PDA
 * @param {PublicKey} bidderPublicKey - The bidder's public key
 * @returns {object} {pda: PublicKey, bump: number}
 */
export function deriveBidPDA(auctionPDA, bidderPublicKey) {
  try {
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('bid'), auctionPDA.toBuffer(), bidderPublicKey.toBuffer()],
      PROGRAM_ID
    )
    console.log('📍 Derived Bid PDA:', pda.toString(), 'bump:', bump)
    return { pda, bump }
  } catch (error) {
    console.error('❌ Error deriving bid PDA:', error)
    throw error
  }
}

/**
 * Derive the Escrow PDA for a given auction (for later use)
 * @param {PublicKey} auctionPDA - The auction PDA
 * @returns {object} {pda: PublicKey, bump: number}
 */
export function deriveEscrowPDA(auctionPDA) {
  try {
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), auctionPDA.toBuffer()],
      PROGRAM_ID
    )
    console.log('📍 Derived Escrow PDA:', pda.toString(), 'bump:', bump)
    return { pda, bump }
  } catch (error) {
    console.error('❌ Error deriving escrow PDA:', error)
    throw error
  }
}

/**
 * Convert SOL amount to lamports (1 SOL = 1e9 lamports)
 * @param {number} sol - Amount in SOL
 * @returns {bigint} Amount in lamports
 */
export function solToLamports(sol) {
  return BigInt(Math.floor(sol * 1e9))
}

/**
 * Convert lamports to SOL (1e9 lamports = 1 SOL)
 * @param {number|bigint} lamports - Amount in lamports
 * @returns {number} Amount in SOL
 */
export function lamportsToSol(lamports) {
  return Number(BigInt(lamports)) / 1e9
}
