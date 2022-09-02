import {TransactionSignature} from "@solana/web3.js";
import {SerializedTransactionDto} from "../dto/transactionDto";
import {serverUrl} from "./serverUrls";
import {RequestError} from "./requestError";

export async function sendTransaction(
  serializedTransactionDto: SerializedTransactionDto
): Promise<TransactionSignature> {
  const response = await fetch(
    new Request(serverUrl + "/api/transaction/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(serializedTransactionDto)
    })
  );
  if (!response.ok) {
    throw new RequestError(response.status, await response.json());
  }
  return await response.json();
}
