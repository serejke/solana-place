use anchor_lang::prelude::*;

#[account]
pub struct GameAccount {
    pub state: u32,
    pub height: u16,
    pub width: u16,
    // Cost of changing a single color, in micro-lamports.
    pub change_cost: u32,
    pub colors: Vec<u8>
}

pub const MAX_HEIGHT: usize = 128;
pub const MAX_WIDTH: usize = 196;