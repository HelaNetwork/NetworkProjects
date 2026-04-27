/**
 * AI Service for CryptoDuo.
 * Currently uses rule-based logic, following a structure easy to replace with LLM APIs.
 */

const AI_RULES = {
  HINTS: {
    EASY: [
      "Check your MetaMask history for the latest hash beginning with 0x.",
      "A transaction hash is always 66 characters long.",
      "Make sure you are on the Sepolia Testnet before sending ETH."
    ],
    HARD: [
      "The EVM requires a valid 32-byte hash.",
      "Verify the 'from' field in the TX receipt."
    ]
  }
};

export const generateHint = async (errors, level) => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 500));

  if (errors >= 3) {
    return AI_RULES.HINTS.EASY[Math.floor(Math.random() * AI_RULES.HINTS.EASY.length)];
  }
  
  if (level === 'Advanced') {
    return AI_RULES.HINTS.HARD[Math.floor(Math.random() * AI_RULES.HINTS.HARD.length)];
  }

  return "Scan the blockchain for your transaction proof.";
};

/**
 * Placeholder for future LLM integration (e.g., OpenAI/Gemini)
 */
export const getAIExplanation = async (topic) => {
  // In a future version:
  // const response = await fetch('YOUR_AI_ENDPOINT', { ... });
  // return response.json();
  return `AI Explanation for ${topic}: Distributed ledger technology ensures transparency...`;
};
