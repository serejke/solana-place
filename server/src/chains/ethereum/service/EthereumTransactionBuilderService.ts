import { TransactionBuilderService } from "../../../service/TransactionBuilderService";
import { BlockchainAddress } from "../../../model/blockchainAddress";
import { ChangePixelRequestDto } from "../../../dto/changePixelRequestDto";
import { SerializedMessageDto } from "../../../dto/transactionDto";
import { Game } from "../types/typechain-types";
import { TransactionRequest } from "@ethersproject/providers";
import { PopulatedTransaction } from "ethers";

export class EthereumTransactionBuilderService
  implements TransactionBuilderService
{
  constructor(private game: Game) {}

  async createTransactionToChangePixels(
    feePayer: BlockchainAddress,
    requests: ChangePixelRequestDto[]
  ): Promise<SerializedMessageDto> {
    const { row, column, newColor } = requests[0];
    const from = feePayer.asEthereumAddress();
    const nonce = await this.game.provider.getTransactionCount(from);
    const gasPrice = await this.game.provider.getGasPrice();
    const gasLimit = await this.game.estimateGas.changePixel(
      row,
      column,
      newColor,
      { from }
    );
    const populatedTransaction =
      await this.game.populateTransaction.changePixel(row, column, newColor, {
        from,
        nonce,
        gasPrice,
        gasLimit,
      });
    return {
      blockchain: "ethereum",
      messageBase58: JSON.stringify(
        this.toTransactionRequest(populatedTransaction)
      ),
    };
  }

  private toTransactionRequest(
    populatedTransaction: PopulatedTransaction
  ): TransactionRequest {
    return {
      ...populatedTransaction,
      value: populatedTransaction.value?.toHexString(),
      nonce: populatedTransaction.nonce,
      gasLimit: populatedTransaction.gasLimit?.toHexString(),
      gasPrice: populatedTransaction.gasPrice?.toHexString(),
      maxPriorityFeePerGas:
        populatedTransaction.maxPriorityFeePerGas?.toHexString(),
      maxFeePerGas: populatedTransaction.maxFeePerGas?.toHexString(),
    };
  }
}
