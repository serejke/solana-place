import {TransactionSignature} from "@solana/web3.js";

export const SHORTENED_SYMBOL = "…";

export function shortenTransactionSignature(signature: TransactionSignature) {
  return signature.slice(0, 7);
}

export function shortenPublicKey(publicKey: string) {
  return publicKey.slice(0, 7);
}