import { PublicKey } from "@solana/web3.js";
import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import { SerializedMessageDto } from "../dto/transactionDto";

export interface TransactionBuilderService {
  createTransactionToChangePixels(
    feePayer: PublicKey,
    requests: ChangePixelRequestDto[]
  ): Promise<SerializedMessageDto>;
}
