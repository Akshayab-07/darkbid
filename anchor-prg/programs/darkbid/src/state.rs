use anchor_lang::prelude::*;

#[account]
pub struct Auction {
    pub authority: Pubkey,
    pub reserve_price: u64,
    pub end_time: i64,
    pub is_finalized: bool,
    pub winner: Option<Pubkey>,
    pub bump: u8,
    pub mint: Pubkey,           // SPL token mint address
    pub token_supply: u64,      // Total tokens to distribute
    pub tokens_claimed: bool,   // Track if winner has claimed
}

#[account]
pub struct Bid {
    pub bidder: Pubkey,
    pub hash: [u8; 32],
    pub amount: u64,
    pub is_revealed: bool,
    pub bump: u8,
}
