import {BoardHistory} from "../model/model";
import {BoardHistoryDto, BoardStateDto} from "./dto";
import {BoardState} from "../model/boardState";

export function toBoardStateDto(boardState: BoardState): BoardStateDto {
  return boardState;
}

export function toBoardHistoryDto(boardHistory: BoardHistory): BoardHistoryDto {
  return boardHistory;
}