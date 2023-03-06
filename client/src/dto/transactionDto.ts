import { BlockchainAddressString } from "../model/blockchainAddress";
import { BlockchainName } from "../model/blockchainName";

export type TransactionSignatureDto = string;

export type TransactionConfirmationDto =
  | "processed"
  | "confirmed"
  | "finalized";

export type TransactionDetailsDto = {
  signature: TransactionSignatureDto;
  sender: BlockchainAddressString;
  timestamp: number;
  confirmation: TransactionConfirmationDto;
};

export type CreateTransactionRequestDto<T> = {
  blockchain: BlockchainName;
  feePayer: BlockchainAddressString;
  data: T;
};

export type SerializedMessageDto = {
  blockchain: BlockchainName;
  messageBase58: string;
};

export type SerializedTransactionDto = {
  blockchain: BlockchainName;
  transactionBase58: string;
};
