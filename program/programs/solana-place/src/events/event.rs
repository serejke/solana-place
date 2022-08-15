use anchor_lang::prelude::*;

#[event]
pub struct PixelColorChangedEvent {
    pub state: u32,
    pub row: u16,
    pub column: u16,
    pub old_color: u8,
    pub new_color: u8
}