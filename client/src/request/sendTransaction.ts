import { SerializedTransactionDto } from "../dto/transactionDto";
import { serverUrl } from "./serverUrls";
import { rethrowIfFailed } from "./requestError";
import { TransactionSignature } from "../model/transactionDetails";

export async function sendTransaction(
  serializedTransactionDto: SerializedTransactionDto
): Promise<TransactionSignature> {
  const response = await fetch(
    new Request(serverUrl + "/api/transaction/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializedTransactionDto),
    })
  );
  await rethrowIfFailed(response);
  return await response.json();
}
