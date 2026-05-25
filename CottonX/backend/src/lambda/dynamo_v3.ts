/**
 * dynamo_v3.ts — Firestore-backed drop-in replacement.
 *
 * Every public function keeps its original parameter list so that all existing
 * callers continue to compile.  The `client: DynamoDBDocumentClient` param is
 * accepted but **ignored** — all operations go through the shared Firestore
 * singleton.
 */

import { getFirestore } from '../gcp/firestore';
import { logConsole } from '../utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function encodeDocId(pk: string, sk: string): string {
  // Firestore doc IDs can't contain '/', so we encode them
  return `${pk}___${sk}`.replace(/\//g, '__SLASH__');
}

// ── Query / Scan ─────────────────────────────────────────────────────────────

interface QueryExpression {
  condition: string;
  values: Record<string, any>;
  filter?: string;
  attributeNames?: Record<string, string>;
}

interface ScanExpression {
  filter?: string;
  values?: Record<string, any>;
  attributeNames?: Record<string, string>;
}

/**
 * Query items by PK (and optionally SK prefix / range).
 *
 * The original DynamoDB KeyConditionExpression is parsed minimally:
 *   - `PK = :pk`
 *   - `PK = :pk AND begins_with(SK, :skPrefix)`
 *   - `PK = :pk AND SK = :sk`
 */
export const query = async <T>(
  tableName: string,
  expression: QueryExpression,
  _client: any,
  _indexName?: string,
  _handlePagination: boolean = false,
  ascendingOrder: boolean = true,
  limit: number | undefined = undefined
): Promise<Array<T>> => {
  const db = getFirestore();
  const col = db.collection(tableName);

  // Extract PK value from expression values
  const pkValue = expression.values[':pk'] || expression.values[':PK']
    || Object.values(expression.values)[0];

  let q: FirebaseFirestore.Query = col.where('PK', '==', pkValue);

  // Try to detect SK condition
  const condLower = expression.condition.toLowerCase();
  if (condLower.includes('begins_with')) {
    const skPrefix = expression.values[':skPrefix'] || expression.values[':sk']
      || Object.values(expression.values)[1];
    if (skPrefix) {
      q = q.where('SK', '>=', skPrefix)
           .where('SK', '<=', skPrefix + '\uf8ff');
    }
  } else if (condLower.includes('sk =') || condLower.includes('sk=')) {
    const skValue = expression.values[':sk'] || Object.values(expression.values)[1];
    if (skValue) {
      q = q.where('SK', '==', skValue);
    }
  }

  q = q.orderBy('SK', ascendingOrder ? 'asc' : 'desc');
  if (limit) q = q.limit(limit);

  const snapshot = await q.get();
  const items = snapshot.docs.map((doc) => doc.data() as T);
  logConsole.info(`[Firestore query] ${tableName} PK=${pkValue} → ${items.length} items`);
  return items;
};

export const scan = async <T>(
  tableName: string,
  _expression: ScanExpression,
  _client: any,
  _indexName?: string,
  _handlePagination: boolean = false
): Promise<Array<T>> => {
  const db = getFirestore();
  const snapshot = await db.collection(tableName).get();
  return snapshot.docs.map((doc) => doc.data() as T);
};

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const getItem = async <T>(
  pk: string,
  sk: string,
  tableName: string,
  _client: any
): Promise<T | null> => {
  const db = getFirestore();
  const docId = encodeDocId(pk, sk);
  const doc = await db.collection(tableName).doc(docId).get();
  if (!doc.exists) return null;
  return doc.data() as T;
};

export const createItem = async (
  pk: string,
  sk: string,
  props: Partial<any>,
  tableName: string,
  _client: any
) => {
  const db = getFirestore();
  const docId = encodeDocId(pk, sk);
  await db.collection(tableName).doc(docId).set({
    PK: pk,
    SK: sk,
    ...props,
  });
  return { PK: pk, SK: sk };
};

export const updateItem = async (
  key: any,
  updateValues: any,
  tableName: string,
  _client: any,
  _conditionExpression?: string,
  _expressionAttributeValuesSub?: Record<string, any>,
  _expressionAttributeNamesSub?: Record<string, any>
) => {
  const db = getFirestore();
  const pk = key.PK || key.pk;
  const sk = key.SK || key.sk;
  const docId = encodeDocId(pk, sk);
  await db.collection(tableName).doc(docId).update(updateValues);
  return { Attributes: { ...key, ...updateValues } };
};

export const deleteItem = async (
  id: string,
  tableName: string,
  _client: any
) => {
  const db = getFirestore();
  // Legacy interface used a single 'id' key — try to find the doc
  const snapshot = await db.collection(tableName)
    .where('PK', '==', id)
    .limit(1)
    .get();
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.delete();
  }
};

/**
 * Stores a system event (action taken by an agent) under a user's document.
 * Path: users/{userId}/events/{eventId}
 */
export const storeUserEvent = async (
  userId: string,
  eventId: string,
  data: any
) => {
  const db = getFirestore();
  const cleanUserId = userId.replace("user_", ""); // Strip prefix if present
  
  await db
    .collection('users')
    .doc(cleanUserId)
    .collection('events')
    .doc(eventId)
    .set({
      id: eventId,
      userId: cleanUserId,
      timestamp: new Date().toISOString(),
      ...data,
    });
    
  logConsole.info(`[Firestore] Storing event for user: ${cleanUserId}, event: ${eventId}`);
  return { userId: cleanUserId, eventId };
};
