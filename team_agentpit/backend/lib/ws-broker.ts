import type { WebSocketServer } from "ws";
import { jsonReplacer } from "./http.js";

export class WebsocketBroker {
  constructor(private readonly wss: WebSocketServer) {}

  broadcast(event: string, payload: unknown) {
    const body = JSON.stringify(
      { event, payload, timestamp: new Date().toISOString() },
      jsonReplacer,
    );

    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(body);
      }
    }
  }
}
