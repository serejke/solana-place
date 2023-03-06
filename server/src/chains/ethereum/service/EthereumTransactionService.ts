import { TransactionService } from "../../../service/TransactionService";
import { SerializedTransactionDto } from "../../../dto/transactionDto";
import { TransactionSignature } from "../../../model/transactionDetails";
import { JsonRpcProvider } from "@ethersproject/providers";

export class EthereumTransactionService implements TransactionService {
  constructor(private provider: JsonRpcProvider) {}

  async send(
    serializedTransactionDto: SerializedTransactionDto
  ): Promise<TransactionSignature> {
    const transactionResponse = await this.provider.sendTransaction(
      serializedTransactionDto.transactionBase58
    );
    return transactionResponse.hash;
  }
}
