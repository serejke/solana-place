use anchor_lang::error_code;

#[error_code]
pub enum GameError {
    #[msg("Game initial size is not supported")]
    GameSizeIsNotSupported,

    #[msg("Pixel is not within the game's bounds")]
    PixelOutOfBounds,

    #[msg("Game changes are encoded incorrectly, must be 5 bytes: <row 2><column 2><color 1>")]
    IncorrectGameChangesEncoding,
}