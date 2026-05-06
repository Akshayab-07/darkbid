import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import IDL from '../lib/darkbid.json'

// Darkbid Program ID on Devnet
const PROGRAM_ID = new PublicKey('7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK')

export function useDarkBidProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()

  if (!wallet.publicKey) return null

  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  )

  try {
    return new Program(IDL, PROGRAM_ID, provider)
  } catch (err) {
    console.error('Failed to initialize program:', err)
    return null
  }
}
