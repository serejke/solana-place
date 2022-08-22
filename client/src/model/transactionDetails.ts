export type TransactionConfirmation = "processed" | "confirmed" | "finalized";

export type TransactionDetails = {
  signature: string,
  sender: string,
  timestamp: number,
  confirmation: TransactionConfirmation
}