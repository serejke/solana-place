import express, {Express} from "express";
import http from "http";
import cors from "cors";
import {createTerminus} from "@godaddy/terminus";
import ApiServer from "./controller/api";
import {Connection} from "@solana/web3.js";
import {clusterUrl} from "./program/urls";
import WebSocketServer from "./controller/websocket";
import AnchorService from "./service/AnchorService";
import {PROGRAM_ID} from "./program/program";
import {BoardSubscriberService} from "./service/BoardSubscriberService";
import {BoardService} from "./service/BoardService";
import {BoardHistoryService} from "./service/BoardHistoryService";
import {CloseableService} from "./service/CloseableService";
import {TransactionBuilderService} from "./service/TransactionBuilderService";
import {TransactionService} from "./service/TransactionService";

export class Application {
  constructor(
    private closeableServices: CloseableService[]
  ) {
  }

  static async start(): Promise<Application> {
    const [app, httpServer] = this.startExpressApp();

    const connection = new Connection(clusterUrl, "confirmed");
    const webSocketServer = WebSocketServer.start(httpServer);

    const anchorService = await AnchorService.create(connection, PROGRAM_ID);
    const boardSubscriberService = BoardSubscriberService.create(anchorService, webSocketServer);
    const boardService = BoardService.create(anchorService);
    const boardHistoryService = BoardHistoryService.create(anchorService);
    const transactionBuilderService = TransactionBuilderService.create(anchorService);
    const transactionService = TransactionService.create(connection);
    // const clusterStateService = ClusterStateService.create(connection);

    const apiServer = await ApiServer.start(
      app,
      boardService,
      boardHistoryService,
      transactionService,
      transactionBuilderService
    );

    const allServices = [
      anchorService,
      boardSubscriberService,
      boardService,
      boardHistoryService,
      transactionService,
      transactionBuilderService,
      // clusterStateService,

      webSocketServer,
      apiServer
    ]

    const application = new Application(allServices);

    createTerminus(httpServer, {
      signal: 'SIGINT',
      healthChecks: {
        '/health': async () => "OK"
      },
      onSignal: async () => {
        console.log("Shutting down the server")
        await application.close();
      }
    })

    return application;
  }

  private static startExpressApp(): [Express, http.Server] {
    const app = express();

    const httpServer = http.createServer(app);
    const port = process.env.PORT || 8080;
    httpServer.listen(port);
    console.log(`Server listening on port: ${port}`);

    app.use(cors());
    app.use(express.json());
    return [app, httpServer];
  }

  async close(): Promise<void> {
    for (const service of this.closeableServices) {
      try {
        await service.close();
      } catch (e) {
        console.error("Failed to close", service);
      }
    }
  }
}