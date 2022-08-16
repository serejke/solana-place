import {ChangedPixel} from "./state";
import {createTransactionToChangePixels} from "../server/request/buildTransaction";
import {ChangePixelRequestDto} from "../server/dto/changePixelRequestDto";
import {WalletContextState} from "@solana/wallet-adapter-react";
import {sendTransaction} from "../server/request/sendTransaction";
import {toSerializedTransactionDto} from "../server/dto/converter";
import {TransactionSignature} from "@solana/web3.js";
import {CreateTransactionRequestDto} from "../server/dto/transactionDto";

export async function changePixels(
  httpUrl: string,
  changedPixels: ChangedPixel[],
  wallet: WalletContextState
): Promise<TransactionSignature> {
  const changePixelsRequestDto: CreateTransactionRequestDto<ChangePixelRequestDto[]> = {
    feePayer: wallet.publicKey!.toBase58()!,
    data: changedPixels.map(changedPixel => ({
      row: changedPixel.coordinates.row,
      column: changedPixel.coordinates.column,
      newColor: changedPixel.newColor
    }))
  }
  const transaction = await createTransactionToChangePixels(httpUrl, changePixelsRequestDto);
  const signTransaction = wallet.signTransaction!;
  const signedTransaction = await signTransaction(transaction);
  const serializedTransactionDto = toSerializedTransactionDto(signedTransaction);
  return await sendTransaction(httpUrl, serializedTransactionDto)
}