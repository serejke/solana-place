use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod events;

declare_id!("CnSpmonTnfrTjEeGnT9sEHvoTuiGX6cYSNZRDe2uLQr1");

#[program]
pub mod solana_place {
    use crate::initialize_only::InitializeOnly;
    use super::*;

    pub fn initialize_only(
        ctx: Context<InitializeOnly>,
        height: u16,
        width: u16
    ) -> Result<()> {
        instructions::initialize_only(ctx, height, width)
    }

    pub fn change_color(
        ctx: Context<ChangeColor>,
        row: u16,
        column: u16,
        color: u8
    ) -> Result<()> {
        instructions::change_color(ctx, row, column, color)
    }
}