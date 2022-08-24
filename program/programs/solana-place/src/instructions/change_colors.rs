use std::ops::{Div, Rem};
use crate::state::GameAccount;
use crate::errors::GameError;
use crate::events::PixelColorChangedEvent;
use anchor_lang::prelude::*;
use crate::fee_helper::charge_game_fees;
use crate::index_helper::get_game_index;

pub fn change_colors(
    ctx: Context<ChangeColors>,
    encoded_changes: Vec<u8>
) -> Result<()> {
    let game_account = &ctx.accounts.game_account;
    require!(encoded_changes.len() > 0, GameError::IncorrectGameChangesEncoding);
    require_eq!(0, encoded_changes.len().rem(ChangeColors::CHANGE_ENCODING_SIZE), GameError::IncorrectGameChangesEncoding);
    let number_of_changes = encoded_changes.len().div(ChangeColors::CHANGE_ENCODING_SIZE);

    if ctx.accounts.payer.key.ne(&game_account.key()) {
        let game_fee = game_account.change_cost as u64 * 1000 * number_of_changes as u64;
        charge_game_fees(
            game_fee,
            ctx.accounts.payer.to_account_info(),
            game_account.to_account_info(),
            ctx.accounts.system_program.to_account_info()
        )?;
    }

    let game_account = &mut ctx.accounts.game_account;
    for i in 0..number_of_changes {
        let start_index = i * ChangeColors::CHANGE_ENCODING_SIZE;
        let row = u16::from_be_bytes(encoded_changes[start_index..start_index + 2].try_into().unwrap());
        let column = u16::from_be_bytes(encoded_changes[start_index + 2..start_index + 4].try_into().unwrap());
        let color = encoded_changes[start_index + 4];

        require!(row < game_account.height && column < game_account.width, GameError::PixelOutOfBounds);
        let state = game_account.state;
        let index = get_game_index(game_account, row, column);
        let old_color = game_account.colors[index as usize];
        game_account.colors[index as usize] = color;
        game_account.state = state + 1;
        emit!(PixelColorChangedEvent { state, row, column, old_color, new_color: color });
    }

    Ok(())
}

#[derive(Accounts)]
pub struct ChangeColors<'info> {
    #[account(mut)]
    pub game_account: Account<'info, GameAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>
}

impl ChangeColors<'_> {
    const CHANGE_ENCODING_SIZE: usize = 5;
}