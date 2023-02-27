import { TransactionDetailsDto } from "./transactionDto";
import { EventWithTypeDto } from "./eventWithTypeDto";

export type EventWithTransactionDetailsDto = {
  event: EventWithTypeDto;
  transactionDetails: TransactionDetailsDto;
};

export type EventsWithTransactionDetailsDto = {
  events: EventWithTransactionDetailsDto[];
};
