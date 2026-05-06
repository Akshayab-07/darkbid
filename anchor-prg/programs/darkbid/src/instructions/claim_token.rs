use anchor_lang::prelude::*;
use anchor_spl::token_interface::{TokenInterface, Mint, TokenAccount};
use crate::state::*;
use crate::constants::*;
use crate::error::*;

pub fn handler(ctx: Context<ClaimToken>) -> Result<()> {
    let token_supply = ctx.accounts.auction.token_supply;
    let bump = ctx.accounts.auction.bump;
    let authority_key = ctx.accounts.auction.authority;
    let winner = ctx.accounts.auction.winner.unwrap();
    let mint_key = ctx.accounts.auction.mint;
    require!(ctx.accounts.auction.is_finalized, DarkBidError::AuctionNotFinalized);
    require!(!ctx.accounts.auction.tokens_claimed, DarkBidError::AlreadyClaimed);
    require_eq!(ctx.accounts.winner.key(), winner, DarkBidError::NotWinner);
    require_eq!(ctx.accounts.winner_token_account.owner, winner, DarkBidError::InvalidTokenAccount);
    require_eq!(ctx.accounts.winner_token_account.mint, mint_key, DarkBidError::InvalidTokenAccount);
    let signer_seeds: &[&[&[u8]]] = &[&[AUCTION_SEED, authority_key.as_ref(), &[bump]]];
    anchor_spl::token_interface::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_interface::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.auction.to_account_info(),
            },
            signer_seeds,
        ),
        token_supply,
    )?;
    ctx.accounts.auction.tokens_claimed = true;
    Ok(())
}

#[derive(Accounts)]
pub struct ClaimToken<'info> {
    #[account(mut, seeds = [AUCTION_SEED, authority.key().as_ref()], bump = auction.bump)]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub winner_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub winner: Signer<'info>,
    pub authority: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}
