import SolanaAnchorService from "./SolanaAnchorService";
import { GAME_PROGRAM_ACCOUNT } from "../program/program";
import { BoardState } from "../../../model/boardState";
import { parseBoardStateFromAccount } from "../program/parserBoardState";
import { CloseableService } from "../../../service/CloseableService";
import { rethrowRpcError } from "../../../errors/serverError";
import { BoardService } from "../../../service/BoardService";

export class SolanaBoardService implements CloseableService, BoardService {
  constructor(private anchorState: SolanaAnchorService) {}

  static create(anchorState: SolanaAnchorService): SolanaBoardService {
    return new SolanaBoardService(anchorState);
  }

  async getBoardState(): Promise<BoardState> {
    return this.anchorState.solanaPlaceProgram.account.gameAccount
      .fetch(GAME_PROGRAM_ACCOUNT, "confirmed")
      .then(parseBoardStateFromAccount)
      .catch((e) => rethrowRpcError(e));
  }

  async close(): Promise<void> {
    return;
  }
}
