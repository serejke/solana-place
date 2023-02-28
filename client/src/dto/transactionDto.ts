import { BlockchainAddressString } from "../model/blockchainAddress";

export type TransactionConfirmationDto =
  | "processed"
  | "confirmed"
  | "finalized";

export type TransactionDetailsDto = {
  signature: string;
  sender: string;
  timestamp: number;
  confirmation: TransactionConfirmationDto;
};

export type CreateTransactionRequestDto<T> = {
  feePayer: BlockchainAddressString;
  data: T;
};

export type SerializedMessageDto = {
  messageBase58: string;
};

export type SerializedTransactionDto = {
  transactionBase58: string;
};
