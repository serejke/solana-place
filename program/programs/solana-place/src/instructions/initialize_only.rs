use crate::state::{GameAccount};
use crate::errors::{GameError};
use anchor_lang::prelude::*;

pub fn initialize_only(
    ctx: Context<InitializeOnly>,
    height: u16,
    width: u16,
    change_cost: u32
) -> Result<()> {
    require!(height > 0 && width > 0, GameError::GameSizeIsNotSupported);
    let game_account = &mut ctx.accounts.game_account.load_init()?;
    game_account.state = 0;
    game_account.height = height;
    game_account.width = width;
    game_account.change_cost = change_cost;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeOnly<'info> {
    #[account(zero, signer)]
    pub game_account: AccountLoader<'info, GameAccount>,
}