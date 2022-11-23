use anchor_lang::prelude::*;
use solana_security_txt::security_txt;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod events;

declare_id!("PLACEMmfm3ZMpYKWfTwzHsTGnPnnDgmK2QkJPeLnZWE");

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

    pub fn change_colors(
        ctx: Context<ChangeColors>,
        encoded_changes: Vec<u8>
    ) -> Result<()> {
        return instructions::change_colors(ctx, encoded_changes);
    }

}

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "Place | Solana",
    project_url: "https://solana-place.com/",
    contacts: "discord:serejke#5191",
    policy: "https://github.com/serejke/solana-place/SECURITY.md",
    preferred_languages: "en",
    source_code: "https://github.com/serejke/solana-place"
}
