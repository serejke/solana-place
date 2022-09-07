import {Transaction} from "@solana/web3.js";
import {SerializedTransactionDto} from "../dto/transactionDto";
import base58 from "bs58";
import {BoardHistory, GameEventWithTransactionDetails} from "../model/model";
import {EventsWithTransactionDetailsDto, EventWithTransactionDetailsDto} from "../dto/eventsWithTransactionDetailsDto";
import {ServerErrorBodyDto} from "../dto/serverErrorBodyDto";

export function toSerializedTransactionDto(transaction: Transaction): SerializedTransactionDto {
  return {
    transactionBase58: base58.encode(transaction.serialize())
  }
}

export function parseGameEventWithTransactionDetailsFromDto(message: any): GameEventWithTransactionDetails | undefined {
  if ("event" in message && "transactionDetails" in message) {
    const eventWithTransactionDetailsDto = message as EventWithTransactionDetailsDto
    return {
      event: eventWithTransactionDetailsDto.event,
      transactionDetails: eventWithTransactionDetailsDto.transactionDetails
    }
  }
  return undefined;
}

export function parseBoardHistory(eventsWithTransactionDetailsDto: EventsWithTransactionDetailsDto): BoardHistory {
  const gameEventsWithTransactionDetails = eventsWithTransactionDetailsDto.events
    .flatMap((eventWithTransactionDetailsDto) =>
      parseGameEventWithTransactionDetailsFromDto(eventWithTransactionDetailsDto) ?? []
    );
  return {
    events: gameEventsWithTransactionDetails
  };
}

export function parseServerErrorBody(errorBody: any): ServerErrorBodyDto | any {
  if ("name" in errorBody && "message" in errorBody && "status" in errorBody) {
    return errorBody;
  }
  return undefined;
}