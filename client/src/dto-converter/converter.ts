import {Transaction} from "@solana/web3.js";
import {SerializedTransactionDto} from "../dto/transactionDto";
import base58 from "bs58";
import {BoardHistory, GameEventWithTransactionDetails} from "../model/model";
import {EventsWithTransactionDetailsDto, EventWithTransactionDetailsDto} from "../dto/eventsWithTransactionDetailsDto";

export function toSerializedTransactionDto(transaction: Transaction): SerializedTransactionDto {
  return {
    transactionBase58: base58.encode(transaction.serialize())
  }
}

export function parseGameEventWithTransactionDetailsFromDto(data: EventWithTransactionDetailsDto): GameEventWithTransactionDetails[] | null {
  if ("event" in data && "transactionDetails" in data) {
    // eslint-disable-next-line
    return data.event.changes.map((change, index: number) => (
        {
          event: {
            type: "pixelChangedEvent",
            state: data.event.state + index,
            row: change.row,
            column: change.column,
            oldColor: change.oldColor,
            newColor: change.newColor,
          },
          transactionDetails: data.transactionDetails
        }
      )
    );
  }
  return null;
}

export function parseBoardHistory(eventsWithTransactionDetailsDto: EventsWithTransactionDetailsDto): BoardHistory {
  const gameEventWithTransactionDetails = eventsWithTransactionDetailsDto.events.flatMap((eventWithTransactionDetailsDto) =>
    parseGameEventWithTransactionDetailsFromDto(eventWithTransactionDetailsDto) ?? []
  );
  return {
    events: gameEventWithTransactionDetails
  };
}