export type PixelChangedEvent = {
  state: number,
  row: number,
  column: number,
  oldColor: number,
  newColor: number
}

export type BoardChange = {
  change: PixelChangedEvent,
  transactionDetails: TransactionDetails
}

export type BoardHistory = {
  changes: BoardChange[];
}

export type TransactionConfirmation = "pending" | "confirmed" | "finalized";

export type TransactionDetails = {
  signature: string,
  sender: string,
  timestamp: number,
  confirmation: TransactionConfirmation
}