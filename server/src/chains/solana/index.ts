import { Chain } from "../chain";
import { SolanaBoardService } from "./service/SolanaBoardService";
import { SolanaBoardHistoryService } from "./service/SolanaBoardHistoryService";
import { SolanaTransactionBuilderService } from "./service/SolanaTransactionBuilderService";
import { SolanaTransactionService } from "./service/SolanaTransactionService";
import SolanaAnchorService from "./service/SolanaAnchorService";
import { GAME_PROGRAM_ACCOUNT, PROGRAM_ID } from "./program/program";
import { Connection } from "@solana/web3.js";
import { clusterUrl } from "./program/urls";
import { SolanaProtocol } from "./protocol/solanaProtocol";
import { GameEvent } from "../../model/gameEvent";
import { SolanaBoardSubscriberService } from "./service/SolanaBoardSubscriberService";

export class SolanaChain implements Chain {
  constructor(
    public boardHistoryService: SolanaBoardHistoryService,
    public boardService: SolanaBoardService,
    public transactionBuilderService: SolanaTransactionBuilderService,
    public transactionService: SolanaTransactionService,
    public protocol: SolanaProtocol<GameEvent>,

    private anchorService: SolanaAnchorService,
    private boardSubscriberService: SolanaBoardSubscriberService
  ) {}

  async close(): Promise<void> {
    const allServices = [
      this.boardService,
      this.boardHistoryService,
      this.transactionService,
      this.transactionBuilderService,
      // this.clusterStateService,

      this.anchorService,
      this.boardSubscriberService,
      this.protocol,
    ];

    for (const service of allServices) {
      try {
        await service.close();
      } catch (e) {
        console.error("Failed to close", service);
      }
    }

    return Promise.resolve(undefined);
  }

  static async initialize(): Promise<Chain> {
    const connection = new Connection(clusterUrl, "confirmed");
    console.log(`Connected to RPC node ${clusterUrl}`);
    console.log(`Solana Place Program ID ${PROGRAM_ID.toBase58()}`);
    console.log(`Solana Place Game Account ${GAME_PROGRAM_ACCOUNT.toBase58()}`);

    const anchorService = await SolanaAnchorService.create(
      connection,
      PROGRAM_ID
    );
    const boardService = SolanaBoardService.create(anchorService);
    const boardHistoryService = SolanaBoardHistoryService.create(anchorService);
    const transactionBuilderService =
      SolanaTransactionBuilderService.create(anchorService);
    const transactionService = SolanaTransactionService.create(connection);
    // const clusterStateService = SolanaClusterStateService.create(connection);

    const protocol: SolanaProtocol<GameEvent> = new SolanaProtocol<GameEvent>(
      connection
    );
    const boardSubscriberService = SolanaBoardSubscriberService.create(
      anchorService,
      protocol
    );

    return new SolanaChain(
      boardHistoryService,
      boardService,
      transactionBuilderService,
      transactionService,
      protocol,

      anchorService,
      boardSubscriberService
    );
  }
}
