import AnchorService from "./AnchorService";
import { GAME_PROGRAM_ACCOUNT } from "../program/program";
import { BoardState } from "../model/boardState";
import { parseBoardStateFromAccount } from "../program/parserBoardState";
import { CloseableService } from "./CloseableService";
import { Commitment } from "@solana/web3.js";
import { rethrowRpcError } from "../errors/serverError";

export class BoardService implements CloseableService {
  constructor(private anchorState: AnchorService) {}

  static create(anchorState: AnchorService): BoardService {
    return new BoardService(anchorState);
  }

  async getBoardState(commitment: Commitment): Promise<BoardState> {
    return this.anchorState.solanaPlaceProgram.account.gameAccount
      .fetch(GAME_PROGRAM_ACCOUNT, commitment)
      .then(parseBoardStateFromAccount)
      .catch((e) => rethrowRpcError(e));
  }

  async close(): Promise<void> {
    return;
  }
}
