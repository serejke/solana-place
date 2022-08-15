export type BoardStateDto = {
  state: number,
  height: number,
  width: number,
  colors: number[][]
};

export type PixelChangedEventDto = {
  state: number,
  row: number,
  column: number,
  oldColor: number,
  newColor: number
}

export type BoardChangeDto = {
  change: PixelChangedEventDto,
  transactionDetails: TransactionDetailsDto
}

export type BoardHistoryDto = {
  changes: BoardChangeDto[];
}

export type TransactionConfirmationDto = "pending" | "confirmed" | "finalized";

export type TransactionDetailsDto = {
  signature: string,
  sender: string,
  timestamp: number,
  confirmation: TransactionConfirmationDto
}