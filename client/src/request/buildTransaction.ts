import {ChangePixelRequestDto} from "../dto/changePixelRequestDto";
import {CreateTransactionRequestDto, SerializedMessageDto} from "../dto/transactionDto";
import base58 from "bs58";
import {Message, Transaction} from "@solana/web3.js";
import {serverUrl} from "./serverUrls";
import {rethrowIfFailed} from "./requestError";

export async function createTransactionToChangePixels(
  changePixelsRequestDto: CreateTransactionRequestDto<ChangePixelRequestDto[]>
): Promise<Transaction> {
  const response = await fetch(
    new Request(serverUrl + "/api/board/changePixels/tx", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(changePixelsRequestDto)
    })
  );
  await rethrowIfFailed(response);
  const data: SerializedMessageDto = await response.json();
  const message = Message.from(base58.decode(data.messageBase58))
  return Transaction.populate(message);
}
