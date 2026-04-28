import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type LessonTaskVerificationContextValue = {
  taskVerified: boolean;
  markTaskVerified: () => void;
  resetTaskVerification: () => void;
};

const LessonTaskVerificationContext = createContext<LessonTaskVerificationContextValue | null>(null);

export function LessonTaskVerificationProvider({ children }: { children: ReactNode }) {
  const [taskVerified, setTaskVerified] = useState(false);
  const markTaskVerified = useCallback(() => setTaskVerified(true), []);
  const resetTaskVerification = useCallback(() => setTaskVerified(false), []);
  const value = useMemo(
    () => ({ taskVerified, markTaskVerified, resetTaskVerification }),
    [taskVerified, markTaskVerified, resetTaskVerification]
  );
  return <LessonTaskVerificationContext.Provider value={value}>{children}</LessonTaskVerificationContext.Provider>;
}

export function useLessonTaskVerification() {
  return useContext(LessonTaskVerificationContext);
}
