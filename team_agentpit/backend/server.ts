import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { loadEnv } from "../shared/load-env.js";
import { createApp } from "./app.js";
import { env, hasDatabaseUrl } from "./config/env.js";
import { setBroker } from "./lib/broker-registry.js";
import { WebsocketBroker } from "./lib/ws-broker.js";
import { getMarketplaceRepository } from "./repositories/index.js";
import dotenv from 'dotenv'
dotenv.config();
loadEnv();

const app = createApp();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const broker = new WebsocketBroker(wss);
setBroker(broker);
void getMarketplaceRepository();

server.listen(env.backendPort, () => {
  console.log(`[backend] listening on http://localhost:${env.backendPort}`);
  console.log(`[backend] websocket available at ws://localhost:${env.backendPort}/ws`);
  console.log(
    `[backend] repository=${hasDatabaseUrl() ? "prisma-postgres" : "in-memory-fallback"}`,
  );
  console.log(
    `[backend] proposal-x402=${env.proposalSubmissionPayTo ? "enabled" : "disabled"}`,
  );
  if (env.proposalSubmissionPayTo) {
    console.log(
      `[backend] proposal-x402-network=${env.proposalSubmissionNetwork} pricing=${
        env.proposalSubmissionAsset && env.proposalSubmissionAmountAtomic
          ? `${env.proposalSubmissionAmountAtomic}@${env.proposalSubmissionAsset}`
          : env.proposalSubmissionPriceUsd
      }`,
    );
  }
});
