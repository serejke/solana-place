import {TransactionDetailsDto} from "./transactionDto";

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