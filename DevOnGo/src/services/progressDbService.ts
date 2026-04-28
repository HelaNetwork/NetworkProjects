import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/src/services/firebase';
import { lessons } from '@/src/utils/lessons';

export type LessonCompletionDbInfo = {
  username: string;
  moduleName: string;
};

export type BattlePlayerDbInfo = {
  username: string;
  score: number;
  rank: number;
};

function emailToUsername(email: string | null | undefined): string {
  if (!email) return 'learner';
  const local = email.split('@')[0] || 'learner';
  return local;
}

/**
 * Fetches the learner identity and lesson title from Firestore + curriculum metadata.
 * Call after a lesson is marked complete to confirm what is stored for the user.
 */
export async function fetchLessonCompletionFromDb(
  userId: string,
  lessonId: string
): Promise<LessonCompletionDbInfo | null> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return null;
  const data = userSnap.data() as { email?: string | null };
  const lesson = lessons.find((l) => l.id === lessonId);
  return {
    username: emailToUsername(data.email),
    moduleName: lesson?.title ?? lessonId,
  };
}

/**
 * Reads live player documents for a session, sorts by score, and returns ranked rows.
 * Call after a multiplayer or contest match ends (session status `ended`).
 */
export async function fetchBattleRoomResultsFromDb(
  sessionId: string
): Promise<BattlePlayerDbInfo[]> {
  const snap = await getDocs(collection(db, 'game_sessions', sessionId, 'players'));
  const rows = snap.docs.map((d) => {
    const p = d.data() as { email?: string | null; score?: number };
    return {
      username: emailToUsername(p.email),
      score: typeof p.score === 'number' ? p.score : 0,
    };
  });
  rows.sort((a, b) => b.score - a.score);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
