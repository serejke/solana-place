import { Chain } from "../chain";
import { EthereumProtocol } from "./protocol/ethereumProtocol";
import { EthereumTransactionBuilderService } from "./service/EthereumTransactionBuilderService";
import { EthereumTransactionService } from "./service/EthereumTransactionService";
import { EthereumBoardService } from "./service/EthereumBoardService";
import { EthereumBoardHistoryService } from "./service/EthereumBoardHistoryService";
import { GameEvent } from "../../model/gameEvent";
import { BlockchainAddress } from "../../model/blockchainAddress";
import { ethers } from "ethers";
import { Game__factory } from "./types/typechain-types";

export class EthereumChain implements Chain {
  constructor(
    public boardHistoryService: EthereumBoardHistoryService,
    public boardService: EthereumBoardService,
    public protocol: EthereumProtocol<GameEvent>,
    public transactionBuilderService: EthereumTransactionBuilderService,
    public transactionService: EthereumTransactionService
  ) {}

  static async initialize({
    rpcUrl,
    gameContract,
  }: {
    rpcUrl: string;
    gameContract: BlockchainAddress;
  }): Promise<Chain> {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const game = Game__factory.connect(
      gameContract.asEthereumAddress(),
      provider
    );
    const boardHistoryService = new EthereumBoardHistoryService();
    const boardService = new EthereumBoardService(game);
    const protocol = new EthereumProtocol();
    const transactionBuilderService = new EthereumTransactionBuilderService(
      game
    );
    const transactionService = new EthereumTransactionService(provider);
    return new EthereumChain(
      boardHistoryService,
      boardService,
      protocol,
      transactionBuilderService,
      transactionService
    );
  }

  async close(): Promise<void> {
    return;
  }
}
