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
    let game_account = &ctx.accounts.game_account;
    require!(row < game_account.height && column < game_account.width, GameError::PixelOutOfBounds);
    charge_game_fees(
        game_account.change_cost as u64 * 1000,
        ctx.accounts.payer.to_account_info(),
        game_account.to_account_info(),
        ctx.accounts.system_program.to_account_info()
    )?;

    let game_account = &mut ctx.accounts.game_account;
    let state = game_account.state;
    let index = get_index(game_account, row, column);
    let old_color = game_account.colors[index as usize];
    game_account.colors[index as usize] = color;
    game_account.state = state + 1;
    emit!(PixelColorChangedEvent { state, row, column, old_color, new_color: color });
    Ok(())
}

pub fn charge_game_fees<'info>(
    fee: u64,
    payer: AccountInfo<'info>,
    game_account: AccountInfo<'info>,
    system_program: AccountInfo<'info>
) -> Result<()> {
    let transfer = anchor_lang::system_program::Transfer {
        from: payer,
        to: game_account,
    };
    let cpi_context = CpiContext::new(system_program, transfer);
    anchor_lang::system_program::transfer(cpi_context, fee)
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
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>
}