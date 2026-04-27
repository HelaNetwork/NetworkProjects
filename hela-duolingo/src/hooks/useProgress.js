import { useState, useEffect } from 'react';

/**
 * Hook to manage user progress, gamification, and streaks.
 */
export const useProgress = () => {
  // --- Persistent State ---
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('cryptoDuo_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('cryptoDuo_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('cryptoDuo_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastActive, setLastActive] = useState(() => {
    return localStorage.getItem('cryptoDuo_lastActive') || null;
  });

  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('cryptoDuo_badges');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Effects for Persistence ---
  useEffect(() => {
    localStorage.setItem('cryptoDuo_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('cryptoDuo_completed', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('cryptoDuo_streak', streak.toString());
    if (lastActive) localStorage.setItem('cryptoDuo_lastActive', lastActive);
  }, [streak, lastActive]);

  useEffect(() => {
    localStorage.setItem('cryptoDuo_badges', JSON.stringify(badges));
  }, [badges]);

  // --- Gamification Logic ---

  // Calculate Level based on XP
  const getLevel = () => {
    if (xp < 500) return { name: 'Beginner', color: 'text-duo-green' };
    if (xp < 1500) return { name: 'Intermediate', color: 'text-duo-blue' };
    return { name: 'Advanced', color: 'text-duo-yellow' };
  };

  const addXp = (amount) => {
    setXp(prev => prev + amount);
  };

  const awardBadge = (badgeId) => {
    if (!badges.includes(badgeId)) {
      setBadges(prev => [...prev, badgeId]);
      addXp(100); // Massive bonus for milestone
    }
  };

  const markLessonCompleted = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
      addXp(50);
      awardBadge(`Badge: ${lessonId}`);
    }
  };

  // Streak logic
  const updateStreak = () => {
    const now = new Date();
    const todayStr = now.toDateString();

    if (lastActive === todayStr) return; // Already checked today

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActive === yesterdayStr) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(1); // Reset if day missed
    }
    setLastActive(todayStr);
  };

  // Auto-update streak on mount
  useEffect(() => {
    updateStreak();
  }, []);

  return { 
    xp, 
    level: getLevel(), 
    streak, 
    badges,
    completedLessons, 
    addXp, 
    markLessonCompleted, 
    awardBadge 
  };
};
