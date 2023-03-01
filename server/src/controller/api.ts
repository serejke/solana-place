import { cluster } from "../chains/solana/program/urls";
import {
  GAME_PROGRAM_ACCOUNT,
  PROGRAM_ID,
} from "../chains/solana/program/program";
import { Express, NextFunction, Request, Response } from "express";
import {
  parseTransactionConfirmationStatus,
  toBoardStateDto,
  toEventsWithTransactionDetailsDto,
} from "../dto-converter/converter";
import { CloseableService } from "../service/CloseableService";
import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import {
  CreateTransactionRequestDto,
  SerializedTransactionDto,
} from "../dto/transactionDto";
import {
  InvalidRequest,
  NotFound,
  rethrowRpcError,
  SERVER_ERROR_PREFIX,
  ServerError,
} from "../errors/serverError";
import { BoardService } from "../service/BoardService";
import { BoardHistoryService } from "../service/BoardHistoryService";
import { TransactionService } from "../service/TransactionService";
import { TransactionBuilderService } from "../service/TransactionBuilderService";
import { ServerInfoDto } from "../dto/serverInfoDto";
import { BlockchainAddress } from "../model/blockchainAddress";

export default class ApiServer implements CloseableService {
  static async start(
    app: Express,
    boardService: BoardService,
    boardHistoryService: BoardHistoryService,
    transactionService: TransactionService,
    transactionBuilderService: TransactionBuilderService
  ): Promise<ApiServer> {
    app.get("/api/init", async (req, res: Response<ServerInfoDto>) => {
      res.json({
        chains: {
          solana: {
            programId: BlockchainAddress.from(PROGRAM_ID).toString(),
            cluster,
            gameAccount:
              BlockchainAddress.from(GAME_PROGRAM_ACCOUNT).toString(),
          },
        },
      });
    });

    app.get("/api/board", async (req, res) => {
      const boardState = await boardService.getBoardState();
      res.json(toBoardStateDto(boardState));
    });

    app.get("/api/board/history", async (req, res) => {
      const limitString = req.query["limit"]?.toString() ?? "10";
      const limit = parseInt(limitString);
      const boardHistory = await boardHistoryService.getBoardHistory(limit);
      res.json(toEventsWithTransactionDetailsDto(boardHistory));
    });

    app.post("/api/board/changePixels/tx", async (req, res) => {
      const createTxRequestDto = req.body as CreateTransactionRequestDto<
        ChangePixelRequestDto[]
      >;
      const feePayer = BlockchainAddress.from(createTxRequestDto.feePayer);
      const serializedMessageDto =
        await transactionBuilderService.createTransactionToChangePixels(
          feePayer,
          createTxRequestDto.data
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
      const transactionSignature = await transactionService.send(
        req.body as SerializedTransactionDto
      );
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
