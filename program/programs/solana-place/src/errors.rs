use anchor_lang::error_code;

#[error_code]
pub enum GameError {
    #[msg("Game initial size is not supported")]
    GameSizeIsNotSupported,

    #[msg("Pixel is not within the game's bounds")]
    PixelOutOfBounds
}