import express, { Express } from "express";
import "express-async-errors"; // Enable error handling for async routes: https://github.com/davidbanham/express-async-errors/
import http from "http";
import cors from "cors";
import { createTerminus } from "@godaddy/terminus";
import ApiServer from "./controller/api";
import WebSocketServer from "./controller/socket";
import { CloseableService } from "./service/CloseableService";
import path from "path";
import { toEventWithTransactionDetailsDto } from "./dto-converter/converter";
import { SolanaChain } from "./chains/solana";

export class Application {
  constructor(private closeableServices: CloseableService[]) {}

  static async start(): Promise<Application> {
    const [app, httpServer] = this.startExpressApp();

    const webSocketServer = WebSocketServer.start(httpServer);

    const solanaChain = await SolanaChain.initialize();

    solanaChain.protocol.addListener((eventWithTransactionDetails) => {
      const eventWithTransactionDetailsDto = toEventWithTransactionDetailsDto(
        eventWithTransactionDetails
      );
      webSocketServer.send(eventWithTransactionDetailsDto);
    });

    const apiServer = await ApiServer.start(
      app,
      solanaChain.boardService,
      solanaChain.boardHistoryService,
      solanaChain.transactionService,
      solanaChain.transactionBuilderService
    );

    const allServices = [solanaChain, webSocketServer, apiServer];

    const application = new Application(allServices);

    createTerminus(httpServer, {
      signal: "SIGINT",
      healthChecks: {
        "/health": async () => "OK",
      },
      onSignal: async () => {
        console.log("Shutting down the server");
        await application.close();
      },
    });

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
