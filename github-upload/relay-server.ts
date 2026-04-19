import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const HTTP_PORT = 3001;
const WS_PORT = 3002;

// --- State ---
// This acts purely as a routing table. We are NOT storing messages here.
// Map<PeerId, WebSocket>
const activePeers = new Map<string, WebSocket>();

// --- WebSocket Server (The Relay Node) ---
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`[Relay Node] WebSocket server started on ws://localhost:${WS_PORT}`);

wss.on('connection', (ws) => {
  let currentPeerId: string | null = null;
  
  console.log('[Relay Node] New connection established.');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // Protocol 1: Peer Registration
      if (message.type === 'REGISTER') {
        const { peerId } = message.payload;
        if (!peerId) return;

        currentPeerId = peerId;
        activePeers.set(peerId, ws);
        
        console.log(`[Relay Node] Peer Registered: ${peerId}`);
        console.log(`[Relay Node] Total Active Peers: ${activePeers.size}`);
        
        // Let the peer know registration was successful
        ws.send(JSON.stringify({ type: 'REGISTERED', payload: { success: true } }));
      }

      // Protocol 2: P2P Message Routing
      else if (message.type === 'P2P_MESSAGE') {
         const { recipientId, senderId, text, id, timestamp, senderAlias, isSystemMessage } = message.payload;
         
         console.log(`[Relay Node] Routing message from ${senderId.substring(0,25)}... to ${recipientId.substring(0,25)}...`);

         const recipientWs = activePeers.get(recipientId);

         if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            // Recipient is online. Route the message immediately without storing it.
            recipientWs.send(JSON.stringify({
               type: 'INCOMING_MESSAGE',
               payload: { id, senderId, text, timestamp, senderAlias, isSystemMessage }
            }));
            console.log(`[Relay Node] Message delivered successfully to ${recipientId}`);
         } else {
            // Recipient is offline. In a true Waku network, a Store node would cache this.
            // For our strict "No DB" prototype, the message is dropped.
            console.log(`[Relay Node] Delivery failed. Peer ${recipientId} is offline. Dropping message.`);
            
            // Optionally, we could bounce back an error to the sender
            ws.send(JSON.stringify({
               type: 'ERROR',
               payload: { message: `Peer ${recipientId} is currently offline. Msg dropped.` }
            }));
         }
      }

    } catch (e) {
      console.error('[Relay Node] Failed to parse incoming message:', e);
    }
  });

  ws.on('close', () => {
    if (currentPeerId) {
       activePeers.delete(currentPeerId);
       console.log(`[Relay Node] Peer Disconnected: ${currentPeerId}`);
       console.log(`[Relay Node] Total Active Peers: ${activePeers.size}`);
    }
  });
});


// --- HTTP Server (Optional, just to show it's running) ---
app.get('/health', (req, res) => {
   res.json({ status: 'healthy', activePeers: activePeers.size });
});

app.listen(HTTP_PORT, () => {
   console.log(`[Relay Node] Healthcheck running on http://localhost:${HTTP_PORT}/health`);
});
