import { useWalletInfo } from '../../hooks/useWalletInfo'
import { usePlaceBid } from '../../hooks/usePlaceBid'
import { useState, useEffect } from 'react'
import { WalletButton } from '../shared/WalletButton'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { ON_CHAIN_AUCTION } from '../../lib/constants'

export function BidForm({ reservePrice = 0, auctionId = null, auctionCreatorAddress = null }) {
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0)
  const { connected, balance, shortAddress } = useWalletInfo(balanceRefreshTrigger)
  const { placeBid, loading, error: hookError, triggerBalanceRefresh } = usePlaceBid()
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  
  const [bidAmount, setBidAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [txSignature, setTxSignature] = useState(null)
  const [hasExistingBid, setHasExistingBid] = useState(false)
  const [checkingBid, setCheckingBid] = useState(false)

  // Check if user already has a bid
  useEffect(() => {
    if (!publicKey || !connection || !connected) return

    const checkBid = async () => {
      try {
        setCheckingBid(true)
        const PROGRAM_ID = new PublicKey(ON_CHAIN_AUCTION.PROGRAM_ID)
        const AUCTION_PDA = new PublicKey(ON_CHAIN_AUCTION.PDA)

        const [bidPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('bid'), AUCTION_PDA.toBuffer(), publicKey.toBuffer()],
          PROGRAM_ID
        )

        const bidAccountInfo = await connection.getAccountInfo(bidPDA)
        setHasExistingBid(!!bidAccountInfo)
        
        if (bidAccountInfo) {
          console.log('ℹ️ Existing bid found for this wallet')
        }
      } catch (err) {
        console.error('Error checking bid:', err)
      } finally {
        setCheckingBid(false)
      }
    }

    checkBid()
  }, [publicKey, connection, connected])

  function validateBid(value) {
    if (!value || parseFloat(value) <= 0) {
      setError('Please enter a bid amount')
      return false
    }
    if (parseFloat(value) < reservePrice) {
      setError(`Bid must be at least ${reservePrice} SOL`)
      return false
    }
    if (parseFloat(value) > balance) {
      setError('Insufficient balance')
      return false
    }
    setError('')
    return true
  }

  async function handleSubmit() {
    console.log('🔘 Bid button clicked')
    console.log('   Has existing bid:', hasExistingBid)
    console.log('   Wallet connected:', connected)
    console.log('   Bid amount:', bidAmount)
    setSuccess(false)
    setTxSignature(null)
    
    if (hasExistingBid) {
      const msg = 'You have already placed a bid for this auction. Refunds are available after the auction ends.'
      console.log('❌', msg)
      setError(msg)
      return
    }
    
    if (!validateBid(bidAmount)) {
      console.log('❌ Validation failed')
      return
    }
    
    if (!auctionCreatorAddress) {
      const msg = 'Auction creator address not available'
      console.error('❌', msg)
      setError(msg)
      return
    }

    try {
      const amount = parseFloat(bidAmount)
      
      // Place new bid
      console.log('📝 Submitting new bid...')
      const result = await placeBid(auctionCreatorAddress, amount)
      console.log('✅ Bid placed successfully:', result)
      
      setTxSignature(result.tx)
      setBidAmount('')
      setError('')
      setSuccess(true)
      setHasExistingBid(true) // Now has a bid
      
      // Refresh balance after successful bid
      setBalanceRefreshTrigger(prev => prev + 1)
      
      // Hide success message after 6 seconds
      setTimeout(() => setSuccess(false), 6000)
    } catch (err) {
      const errorMsg = err?.reason || err?.message || err?.toString() || 'Failed to place bid'
      console.error('❌ Error:', errorMsg)
      setError(errorMsg)
    }
  }

  // Not connected state
  if (!connected) {
    return (
      <div className="bid-form">
        <div className="bid-form__header">
          <span>Connect Your Wallet to Bid</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <WalletButton />
        </div>
      </div>
    )
  }

  return (
    <div className="bid-form">
      <div className="bid-form__header">
        <span>Place Your Bid</span>
        <span className="mono">{shortAddress}</span>
      </div>

      <div className="bid-form__input-group">
        <label>Amount (SOL)</label>
        <input
          type="number"
          className="bid-input mono"
          placeholder="0.00"
          value={bidAmount}
          onChange={e => setBidAmount(e.target.value)}
          min={reservePrice}
          disabled={loading}
          step="0.1"
        />
        <span className="bid-form__balance mono">
          Balance: {balance.toFixed(2)} SOL
        </span>
      </div>

      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '13px',
          padding: '10px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '12px'
        }}>
          ❌ {error.includes('already in use') || error.includes('already placed') ? (
            <>
              {error}<br/>
              <span style={{fontSize: '11px', opacity: 0.8}}>
                Reload the page if the status doesn't update.
              </span>
            </>
          ) : (
            <>
              Transaction failed<br/>
              <span style={{fontSize: '11px', opacity: 0.8}}>Check browser console (F12) for details</span>
            </>
          )}
        </div>
      )}

      {hookError && !error && (
        <div style={{
          color: '#ef4444',
          fontSize: '13px',
          padding: '8px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '12px'
        }}>
          ❌ Transaction failed<br/>
          <span style={{fontSize: '11px', opacity: 0.8}}>Check browser console (F12) for details</span>
        </div>
      )}

      {success && (
        <div style={{
          color: '#10b981',
          fontSize: '14px',
          padding: '10px 12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '12px',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ✅ Bid sealed on-chain!
          {txSignature && (
            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>
              Tx: {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
              <br />
              <a 
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#10b981', textDecoration: 'underline', cursor: 'pointer' }}
              >
                View on Solana Explorer ↗
              </a>
            </div>
          )}
          <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7, fontStyle: 'italic' }}>
            💰 Bid funds held securely in escrow<br/>
            🔒 Sealed until reveal phase
          </div>
        </div>
      )}

      <button
        className="bid-submit-btn"
        onClick={handleSubmit}
        disabled={loading || checkingBid || hasExistingBid}
        title={
          checkingBid ? 'Checking existing bid...' :
          hasExistingBid ? 'You have already placed a bid for this auction' : 
          loading ? 'Processing bid...' :
          'Submit sealed bid to auction'
        }
      >
        {checkingBid ? 'Checking...' :
         loading ? 'Processing...' : 
         hasExistingBid ? '✓ Bid Already Placed' : 'Submit Sealed Bid'}
      </button>

      {hasExistingBid && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '6px',
          padding: '10px',
          marginTop: '12px',
          fontSize: '12px',
          color: '#93c5fd'
        }}>
          ℹ️ You have already placed a bid for this auction<br/>
          <span style={{opacity: 0.8}}>Refunds are available after the auction ends</span>
        </div>
      )}

      <p className="bid-form__disclaimer">
        {hasExistingBid ? (
          <>
            Your bid has been placed. You cannot submit another bid for this auction.
            <br />
            <span style={{fontSize: '12px', opacity: 0.7, marginTop: '4px', display: 'block'}}>
              💡 Keep this tab open during the reveal phase to reclaim your bid after auction ends.
            </span>
          </>
        ) : (
          <>
            Your bid is hashed and sealed immediately after submission.
            You can only place one bid per auction.
            <br />
            <span style={{fontSize: '12px', opacity: 0.7, marginTop: '4px', display: 'block'}}>
              💡 Keep this tab open during the reveal phase to reclaim your bid.
            </span>
          </>
        )}
      </p>
    </div>
  )
}
