import { Transaction } from "@solana/web3.js";
import {
  SerializedTransactionDto,
  TransactionDetailsDto,
} from "../dto/transactionDto";
import base58 from "bs58";
import { BoardHistory, GameEventWithTransactionDetails } from "../model/model";
import {
  EventsWithTransactionDetailsDto,
  EventWithTransactionDetailsDto,
} from "../dto/eventsWithTransactionDetailsDto";
import { ServerErrorBodyDto } from "../dto/serverErrorBodyDto";
import { TransactionDetails } from "../model/transactionDetails";
import { BlockchainAddress } from "../model/blockchainAddress";

export function toSerializedTransactionDto(
  transaction: Transaction
): SerializedTransactionDto {
  return {
    blockchain: "solana",
    transactionBase58: base58.encode(transaction.serialize()),
  };
}

export function parseGameEventWithTransactionDetailsFromDto(
  message: any
): GameEventWithTransactionDetails | undefined {
  if ("event" in message && "transactionDetails" in message) {
    const eventWithTransactionDetailsDto =
      message as EventWithTransactionDetailsDto;
    return {
      event: eventWithTransactionDetailsDto.event,
      transactionDetails: parseTransactionDetailsDto(
        eventWithTransactionDetailsDto.transactionDetails
      ),
    };
  }
  return undefined;
}

function parseTransactionDetailsDto(
  transactionDetailsDto: TransactionDetailsDto
): TransactionDetails {
  return {
    ...transactionDetailsDto,
    sender: BlockchainAddress.from(transactionDetailsDto.sender),
  };
}

export function parseBoardHistory(
  eventsWithTransactionDetailsDto: EventsWithTransactionDetailsDto
): BoardHistory {
  const gameEventsWithTransactionDetails =
    eventsWithTransactionDetailsDto.events.flatMap(
      (eventWithTransactionDetailsDto) =>
        parseGameEventWithTransactionDetailsFromDto(
          eventWithTransactionDetailsDto
        ) ?? []
    );
  return {
    events: gameEventsWithTransactionDetails,
  };
}

export function parseServerErrorBody(errorBody: any): ServerErrorBodyDto | any {
  if ("name" in errorBody && "message" in errorBody && "status" in errorBody) {
    return errorBody;
  }
  return undefined;
}
