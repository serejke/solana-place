import {cluster} from "../program/urls";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {Express} from "express";
import {toEventsWithTransactionDetailsDto, toBoardStateDto} from "../dto-converter/converter";
import {BoardService} from "../service/BoardService";
import {BoardHistoryService} from "../service/BoardHistoryService";
import {CloseableService} from "../service/CloseableService";
import {ChangePixelRequestDto} from "../dto/changePixelRequestDto";
import {TransactionBuilderService} from "../service/TransactionBuilderService";
import {PublicKey, Transaction} from "@solana/web3.js";
import {CreateTransactionRequestDto, SerializedTransactionDto} from "../dto/transactionDto";
import base58 from "bs58";
import {TransactionService} from "../service/TransactionService";

export default class ApiServer implements CloseableService {

  static async start(
    app: Express,
    boardService: BoardService,
    boardHistoryService: BoardHistoryService,
    transactionService: TransactionService,
    transactionBuilderService: TransactionBuilderService
  ): Promise<ApiServer> {
    app.get("/api/init", async (req, res) => {
      res
        .json(
          {
            programId: PROGRAM_ID.toBase58(),
            cluster,
            gameAccount: GAME_PROGRAM_ACCOUNT.toBase58()
          }
        )
        .end();
    });

    app.get("/api/board", async (req, res) => {
      const boardState = await boardService.getBoardState("confirmed");
      res.json(toBoardStateDto(boardState));
    })

    app.get("/api/board-history", async (req, res) => {
      const limit = 100;
      res.json(toEventsWithTransactionDetailsDto(await boardHistoryService.getBoardHistory(limit)));
    })

    app.post("/api/board/changePixels/tx", async (req, res) => {
      const requestsDto = req.body as CreateTransactionRequestDto<ChangePixelRequestDto[]>;
      const feePayer = new PublicKey(requestsDto.feePayer);
      const serializedMessageDto = await transactionBuilderService.createTransactionToChangePixels(feePayer, requestsDto.data);
      res.json(serializedMessageDto);
    })

    app.post("/api/transaction/send", async (req, res) => {
      const serializedTransactionDto = req.body as SerializedTransactionDto
      const transaction = Transaction.from(base58.decode(serializedTransactionDto.transactionBase58));
      const transactionSignature = await transactionService.send(transaction);
      res.json(transactionSignature)
    })

    return new ApiServer();
  }

  async close(): Promise<void> {
    return;
  }
}
