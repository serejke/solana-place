import { TransactionSignature } from "@solana/web3.js";
import { BlockchainAddress } from "../model/blockchainAddress";

export const SHORTENED_SYMBOL = "…";

export function shortenTransactionSignature(signature: TransactionSignature) {
  return signature.slice(0, 7);
}

export function shortenBlockchainAddress(blockchainAddress: BlockchainAddress) {
  return blockchainAddress.toString(false).slice(0, 7);
}
