import { cluster } from "../program/urls";
import { GAME_PROGRAM_ACCOUNT, PROGRAM_ID } from "../program/program";
import { Express, NextFunction, Request, Response } from "express";
import {
  toEventsWithTransactionDetailsDto,
  toBoardStateDto,
  parseTransactionConfirmationStatus,
} from "../dto-converter/converter";
import { BoardService } from "../service/BoardService";
import { BoardHistoryService } from "../service/BoardHistoryService";
import { CloseableService } from "../service/CloseableService";
import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import { TransactionBuilderService } from "../service/TransactionBuilderService";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  CreateTransactionRequestDto,
  SerializedTransactionDto,
} from "../dto/transactionDto";
import base58 from "bs58";
import { TransactionService } from "../service/TransactionService";
import {
  InvalidRequest,
  NotFound,
  rethrowRpcError,
  SERVER_ERROR_PREFIX,
  ServerError,
} from "../errors/serverError";

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
        .json({
          programId: PROGRAM_ID.toBase58(),
          cluster,
          gameAccount: GAME_PROGRAM_ACCOUNT.toBase58(),
        })
        .end();
    });

    app.get("/api/board", async (req, res) => {
      const boardState = await boardService.getBoardState("confirmed");
      res.json(toBoardStateDto(boardState));
    });

    app.get("/api/board/history", async (req, res) => {
      const limitString = req.query["limit"]?.toString() ?? "10";
      const limit = parseInt(limitString);
      res.json(
        toEventsWithTransactionDetailsDto(
          await boardHistoryService.getBoardHistory(limit)
        )
      );
    });

    app.post("/api/board/changePixels/tx", async (req, res) => {
      const requestsDto = req.body as CreateTransactionRequestDto<
        ChangePixelRequestDto[]
      >;
      const feePayer = new PublicKey(requestsDto.feePayer);
      const serializedMessageDto =
        await transactionBuilderService.createTransactionToChangePixels(
          feePayer,
          requestsDto.data
        );
      res.json(serializedMessageDto);
    });

    app.get("/api/board/changePixels/status", async (req, res) => {
      const transactionSignature =
        req.query["transactionSignature"]?.toString();
      if (!transactionSignature) {
        throw new InvalidRequest(
          "transactionSignature is not provided in the query"
        );
      }
      const commitmentString = req.query["commitment"]?.toString();
      const commitment =
        parseTransactionConfirmationStatus(commitmentString) ?? "confirmed";
      if (commitment === "processed") {
        throw new InvalidRequest("processed confirmation is not supported");
      }
      const eventsHistory = await boardHistoryService
        .getTransactionEventsIfFound(transactionSignature)
        .catch((e) => rethrowRpcError(e));
      if (eventsHistory === null) {
        throw new NotFound(`Transaction ${transactionSignature} is not found`);
      }
      res.json(toEventsWithTransactionDetailsDto(eventsHistory));
    });

    app.post("/api/transaction/send", async (req, res) => {
      const serializedTransactionDto = req.body as SerializedTransactionDto;
      const transaction = Transaction.from(
        base58.decode(serializedTransactionDto.transactionBase58)
      );
      const transactionSignature = await transactionService.send(transaction);
      res.json(transactionSignature);
    });

    app.use(ApiServer.errorHandler);
    app.use(ApiServer.failSafeHandler);

    return new ApiServer();
  }

  static errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Handled error", error);
    if (error.name.startsWith(SERVER_ERROR_PREFIX)) {
      const serverError = error as ServerError;
      res.status(serverError.statusCode).json(serverError.toJson());
    } else {
      next(error);
    }
  }

  static failSafeHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    res.status(500).send(error);
    // noinspection BadExpressionStatementJS
    next;
  }

  async close(): Promise<void> {
    return;
  }
}
