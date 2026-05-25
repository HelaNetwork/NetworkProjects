import { WebSocket } from 'ws';

/**
 * In-memory WebSocket connection manager.
 * Replaces the AWS DynamoDB WebSocket connection table + API Gateway Management API.
 * Key format: `session#{sessionId}::character#{characterId}`
 */
class WebSocketManager {
  private connections = new Map<string, WebSocket>();

  private makeKey(sessionId: string, characterId: string): string {
    return `session#${sessionId}::character#${characterId}`;
  }

  /** Register a new WebSocket connection for a session/character pair. */
  register(sessionId: string, characterId: string, ws: WebSocket): void {
    const key = this.makeKey(sessionId, characterId);
    // Close any existing connection for this key
    const existing = this.connections.get(key);
    if (existing && existing.readyState === WebSocket.OPEN) {
      existing.close();
    }
    this.connections.set(key, ws);
    console.info(`[WS Manager] Registered: ${key}. Total connections: ${this.connections.size}`);

    ws.on('close', () => {
      // Only delete if it's still the same WebSocket (guard against race)
      if (this.connections.get(key) === ws) {
        this.connections.delete(key);
        console.info(`[WS Manager] Removed: ${key}. Total connections: ${this.connections.size}`);
      }
    });
  }

  /** Send a message to the WebSocket identified by session/character. */
  sendMessage(sessionId: string, characterId: string, message: string): boolean {
    const key = this.makeKey(sessionId, characterId);
    const ws = this.connections.get(key);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      return true;
    }
    console.warn(`[WS Manager] No open connection for: ${key}`);
    return false;
  }

  /** Check if a connection exists and is open. */
  isConnected(sessionId: string, characterId: string): boolean {
    const key = this.makeKey(sessionId, characterId);
    const ws = this.connections.get(key);
    return !!ws && ws.readyState === WebSocket.OPEN;
  }

  /** Get all active connection keys (for debugging). */
  getActiveConnections(): string[] {
    return Array.from(this.connections.keys());
  }
}

// Singleton instance — shared across all modules
export const wsManager = new WebSocketManager();
