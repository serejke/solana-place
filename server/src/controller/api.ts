import {cluster, clusterUrl} from "../program/urls";
import {GAME_PROGRAM_ACCOUNT, PROGRAM_ID} from "../program/program";
import {Express} from "express";
import {toBoardHistoryDto, toBoardStateDto} from "../dto/converter";
import {BoardService} from "../service/BoardService";
import {BoardHistoryService} from "../service/BoardHistoryService";
import {CloseableService} from "../service/CloseableService";

export default class ApiServer implements CloseableService {

  static async start(
    app: Express,
    boardService: BoardService,
    boardHistoryService: BoardHistoryService
  ): Promise<ApiServer> {
    app.get("/init", async (req, res) => {
      res
        .send(
          JSON.stringify({
            programId: PROGRAM_ID.toBase58(),
            clusterUrl,
            cluster,
            gameAccount: GAME_PROGRAM_ACCOUNT.toBase58()
          })
        )
        .end();
    });

    app.get("/board", async (req, res) => {
      const boardState = await boardService.getBoardState()
      res.send(JSON.stringify(toBoardStateDto(boardState)));
    })

    app.get("/board-history", async (req, res) => {
      res.send(JSON.stringify(toBoardHistoryDto(await boardHistoryService.getBoardHistory())));
    })

    return new ApiServer();
  }

  async close(): Promise<void> {
    return;
  }
}
