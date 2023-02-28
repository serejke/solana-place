import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import { SerializedMessageDto } from "../dto/transactionDto";
import { BlockchainAddress } from "../model/blockchainAddress";

export interface TransactionBuilderService {
  createTransactionToChangePixels(
    feePayer: BlockchainAddress,
    requests: ChangePixelRequestDto[]
  ): Promise<SerializedMessageDto>;
}
