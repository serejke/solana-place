import AnchorService from "./AnchorService";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {EventParser} from "@project-serum/anchor";
import {BoardState} from "../model/boardState";
import {parseBoardStateFromAccount} from "../program/board";
import {CloseableService} from "./CloseableService";

export class BoardService implements CloseableService {

  private eventParser: EventParser;

  constructor(
    private anchorState: AnchorService
  ) {
    this.eventParser = new EventParser(PROGRAM_ID, anchorState.solanaPlaceProgram.coder);
  }

  static create(anchorState: AnchorService): BoardService {
    return new BoardService(anchorState);
  }

  async getBoardState(): Promise<BoardState> {
    return this.anchorState.solanaPlaceProgram.account.gameAccount
      .fetch(GAME_PROGRAM_ACCOUNT, "confirmed")
      .then(parseBoardStateFromAccount)
  }

  async close(): Promise<void> {
    return;
  }
}