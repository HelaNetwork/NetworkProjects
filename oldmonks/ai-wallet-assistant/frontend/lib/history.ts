export type Status = "Safe" | "Warning" | "Critical";

export type Analysis = {
  id: string;
  timestamp: number;
  inputText: string;
  result: {
    status: Status;
    summary: string;
    details: string;
  };
  chatHistory: {
    role: "user" | "assistant";
    message: string;
  }[];
};

const HISTORY_KEY = 'ai-wallet-history';

export function saveAnalysis(analysis: Analysis): void {
  if (typeof window === 'undefined') return;
  
  try {
    const analyses = getAllAnalyses();
    const updated = analyses.filter(a => a.id !== analysis.id).concat(analysis);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save analysis:', error);
  }
}

export function getAllAnalyses(): Analysis[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) as Analysis[] : [];
  } catch (error) {
    console.error('Failed to load analyses:', error);
    return [];
  }
}

export function getAnalysisById(id: string): Analysis | null {
  if (typeof window === 'undefined') return null;
  
  const analyses = getAllAnalyses();
  return analyses.find(a => a.id === id) || null;
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// Helper to create new analysis
export function createAnalysis(
  inputText: string, 
  result: {status: Status; summary: string; details: string},
  chatHistory: Analysis['chatHistory'] = []
): Analysis {
  const generateId = () => {
    try { return crypto.randomUUID(); } catch (e) { return Math.random().toString(36).substring(2, 15); }
  };
  return {
    id: generateId(),
    timestamp: Date.now(),
    inputText,
    result,
    chatHistory
  };
}

