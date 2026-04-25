import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useState } from 'react'

// Shortens wallet address: "AbCd...XyZ1"
function shortenAddress(address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDropdown, setShowDropdown] = useState(false)

  // LOADING STATE — wallet is connecting
  if (connecting) {
    return (
      <button className="wallet-btn wallet-btn--loading" disabled>
        Connecting...
      </button>
    )
  }

  // NOT CONNECTED — show connect button
  if (!connected) {
    return (
      <button
        className="wallet-btn wallet-btn--connect"
        onClick={() => setVisible(true)}
      >
        Connect Wallet
      </button>
    )
  }

  // CONNECTED — show address with disconnect option
  return (
    <div className="wallet-connected">
      <button
        className="wallet-btn wallet-btn--connected"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="wallet-dot" />
        {shortenAddress(publicKey.toString())}
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <p className="wallet-full-address">
            {publicKey.toString()}
          </p>
          <button
            className="wallet-disconnect"
            onClick={() => { disconnect(); setShowDropdown(false) }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
