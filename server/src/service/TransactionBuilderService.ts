import {PublicKey, SystemProgram, Transaction, TransactionInstruction} from "@solana/web3.js";
import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT} from "../program/program";
import {CloseableService} from "./CloseableService";
import {ChangePixelRequestDto} from "../dto/changePixelRequestDto";
import {SerializedMessageDto} from "../dto/transactionDto";
import {toSerializedMessageDto} from "../dto-converter/converter";

const MAX_REQUESTS_PER_TRANSACTION = 20;

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
    if (requests.length > MAX_REQUESTS_PER_TRANSACTION) {
      throw new Error(`Too many ${requests.length} requests for one transaction`);
    }
    const instructions: TransactionInstruction[] = await Promise.all(requests.map(request =>
      this.anchorService.solanaPlaceProgram.methods
        .changeColor(request.row, request.column, request.newColor)
        .accounts({
          gameAccount: GAME_PROGRAM_ACCOUNT,
          payer: feePayer,
          systemProgram: SystemProgram.programId
        })
        .instruction()
      )
    );
    const transaction = new Transaction();
    const latestBlockhash = await this.anchorService.anchorProvider.connection.getLatestBlockhash();
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.add(...instructions);
    return toSerializedMessageDto(transaction);
  }

  async close(): Promise<void> {
    return;
  }
}