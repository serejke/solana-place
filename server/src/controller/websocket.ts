import WebSocket from "ws";
import http from "http";
import {CloseableService} from "../service/CloseableService";

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export default class WebSocketServer implements CloseableService {

  constructor(private wss: WebSocket.Server) {
  }

  static start(httpServer: http.Server): WebSocketServer {
    // Start websocket server
    let activeUsers = 0;
    const wss = new WebSocket.Server({ server: httpServer });
    wss.on("connection", function connection(ws) {
      let isAlive = true;

      function heartbeat() {
        isAlive = true;
      }

      const interval = setInterval(function ping() {
        if (!isAlive) return ws.terminate();
        isAlive = false;
        ws.ping(noop);
      }, 30000);

      activeUsers++;
      ws.on("close", () => {
        clearInterval(interval);
        activeUsers--;
      });
      ws.on("message", (data: Buffer, isBinary: boolean) => {
        console.log("Received message", isBinary, data);
      });
      ws.on("pong", heartbeat);
    });

    // Start active user broadcast loop
    setInterval(() => {
      this.sendToAllClients(wss, JSON.stringify({ type: "heartbeat", activeUsers }))
    }, 1000);
    return new WebSocketServer(wss);
  }

  send(data: unknown): void {
    WebSocketServer.sendToAllClients(this.wss, JSON.stringify(data));
  }

  async close(): Promise<void> {
    this.wss.close()
  }

  private static sendToAllClients(wss: WebSocket.Server, data: string): void {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }
}
