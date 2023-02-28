import { SystemProgram, Transaction } from "@solana/web3.js";
import SolanaAnchorService from "./SolanaAnchorService";
import { GAME_PROGRAM_ACCOUNT } from "../program/program";
import { CloseableService } from "../../../service/CloseableService";
import { ChangePixelRequestDto } from "../../../dto/changePixelRequestDto";
import { SerializedMessageDto } from "../../../dto/transactionDto";
import { encodeChangePixelColorRequests } from "../program/encoder";
import { rethrowRpcError } from "../../../errors/serverError";
import { TransactionBuilderService } from "../../../service/TransactionBuilderService";
import { BlockchainAddress } from "../../../model/blockchainAddress";
import base58 from "bs58";

export class SolanaTransactionBuilderService
  implements CloseableService, TransactionBuilderService
{
  constructor(private anchorService: SolanaAnchorService) {}

  static create(
    anchorService: SolanaAnchorService
  ): SolanaTransactionBuilderService {
    return new SolanaTransactionBuilderService(anchorService);
  }

  async createTransactionToChangePixels(
    feePayer: BlockchainAddress,
    requests: ChangePixelRequestDto[]
  ): Promise<SerializedMessageDto> {
    const encodedChanges = encodeChangePixelColorRequests(requests);
    const instruction = await this.anchorService.solanaPlaceProgram.methods
      .changeColors(encodedChanges)
      .accounts({
        gameAccount: GAME_PROGRAM_ACCOUNT,
        payer: feePayer.asSolanaAddress(),
        systemProgram: SystemProgram.programId,
      })
      .instruction()
      .catch((e) => rethrowRpcError(e));
    const transaction = new Transaction();
    const latestBlockhash = await this.anchorService.anchorProvider.connection
      .getLatestBlockhash("finalized")
      .catch((e) => rethrowRpcError(e));

    transaction.feePayer = feePayer.asSolanaAddress();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.add(instruction);
    return this.toSerializedMessageDto(transaction);
  }

  private toSerializedMessageDto(
    transaction: Transaction
  ): SerializedMessageDto {
    const base58Buffer = base58.encode(transaction.serializeMessage());
    return { messageBase58: base58Buffer };
  }

  async close(): Promise<void> {
    return;
  }
}
