use crate::state::GameAccount;
use crate::errors::GameError;
use crate::events::PixelColorChangedEvent;
use anchor_lang::prelude::*;

pub fn change_color(
    ctx: Context<ChangeColor>,
    row: u16,
    column: u16,
    color: u8,
) -> Result<()> {
    let game_account = &mut ctx.accounts.game_account;
    require!(row < game_account.height && column < game_account.width, GameError::PixelOutOfBounds);
    let state = game_account.state;
    let index = get_index(game_account, row, column);
    let old_color = game_account.colors[index as usize];
    game_account.colors[index as usize] = color;
    game_account.state = state + 1;
    emit!(PixelColorChangedEvent { state, row, column, old_color, new_color: color });
    Ok(())
}

pub fn get_index(
    game_account: &Account<GameAccount>,
    row: u16,
    column: u16
) -> u16 {
    return row * game_account.width + column;
}

#[derive(Accounts)]
pub struct ChangeColor<'info> {
    #[account(mut)]
    pub game_account: Account<'info, GameAccount>,
}