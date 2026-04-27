import { useState } from 'react';

/**
 * Adaptive learning hook that adjusts "AI" difficulty based on errors.
 */
export const useAdaptiveLearning = () => {
  const [errors, setErrors] = useState(0);
  const [successes, setSuccesses] = useState(0);

  const recordError = () => {
    setErrors(prev => prev + 1);
    setSuccesses(0); // Reset success streak
  };

  const recordSuccess = () => {
    setSuccesses(prev => prev + 1);
    // If user is succeeding consistently, we can "pre-emptively" reduce hint assistance
  };

  const getDifficultyProfile = () => {
    if (errors >= 3) {
      return {
        level: 'EASY',
        hintVerbosity: 'DETAILED',
        aiComment: 'Take it slow! Here is a deep dive into the concept...',
        unlockedHarderTasks: false
      };
    }
    
    if (successes >= 5) {
      return {
        level: 'HARD',
        hintVerbosity: 'MINIMAL',
        aiComment: 'Impressive! You are ready for expert-level tasks.',
        unlockedHarderTasks: true
      };
    }

    return {
      level: 'BALANCED',
      hintVerbosity: 'NORMAL',
      aiComment: 'Good progress. Keep going!',
      unlockedHarderTasks: false
    };
  };

  const resetPerformance = () => {
    setErrors(0);
    setSuccesses(0);
  };

  return { errors, successes, recordError, recordSuccess, profile: getDifficultyProfile(), resetPerformance };
};
