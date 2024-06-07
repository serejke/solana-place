import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import { SerializedMessageDto } from "../dto/transactionDto";
import { toSerializedMessageDto } from "../dto-converter/converter";
import { CloseableService } from "../service/CloseableService";

export class TransactionBuilderServiceMock implements CloseableService {
  static create(): TransactionBuilderServiceMock {
    return new TransactionBuilderServiceMock();
  }

  async createTransactionToChangePixels(
    feePayer: PublicKey,
    _requests: ChangePixelRequestDto[]
  ): Promise<SerializedMessageDto> {
    const transaction = new Transaction();
    const latestBlockhash = "9XxoV7XJ8vNxEqkZDx9VzM76piuYcUQxpSMW4KcCxKQD";
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = latestBlockhash;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: feePayer,
        toPubkey: feePayer,
        lamports: 1,
      })
    );
    return toSerializedMessageDto(transaction);
  }

  async close(): Promise<void> {
    return;
  }
}
