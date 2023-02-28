import { BoardState } from "../model/boardState";

export interface BoardService {
  getBoardState(): Promise<BoardState>;
}
