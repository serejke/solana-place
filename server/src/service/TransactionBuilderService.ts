import {PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT} from "../program/program";
import {CloseableService} from "./CloseableService";
import {ChangePixelRequestDto} from "../dto/changePixelRequestDto";
import {SerializedMessageDto} from "../dto/transactionDto";
import {toSerializedMessageDto} from "../dto-converter/converter";
import {encodeChangePixelColorRequests} from "../program/encoder";

export class TransactionBuilderService implements CloseableService {

  constructor(private anchorService: AnchorService) {
  }

  static create(anchorService: AnchorService): TransactionBuilderService {
    return new TransactionBuilderService(anchorService);
  }

  async createTransactionToChangePixels(
    feePayer: PublicKey,
    requests: ChangePixelRequestDto[]
  ): Promise<SerializedMessageDto> {
    const encodedChanges = encodeChangePixelColorRequests(requests);
    const instruction = await this.anchorService.solanaPlaceProgram.methods
      .changeColors(encodedChanges)
      .accounts({
        gameAccount: GAME_PROGRAM_ACCOUNT,
        payer: feePayer,
        systemProgram: SystemProgram.programId
      })
      .instruction()
    const transaction = new Transaction();
    const latestBlockhash = await this.anchorService.anchorProvider.connection.getLatestBlockhash();
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.add(instruction);
    return toSerializedMessageDto(transaction);
  }

  async close(): Promise<void> {
    return;
  }
}