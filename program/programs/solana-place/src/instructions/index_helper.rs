use anchor_lang::prelude::*;
use crate::state::GameAccount;

pub fn get_game_index(
    game_account: &Account<GameAccount>,
    row: u16,
    column: u16,
) -> u16 {
    return row * game_account.width + column;
}
