import type { WebsocketBroker } from "./ws-broker.js";

let broker: WebsocketBroker | null = null;

export function setBroker(nextBroker: WebsocketBroker) {
  broker = nextBroker;
}

export function getBroker() {
  return broker;
}
