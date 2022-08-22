import {Transaction} from "@solana/web3.js";
import {SerializedTransactionDto} from "../dto/transactionDto";
import base58 from "bs58";
import {BoardHistory, EventWithTransactionDetails} from "../model/model";
import {EventsWithTransactionDetailsDto} from "../dto/eventsWithTransactionDetailsDto";

export function toSerializedTransactionDto(transaction: Transaction): SerializedTransactionDto {
  return {
    transactionBase58: base58.encode(transaction.serialize())
  }
}

export function parseEventWithTransactionDetailsDtoFromSocketMessage(data: any): EventWithTransactionDetails | null {
  if ("event" in data && "transactionDetails" in data) {
    return data;
  }
  return null;
}

export function parseBoardHistory(eventsWithTransactionDetailsDto: EventsWithTransactionDetailsDto): BoardHistory {
  return eventsWithTransactionDetailsDto;
}