import { BoardService } from "../service/BoardService";
import { BoardHistoryService } from "../service/BoardHistoryService";
import { TransactionBuilderService } from "../service/TransactionBuilderService";
import { TransactionService } from "../service/TransactionService";
import { CloseableService } from "../service/CloseableService";
import { Protocol } from "../protocol/protocol";

export interface Chain extends CloseableService {
  boardService: BoardService;
  boardHistoryService: BoardHistoryService;
  transactionBuilderService: TransactionBuilderService;
  transactionService: TransactionService;
  protocol: Protocol;
}
