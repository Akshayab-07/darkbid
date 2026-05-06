export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LAUNCH: '/launch',
  AUCTION: '/auction/:id',
}

export const AUCTION_STATES = {
  BIDDING: 'BIDDING',
  REVEAL: 'REVEAL',
  CALCULATING: 'CALCULATING',
  CLOSED: 'CLOSED'
}

// ✅ On-chain Auction Configuration (Devnet)
export const ON_CHAIN_AUCTION = {
  // The initialized auction PDA on-chain
  PDA: '9hvsG7Xhf4xbDJ4ycTymXbE9ENMYqE3gWd7Q4UrLzR69',
  
  // Authority (creator) who initialized the auction
  AUTHORITY: '6DiYfkZTKvwGe28oLvS9qidRtdsSHcQpCdCts1spGjbX',
  
  // Program ID
  PROGRAM_ID: '7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK',
  
  // Reserve price in SOL
  RESERVE_PRICE_SOL: 0.01,
  
  // Reserve price in lamports (0.01 SOL = 10,000,000 lamports)
  RESERVE_PRICE_LAMPORTS: 10_000_000,
  
  // Duration in seconds (1 hour)
  DURATION_SECONDS: 3600,
}
