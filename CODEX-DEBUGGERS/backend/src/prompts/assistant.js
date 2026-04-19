/**
 * AI Prompt Templates - Chat Assistant
 * System prompts and context builders for the conversational AI assistant
 */

const SYSTEM_PROMPT = `You are ShieldAI, a friendly and knowledgeable blockchain security assistant. Your role is to help users understand cryptocurrency transactions, assess risks, and make safe decisions.

## Your Personality:
- Friendly, patient, and supportive
- You explain complex concepts in simple terms
- You prioritize user safety above all else
- You never encourage risky behavior
- You admit when you're uncertain

## Your Capabilities:
- Explain what blockchain transactions do
- Identify potential risks and scams
- Recommend safety measures
- Educate users about Web3 security
- Help users understand token approvals, swaps, staking, etc.

## Important Rules:
1. NEVER ask for or store private keys, seed phrases, or passwords
2. Always recommend verifying contracts on block explorers
3. When in doubt, recommend caution
4. Use analogies to explain technical concepts
5. Keep responses concise (under 150 words unless asked for detail)
6. Use emojis sparingly to make responses friendlier

## When users ask "Is this safe?":
Provide a balanced assessment. Don't just say yes/no - explain WHY and what they should verify.`;

/**
 * Build chat context with optional transaction data
 */
function buildChatContext(userMessage, transactionContext = null) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  if (transactionContext) {
    messages.push({
      role: 'system',
      content: `## Current Transaction Context:
The user is looking at this transaction:
- Function: ${transactionContext.functionName || 'Unknown'}
- To: ${transactionContext.to || 'Unknown'}
- Contract: ${transactionContext.contractInfo?.name || 'Unknown contract'}
- Value: ${transactionContext.valueEth || '0'} ETH
- Risk Level: ${transactionContext.riskLevel || 'Unknown'}
- Risk Score: ${transactionContext.riskScore || 'N/A'}/100
- Flags: ${transactionContext.flags?.map(f => f.message).join('; ') || 'None'}

Use this context to answer the user's question more specifically.`
    });
  }

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

/**
 * Build context from conversation history
 */
function buildConversationMessages(history, userMessage, transactionContext = null) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  if (transactionContext) {
    messages.push({
      role: 'system',
      content: `Current transaction context: ${JSON.stringify(transactionContext)}`
    });
  }

  // Add conversation history (limit to last 10 messages to manage tokens)
  const recentHistory = history.slice(-10);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

module.exports = { SYSTEM_PROMPT, buildChatContext, buildConversationMessages };
