import {EventsWithTransactionDetailsDto, EventWithTransactionDetailsDto} from "../dto/eventsWithTransactionDetailsDto";
import {BoardState} from "../model/boardState";
import {Transaction} from "@solana/web3.js";
import {SerializedMessageDto, TransactionDetailsDto} from "../dto/transactionDto";
import base58 from "bs58";
import {BoardStateDto} from "../dto/boardStateDto";
import {EventWithTransactionDetails, EventsHistory} from "../model/eventsHistory";
import {TransactionDetails} from "../model/transactionDetails";
import {EventWithTypeDto} from "../dto/eventWithTypeDto";
import {GameEvent} from "../model/gameEvent";

export function toBoardStateDto(boardState: BoardState): BoardStateDto {
  return boardState;
}

export function toEventsWithTransactionDetailsDto(eventsHistory: EventsHistory): EventsWithTransactionDetailsDto {
  return {
    events: eventsHistory.events.map((eventWithTransactionDetails) =>
      toEventWithTransactionDetailsDto(eventWithTransactionDetails)
    ),
  };
}

export function toEventWithTypeDto(event: GameEvent): EventWithTypeDto {
  return event;
}

export function toEventWithTransactionDetailsDto(eventWithTransactionDetails: EventWithTransactionDetails): EventWithTransactionDetailsDto {
  return {
    event: toEventWithTypeDto(eventWithTransactionDetails.event),
    transactionDetails: toTransactionDetailsDto(eventWithTransactionDetails.transactionDetails)
  };
}

export function toTransactionDetailsDto(transactionDetails: TransactionDetails): TransactionDetailsDto {
  return {
    signature: transactionDetails.signature,
    confirmation: transactionDetails.confirmation,
    sender: transactionDetails.sender.toBase58(),
    timestamp: transactionDetails.timestamp
  };
}

export function toSerializedMessageDto(transaction: Transaction): SerializedMessageDto {
  const base58Buffer = base58.encode(transaction.serializeMessage());
  return {messageBase58: base58Buffer}
}