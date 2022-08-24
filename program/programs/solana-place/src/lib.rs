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
        width: u16,
        change_cost: u32
    ) -> Result<()> {
        return instructions::initialize_only(ctx, height, width, change_cost);
    }

    pub fn change_color(
        ctx: Context<ChangeColor>,
        row: u16,
        column: u16,
        color: u8
    ) -> Result<()> {
        return instructions::change_color(ctx, row, column, color)
    }

    pub fn change_colors(
        ctx: Context<ChangeColors>,
        encoded_changes: Vec<u8>
    ) -> Result<()> {
        return instructions::change_colors(ctx, encoded_changes);
    }

}