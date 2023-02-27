use anchor_lang::prelude::*;

#[account(zero_copy)]
pub struct GameAccount {
    /// Authority granted with game management permissions.
    pub authority: Pubkey,
    /// ID of the current state of the board, which gets incremented by 1 on every change.
    pub state: u32,
    /// Height of the game board, number of rows.
    pub height: u16,
    /// Width of the game board, number of columns.
    pub width: u16,
    /// Cost of changing a single color, in micro-lamports.
    pub change_cost: u32,
    /// Flattened map of colors. Pixel `<row> <column>` is at `index = <row> * width + <column>`.
    //  Currently, the max game size is 300x500 but it may be increased in future.
    // Anchor does not allow constants be specified as array size (leads to an IDL parsing error).
    pub colors: [u8; 150000]
}