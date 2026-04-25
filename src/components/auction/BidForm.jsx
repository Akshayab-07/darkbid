import { useWalletInfo } from '../../hooks/useWalletInfo'
import { useState } from 'react'
import { WalletButton } from '../shared/WalletButton'

export function BidForm({ reservePrice = 0 }) {
  const { connected, balance, shortAddress } = useWalletInfo()
  const [bidAmount, setBidAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validateBid(value) {
    if (!value || parseFloat(value) <= 0) {
      setError('Please enter a bid amount')
      return false
    }
    if (parseFloat(value) < reservePrice) {
      setError(`Bid must be at least ${reservePrice} USDC`)
      return false
    }
    if (parseFloat(value) > balance) {
      setError('Insufficient balance')
      return false
    }
    setError('')
    return true
  }

  function handleSubmit() {
    if (!validateBid(bidAmount)) return
    
    setLoading(true)
    // TODO: call smart contract in Phase 7
    console.log('Submitting bid:', bidAmount)
    
    setTimeout(() => {
      setLoading(false)
      setBidAmount('')
    }, 2000)
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
        <label>Amount (USDC)</label>
        <input
          type="number"
          className="bid-input mono"
          placeholder="0.00"
          value={bidAmount}
          onChange={e => setBidAmount(e.target.value)}
          min={reservePrice}
          disabled={loading}
        />
        <span className="bid-form__balance mono">
          Balance: {balance.toFixed(2)} SOL
        </span>
      </div>

      {error && (
        <p className="bid-form__error">{error}</p>
      )}

      <button
        className="bid-submit-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Sealed Bid'}
      </button>

      <p className="bid-form__disclaimer">
        Your bid is sealed immediately after submission.
        You cannot change it.
      </p>
    </div>
  )
}
