import { BlockchainAddress } from "../model/blockchainAddress";
import { TransactionSignature } from "../model/transactionDetails";

export const SHORTENED_SYMBOL = "…";

export function shortenTransactionSignature(signature: TransactionSignature) {
  return signature.slice(0, 7);
}

export function shortenBlockchainAddress(blockchainAddress: BlockchainAddress) {
  return blockchainAddress.toString(false).slice(0, 7);
}
