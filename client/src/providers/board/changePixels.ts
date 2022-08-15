import {SolanaPlaceProgram} from "../anchor";
import {PublicKey, Transaction} from "@solana/web3.js";
import {AnchorProvider} from "@project-serum/anchor";
import {ChangedPixel} from "./state";

export async function changePixels(
  solanaPlaceProgram: SolanaPlaceProgram,
  gameProgramAccount: PublicKey,
  anchorProvider: AnchorProvider,
  changedPixels: ChangedPixel[],
): Promise<any> {
  return Promise.all(
    (changedPixels ?? []).map((changedPixel) =>
      solanaPlaceProgram.methods
        .changeColor(changedPixel.coordinates.row, changedPixel.coordinates.column, changedPixel.newColor)
        .accounts({
          gameAccount: gameProgramAccount
        })
        .instruction()
    ))
    .then((transactions) => {
      const transaction = new Transaction();
      transaction.add(...transactions);
      return transaction;
    })
    .then((transaction) => anchorProvider.sendAndConfirm(transaction));
}