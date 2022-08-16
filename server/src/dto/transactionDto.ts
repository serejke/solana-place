export type TransactionConfirmationDto = "pending" | "confirmed" | "finalized";

export type TransactionDetailsDto = {
  signature: string,
  sender: string,
  timestamp: number,
  confirmation: TransactionConfirmationDto
}

export type CreateTransactionRequestDto<T> = {
  feePayer: string,
  data: T
}

export type SerializedMessageDto = {
  messageBase58: string
}

export type SerializedTransactionDto = {
  transactionBase58: string
}