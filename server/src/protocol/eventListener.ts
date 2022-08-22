import {EventWithTransactionDetails} from "../model/eventsHistory";

export type EventListener = (
  eventWithTransactionDetails: EventWithTransactionDetails
) => void;