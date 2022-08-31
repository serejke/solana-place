import express, {Express} from "express";
import 'express-async-errors'; // Enable error handling for async routes: https://github.com/davidbanham/express-async-errors/
import http from "http";
import cors from "cors";
import {createTerminus} from "@godaddy/terminus";
import ApiServer from "./controller/api";
import {Connection} from "@solana/web3.js";
import {clusterUrl} from "./program/urls";
import WebSocketServer from "./controller/socket";
import AnchorService from "./service/AnchorService";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "./program/program";
import {BoardSubscriberService} from "./service/BoardSubscriberService";
import {BoardService} from "./service/BoardService";
import {BoardHistoryService} from "./service/BoardHistoryService";
import {CloseableService} from "./service/CloseableService";
import {TransactionBuilderService} from "./service/TransactionBuilderService";
import {TransactionService} from "./service/TransactionService";
import path from "path";
import {Protocol} from "./protocol/protocol";
import {GameEvent} from "./model/gameEvent";
import {toEventWithTransactionDetailsDto} from "./dto-converter/converter";

export class Application {
  constructor(
    private closeableServices: CloseableService[]
  ) {
  }

  static async start(): Promise<Application> {
    const [app, httpServer] = this.startExpressApp();

    const connection = new Connection(clusterUrl, "confirmed");
    console.log(`Connected to RPC node ${clusterUrl}`)
    console.log(`Solana Place Program ID ${PROGRAM_ID.toBase58()}`)
    console.log(`Solana Place Game Account ${GAME_PROGRAM_ACCOUNT.toBase58()}`)

    const webSocketServer = WebSocketServer.start(httpServer);

    const anchorService = await AnchorService.create(connection, PROGRAM_ID);
    const protocol: Protocol<GameEvent> = new Protocol<GameEvent>(connection);
    protocol.addListener((eventWithTransactionDetails) => {
      const eventWithTransactionDetailsDto = toEventWithTransactionDetailsDto(eventWithTransactionDetails);
      webSocketServer.send(eventWithTransactionDetailsDto);
    });
    const boardSubscriberService = BoardSubscriberService.create(anchorService, protocol);
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
      apiServer,

      protocol
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

    // Redirect to HTTPs when deployed to Heroku
    //  https://help.heroku.com/J2R1S4T8/can-heroku-force-an-application-to-use-ssl-tls
    if (
      process.env.NODE_ENV === "production" &&
      process.env.FORCE_HTTPS !== undefined
    ) {
      app.use((req, res, next) => {
        if (req.header("x-forwarded-proto") !== "https") {
          res.redirect(`https://${req.header("host")}${req.url}`);
        } else {
          next();
        }
      });
    }

    if (process.env.NODE_ENV === "production") {
      const rootPath = path.join(__dirname, "..", "..");
      const staticPath = path.join(rootPath, "client", "build");
      console.log(`Serving static files from: ${staticPath}`);
      app.use("/", express.static(staticPath));
    }

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