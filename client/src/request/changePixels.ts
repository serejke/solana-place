import { createTransactionToChangePixels } from "./buildTransaction";
import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { sendTransaction } from "./sendTransaction";
import { toSerializedTransactionDto } from "../dto-converter/converter";
import { TransactionSignature } from "@solana/web3.js";
import { CreateTransactionRequestDto } from "../dto/transactionDto";
import { ChangedPixel } from "../model/changedPixel";
import { BlockchainAddress } from "../model/blockchainAddress";

export const MAX_CHANGES_PER_TRANSACTION = 150;

export async function changePixels(
  changedPixels: ChangedPixel[],
  wallet: WalletContextState
): Promise<TransactionSignature> {
  if (changedPixels.length > MAX_CHANGES_PER_TRANSACTION) {
    throw Error(
      `Too many ${changedPixels.length} changes in a single transaction.`
    );
  }
  const changePixelsRequestDto: CreateTransactionRequestDto<
    ChangePixelRequestDto[]
  > = {
    feePayer: BlockchainAddress.from(wallet.publicKey!).toString(),
    data: changedPixels.map((changedPixel) => ({
      row: changedPixel.coordinates.row,
      column: changedPixel.coordinates.column,
      newColor: changedPixel.newColor,
    })),
  };
  const transaction = await createTransactionToChangePixels(
    changePixelsRequestDto
  );
  const signTransaction = wallet.signTransaction!;
  const signedTransaction = await signTransaction(transaction);
  const serializedTransactionDto =
    toSerializedTransactionDto(signedTransaction);
  return await sendTransaction(serializedTransactionDto);
}
