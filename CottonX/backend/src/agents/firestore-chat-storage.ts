/**
 * FirestoreChatStorage — Replaces DynamoDbChatStorage.
 * Stores multi-agent chat history in Firestore for the orchestrator.
 */

import { ChatStorage, ConversationMessage } from 'multi-agent-orchestrator';
import { getFirestore } from '../gcp/firestore';

const COLLECTION = 'chat_history';

function makeDocId(userId: string, sessionId: string, agentId: string): string {
  return `${userId}__${sessionId}__${agentId}`;
}

export class FirestoreChatStorage extends ChatStorage {
  private ttlSeconds: number;

  constructor(ttlSeconds: number = 3600) {
    super();
    this.ttlSeconds = ttlSeconds;
  }

  async saveChatMessage(
    userId: string,
    sessionId: string,
    agentId: string,
    newMessage: ConversationMessage,
    maxHistorySize?: number,
  ): Promise<ConversationMessage[]> {
    const db = getFirestore();
    const docId = makeDocId(userId, sessionId, agentId);
    const docRef = db.collection(COLLECTION).doc(docId);

    const existing = await docRef.get();
    let messages: ConversationMessage[] = existing.exists
      ? (existing.data()?.messages || [])
      : [];

    messages.push(newMessage);

    // Trim to max history size
    if (maxHistorySize && messages.length > maxHistorySize) {
      messages = messages.slice(-maxHistorySize);
    }

    await docRef.set({
      userId,
      sessionId,
      agentId,
      messages,
      updatedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + this.ttlSeconds,
    });

    return messages;
  }

  async fetchChat(
    userId: string,
    sessionId: string,
    agentId: string,
  ): Promise<ConversationMessage[]> {
    const db = getFirestore();
    const docId = makeDocId(userId, sessionId, agentId);
    const doc = await db.collection(COLLECTION).doc(docId).get();

    if (!doc.exists) return [];
    return doc.data()?.messages || [];
  }

  async fetchAllChats(
    userId: string,
    sessionId: string,
  ): Promise<ConversationMessage[]> {
    const db = getFirestore();
    const snapshot = await db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('sessionId', '==', sessionId)
      .get();

    const allMessages: ConversationMessage[] = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data?.messages) {
        allMessages.push(...data.messages);
      }
    });
    return allMessages;
  }
}
