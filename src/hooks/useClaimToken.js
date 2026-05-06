import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useToast } from '@/components/ui/use-toast'

export function useClaimToken() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [txSignature, setTxSignature] = useState(null)
  const [error, setError] = useState(null)

  const claimToken = useCallback(
    async (programId, auctionAddress, authorityAddress) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        toast({
          title: 'Wallet not connected',
          description: 'Please connect your wallet to claim tokens.',
          variant: 'destructive',
        })
        return
      }

      setLoading(true)
      setError(null)
      setTxSignature(null)

      try {
        // Get the IDL from your contract
        const idl = await anchor.Program.fetchIdl(new PublicKey(programId), new anchor.AnchorProvider(connection, wallet, {}))

        if (!idl) {
          throw new Error('Could not fetch program IDL')
        }

        // Create provider and program
        const provider = new anchor.AnchorProvider(connection, wallet, {
          commitment: 'confirmed',
        })
        const program = new anchor.Program(idl, programId, provider)

        // Get auction account
        const auctionPubkey = new PublicKey(auctionAddress)
        const auctionAccount = await program.account.auction.fetch(auctionPubkey)

        // Get or create token account for winner
        const mint = new PublicKey(auctionAccount.mint)
        const winnerTokenAccount = await anchor.utils.token.associatedAddress({
          mint: mint,
          owner: wallet.publicKey,
        })

        // Build the claim transaction
        const tx = await program.methods
          .claimToken()
          .accountsStrict({
            auction: auctionPubkey,
            mint: mint,
            winnerTokenAccount: winnerTokenAccount,
            winner: wallet.publicKey,
            authority: new PublicKey(authorityAddress),
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          })
          .transaction()

        // Set recent blockhash
        const { blockhash } = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash
        tx.feePayer = wallet.publicKey

        // Sign and send
        const signedTx = await wallet.signTransaction(tx)
        const rawTransaction = signedTx.serialize()

        const signature = await connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed')

        setTxSignature(signature)

        toast({
          title: 'Success!',
          description: 'Tokens claimed successfully! Check your wallet.',
        })

        return signature
      } catch (err) {
        const errorMessage = err?.message || 'Failed to claim tokens'
        setError(errorMessage)

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })

        console.error('Claim token error:', err)
      } finally {
        setLoading(false)
      }
    },
    [wallet, connection, toast]
  )

  return {
    claimToken,
    loading,
    txSignature,
    error,
  }
}
