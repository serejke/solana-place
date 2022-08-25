use anchor_lang::prelude::*;

#[event]
pub struct PixelColorsChangedEvent {
    pub state: u32,
    pub new_state: u32,
    pub changes: Vec<PixelColorChange>
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PixelColorChange {
    pub row: u16,
    pub column: u16,
    pub old_color: u8,
    pub new_color: u8
}