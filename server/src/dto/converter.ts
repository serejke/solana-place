import {BoardHistory} from "../model/model";
import {BoardHistoryDto, BoardStateDto} from "./dto";
import {BoardState} from "../model/boardState";
import {Transaction} from "@solana/web3.js";
import {SerializedMessageDto} from "./transactionDto";
import base58 from "bs58";

export function toBoardStateDto(boardState: BoardState): BoardStateDto {
  return boardState;
}

export function toBoardHistoryDto(boardHistory: BoardHistory): BoardHistoryDto {
  return boardHistory;
}

export function toSerializedMessageDto(transaction: Transaction): SerializedMessageDto {
  const base58Buffer = base58.encode(transaction.serializeMessage());
  return { messageBase58: base58Buffer }
}