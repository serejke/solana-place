use std::ops::{Div, Rem};
use crate::state::GameAccount;
use crate::errors::GameError;
use crate::events::{PixelColorsChangedEvent, PixelColorChange};
use anchor_lang::prelude::*;
use crate::fee_helper::charge_game_fees;

pub fn change_colors(
    ctx: Context<ChangeColors>,
    encoded_changes: Vec<u8>
) -> Result<()> {
    let game_account = &ctx.accounts.game_account;
    require!(encoded_changes.len() > 0, GameError::IncorrectGameChangesEncoding);
    require_eq!(0usize, encoded_changes.len().rem(ChangeColors::CHANGE_ENCODING_SIZE), GameError::IncorrectGameChangesEncoding);
    let number_of_changes = encoded_changes.len().div(ChangeColors::CHANGE_ENCODING_SIZE);

    if ctx.accounts.payer.key.ne(&game_account.key()) {
        let game_fee = game_account.load()?.change_cost as u64 * 1000 * number_of_changes as u64;
        charge_game_fees(
            game_fee,
            ctx.accounts.payer.to_account_info(),
            game_account.to_account_info(),
            ctx.accounts.system_program.to_account_info()
        )?;
    }

    let game_account_data = &mut game_account.load_mut()?;
    let mut pixel_color_changes: Vec<PixelColorChange> = vec![];
    for i in 0..number_of_changes {
        let start_index = i * ChangeColors::CHANGE_ENCODING_SIZE;
        let row = u16::from_be_bytes(encoded_changes[start_index..start_index + 2].try_into().unwrap());
        let column = u16::from_be_bytes(encoded_changes[start_index + 2..start_index + 4].try_into().unwrap());
        let color = encoded_changes[start_index + 4];

        require!(row < game_account_data.height && column < game_account_data.width, GameError::PixelOutOfBounds);
        let index = row as usize * game_account_data.width as usize + column as usize;
        let old_color = game_account_data.colors[index];
        game_account_data.colors[index] = color;
        pixel_color_changes.push(PixelColorChange { row, column, old_color, new_color: color } )
    }

    let state = game_account_data.state;
    let new_state = state + number_of_changes as u32;
    game_account_data.state = new_state;

    emit!(PixelColorsChangedEvent {
        state,
        new_state,
        changes: pixel_color_changes
    });

    Ok(())
}

#[derive(Accounts)]
pub struct ChangeColors<'info> {
    #[account(mut)]
    pub game_account: AccountLoader<'info, GameAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>
}

impl ChangeColors<'_> {
    const CHANGE_ENCODING_SIZE: usize = 5;
}