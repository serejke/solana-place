import {TransactionSignature} from "@solana/web3.js";
import {SerializedTransactionDto} from "../dto/transactionDto";

export async function sendTransaction(
  httpUrl: string,
  serializedTransactionDto: SerializedTransactionDto
): Promise<TransactionSignature> {
  const response = await fetch(
    new Request(httpUrl + "/transaction/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(serializedTransactionDto)
    })
  );
  return await response.json();
}
