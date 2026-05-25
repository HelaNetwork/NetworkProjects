import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export async function unlockAchievement(userId: string, badgeId: string) {
  try {
    // Check if already unlocked
    const achCol = collection(db, 'achievements');
    const q = query(achCol, where('user_id', '==', userId), where('badge_id', '==', badgeId));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      await addDoc(achCol, {
        user_id: userId,
        badge_id: badgeId,
        unlocked_at: serverTimestamp()
      });
      console.log(`Achievement unlocked: ${badgeId}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error unlocking achievement:', err);
    return false;
  }
}
