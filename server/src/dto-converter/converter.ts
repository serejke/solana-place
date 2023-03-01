import {
  EventsWithTransactionDetailsDto,
  EventWithTransactionDetailsDto,
} from "../dto/eventsWithTransactionDetailsDto";
import { BoardState } from "../model/boardState";
import { TransactionDetailsDto } from "../dto/transactionDto";
import { BoardStateDto } from "../dto/boardStateDto";
import {
  EventWithTransactionDetails,
  EventsHistory,
} from "../model/eventsHistory";
import {
  TransactionConfirmation,
  TransactionDetails,
} from "../model/transactionDetails";
import { EventWithTypeDto } from "../dto/eventWithTypeDto";
import { GameEvent } from "../model/gameEvent";

export function toBoardStateDto(boardState: BoardState): BoardStateDto {
  return boardState;
}

export function toEventsWithTransactionDetailsDto(
  eventsHistory: EventsHistory
): EventsWithTransactionDetailsDto {
  return {
    events: eventsHistory.events.map((eventWithTransactionDetails) =>
      toEventWithTransactionDetailsDto(eventWithTransactionDetails)
    ),
  };
}

export function toEventWithTypeDto(event: GameEvent): EventWithTypeDto {
  return event;
}

export function toEventWithTransactionDetailsDto(
  eventWithTransactionDetails: EventWithTransactionDetails
): EventWithTransactionDetailsDto {
  return {
    event: toEventWithTypeDto(eventWithTransactionDetails.event),
    transactionDetails: toTransactionDetailsDto(
      eventWithTransactionDetails.transactionDetails
    ),
  };
}

export function toTransactionDetailsDto(
  transactionDetails: TransactionDetails
): TransactionDetailsDto {
  return {
    signature: transactionDetails.signature,
    confirmation: transactionDetails.confirmation,
    sender: transactionDetails.sender.toString(),
    timestamp: transactionDetails.timestamp,
  };
}

export function parseTransactionConfirmationStatus(
  string: string | undefined
): TransactionConfirmation | undefined {
  switch (string) {
    case "confirmed":
    case "processed":
    case "finalized":
      return string;
  }
  return undefined;
}
