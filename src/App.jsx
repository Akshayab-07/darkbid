import { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Solana wallet imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { clusterApiUrl } from '@solana/web3.js'

// Wallet UI default styles (override with our own)
import '@solana/wallet-adapter-react-ui/styles.css'
import './styles/globals.css'

// Layout components
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ROUTES } from './lib/constants'

// Pages
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Launch from './pages/Launch'
import Auction from './pages/Auction'

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path={ROUTES.HOME} element={<Landing />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.LAUNCH} element={<Launch />} />
        <Route path={ROUTES.AUCTION} element={<Auction />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg-base text-text-secondary">
        <Navbar />
        <main className="flex-1 mt-20">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default function App() {
  // DEVNET = fake Solana with fake money
  // Change to 'mainnet-beta' only when going live
  const endpoint = clusterApiUrl('devnet')

  // List of wallets your app supports
  // Only Phantom for now — can add more later
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  )

  return (
    // Layer 1: Solana network connection
    <ConnectionProvider endpoint={endpoint}>

      {/* Layer 2: Wallet state management */}
      <WalletProvider wallets={wallets} autoConnect>

        {/* Layer 3: The connect wallet modal UI */}
        <WalletModalProvider>

          {/* Layer 4: Your app with routing */}
          <AppContent />

        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
