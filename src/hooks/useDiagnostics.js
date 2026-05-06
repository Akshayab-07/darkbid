import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useDarkBidProgram } from './useDarkBidProgram'

export function useDiagnostics() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const program = useDarkBidProgram()

  const checkStatus = () => {
    console.log('═══════════════════════════════════════')
    console.log('🔍 DARKBID INTEGRATION DIAGNOSTICS')
    console.log('═══════════════════════════════════════')
    
    console.log('\n📱 WALLET STATUS:')
    console.log('  Connected:', wallet.publicKey ? '✅ YES' : '❌ NO')
    if (wallet.publicKey) {
      console.log('  Address:', wallet.publicKey.toString())
    }
    console.log('  Has signTransaction:', wallet.signTransaction ? '✅ YES' : '❌ NO')
    console.log('  Has sendTransaction:', wallet.sendTransaction ? '✅ YES' : '❌ NO')

    console.log('\n🌐 CONNECTION STATUS:')
    console.log('  Ready:', connection ? '✅ YES' : '❌ NO')
    if (connection) {
      console.log('  Endpoint:', connection.rpcEndpoint)
      console.log('  Commitment:', connection.commitment)
    }

    console.log('\n⚙️  PROGRAM STATUS:')
    console.log('  Initialized:', program ? '✅ YES' : '❌ NO')
    if (program) {
      console.log('  Program ID:', program.programId.toString())
      console.log('  Has methods:', program.methods ? '✅ YES' : '❌ NO')
      if (program.methods) {
        console.log('  commitBid available:', program.methods.commitBid ? '✅ YES' : '❌ NO')
      }
    }

    console.log('\n📋 IDL CHECK:')
    try {
      const IDL = require('../lib/darkbid.json')
      console.log('  Loaded:', '✅ YES')
      console.log('  Instructions:', IDL.instructions?.length || 0)
      console.log('  Instructions:', IDL.instructions?.map(i => i.name).join(', '))
    } catch (e) {
      console.log('  Loaded:', '❌ NO')
      console.log('  Error:', e.message)
    }

    console.log('\n═══════════════════════════════════════')
  }

  return { checkStatus }
}
