use anchor_lang::prelude::*;

pub fn charge_game_fees<'info>(
    fee: u64,
    payer: AccountInfo<'info>,
    game_account: AccountInfo<'info>,
    system_program: AccountInfo<'info>
) -> Result<()> {
    let transfer = anchor_lang::system_program::Transfer {
        from: payer,
        to: game_account,
    };
    let cpi_context = CpiContext::new(system_program, transfer);
    anchor_lang::system_program::transfer(cpi_context, fee)
}
