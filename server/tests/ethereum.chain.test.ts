import { EthereumChain } from "../src/chains/ethereum/EthereumChain";
import { BlockchainAddress } from "../src/model/blockchainAddress";
import { ethers } from "ethers";
import { TransactionRequest } from "@ethersproject/providers";

const defaultRpcUrl = "http://127.0.0.1:8545";

describe("ethereum", function () {
  it("init", async function () {
    const ethereumChain = await EthereumChain.initialize({
      rpcUrl: defaultRpcUrl,
      gameContract: BlockchainAddress.from(
        "ethereum:0x5FbDB2315678afecb367f032d93F642f64180aa3"
      ),
    });
    const boardState = await ethereumChain.boardService.getBoardState();
    console.log(boardState);

    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(defaultRpcUrl);
    const wallet = new ethers.Wallet(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      jsonRpcProvider
    );

    const serializedMessageDto =
      await ethereumChain.transactionBuilderService.createTransactionToChangePixels(
        BlockchainAddress.from("ethereum:" + wallet.address),
        [{ row: 0, column: 0, newColor: 3 }]
      );

    const populatedTransaction: TransactionRequest = JSON.parse(
      serializedMessageDto.messageBase58
    );

    const signedTransaction = await wallet.signTransaction(
      populatedTransaction
    );

    const signature = await ethereumChain.transactionService.send({
      blockchain: "ethereum",
      transactionBase58: signedTransaction,
    });

    console.log(signature);

    console.log(await ethereumChain.boardService.getBoardState());
  });
});
