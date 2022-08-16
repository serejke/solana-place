import {Transaction} from "@solana/web3.js";
import {SerializedTransactionDto} from "./transactionDto";
import base58 from "bs58";

export function toSerializedTransactionDto(transaction: Transaction): SerializedTransactionDto {
  return {
    transactionBase58: base58.encode(transaction.serialize())
  }
}