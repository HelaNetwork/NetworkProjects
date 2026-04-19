/**
 * AI Service - Groq Integration
 * Handles all LLM calls for transaction explanation, risk analysis, and chat
 */

const Groq = require('groq-sdk');
const { buildExplainerPrompt } = require('../prompts/explainer');
const { buildRiskAnalysisPrompt } = require('../prompts/riskAnalysis');
const { buildChatContext, buildConversationMessages } = require('../prompts/assistant');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

/**
 * Helper – call Groq chat completions
 */
async function callGroq(messages, { temperature = 0.3, max_tokens = 500 } = {}) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature,
    max_tokens,
  });
  return completion.choices[0]?.message?.content ?? '';
}

/**
 * Generate a human-readable explanation of a transaction
 */
async function explainTransaction(decoded, riskAssessment) {
  if (!process.env.GROQ_API_KEY) {
    return generateFallbackExplanation(decoded, riskAssessment);
  }

  try {
    const prompt = buildExplainerPrompt(decoded, riskAssessment);
    const reply = await callGroq(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3, max_tokens: 500 }
    );
    return reply || generateFallbackExplanation(decoded, riskAssessment);
  } catch (error) {
    console.error('AI explainer error:', error.message);
    return generateFallbackExplanation(decoded, riskAssessment);
  }
}

/**
 * Generate AI-powered risk analysis
 */
async function analyzeRiskWithAI(decoded, riskAssessment) {
  if (!process.env.GROQ_API_KEY) {
    return generateFallbackRiskAnalysis(decoded, riskAssessment);
  }

  try {
    const prompt = buildRiskAnalysisPrompt(decoded, riskAssessment);
    const reply = await callGroq(
      [{ role: 'user', content: prompt }],
      { temperature: 0.2, max_tokens: 600 }
    );
    return reply || generateFallbackRiskAnalysis(decoded, riskAssessment);
  } catch (error) {
    console.error('AI risk analysis error:', error.message);
    return generateFallbackRiskAnalysis(decoded, riskAssessment);
  }
}

/**
 * Chat with the AI assistant
 */
async function chat(userMessage, history = [], transactionContext = null) {
  if (!process.env.GROQ_API_KEY) {
    return generateFallbackChatResponse(userMessage, transactionContext);
  }

  try {
    let messages;
    if (history.length > 0) {
      messages = buildConversationMessages(history, userMessage, transactionContext);
    } else {
      messages = buildChatContext(userMessage, transactionContext);
    }

    const reply = await callGroq(messages, { temperature: 0.5, max_tokens: 500 });
    return reply || "I'm sorry, I couldn't process that request. Could you try rephrasing?";
  } catch (error) {
    console.error('AI chat error:', error.message);
    return generateFallbackChatResponse(userMessage, transactionContext);
  }
}

// =============================================
// Fallback responses (when no API key is set)
// =============================================

function generateFallbackExplanation(decoded, riskAssessment) {
  let explanation = '';

  switch (decoded.category) {
    case 'transfer':
      if (decoded.functionName === 'ETH Transfer') {
        explanation = `**What this does:** You're sending ${decoded.valueEth} ETH to address ${decoded.to?.slice(0, 10)}... This is a simple ETH transfer.`;
      } else {
        explanation = `**What this does:** You're transferring tokens to another address using the ${decoded.functionName} function.`;
      }
      break;
    case 'approval':
      const isUnlimited = decoded.flags?.some(f => f.message?.includes('UNLIMITED'));
      if (isUnlimited) {
        explanation = `**What this does:** You're giving UNLIMITED permission to a contract to spend your tokens. This is like giving someone a blank check for your tokens.\n\n**Risks:** ⚠️ HIGH - If this contract is malicious or gets hacked, they can take ALL your tokens.\n\n**Recommendation:** Consider setting a specific approval amount instead of unlimited.`;
      } else {
        explanation = `**What this does:** You're approving a contract to spend a specific amount of your tokens on your behalf. This is common for DEX swaps and DeFi protocols.`;
      }
      break;
    case 'swap':
      explanation = `**What this does:** You're swapping tokens through ${decoded.contractInfo?.name || 'a decentralized exchange'}. The swap will exchange one token for another.\n\n**Risks:** Check the minimum output amount to avoid excessive slippage.`;
      break;
    case 'staking':
      explanation = `**What this does:** You're interacting with a staking contract using the ${decoded.functionName} function. This typically locks your tokens to earn rewards.`;
      break;
    default:
      explanation = `**What this does:** You're calling the ${decoded.functionName || 'unknown'} function on contract ${decoded.to?.slice(0, 10)}...${decoded.valueEth && parseFloat(decoded.valueEth) > 0 ? ` and sending ${decoded.valueEth} ETH with it.` : ''}`;
  }

  if (riskAssessment.level === 'high') {
    explanation += `\n\n**⚠️ Risk Level: HIGH** - Review the risk details carefully before signing.`;
  } else if (riskAssessment.level === 'medium') {
    explanation += `\n\n**⚡ Risk Level: MEDIUM** - Some concerns detected. Review the details below.`;
  } else {
    explanation += `\n\n**✅ Risk Level: LOW** - No major concerns detected, but always verify contract addresses.`;
  }

  return explanation;
}

function generateFallbackRiskAnalysis(decoded, riskAssessment) {
  if (riskAssessment.threats.length === 0) {
    return 'No significant security threats were detected in this transaction. The transaction appears to be a standard operation. However, always verify contract addresses from official sources before interacting with them.';
  }

  let analysis = 'Security Analysis:\n\n';
  riskAssessment.threats.forEach(threat => {
    analysis += `• **${threat.title}** (${threat.severity}): ${threat.description}\n`;
  });

  return analysis;
}

function generateFallbackChatResponse(userMessage, transactionContext) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('safe') || lower.includes('sign') || lower.includes('trust')) {
    if (transactionContext) {
      return `Based on the current transaction, the risk level is **${transactionContext.riskLevel || 'unknown'}**. ${transactionContext.riskLevel === 'high' ? 'I would recommend caution before signing.' : transactionContext.riskLevel === 'medium' ? 'There are some concerns worth reviewing.' : 'It appears relatively safe, but always verify the contract address.'}\n\nWould you like me to explain any specific part of this transaction?`;
    }
    return "I'd be happy to help assess a transaction's safety! Please paste the transaction details or connect your wallet to analyze a pending transaction. I'll check for common risks like unlimited approvals, unknown contracts, and phishing patterns.";
  }

  if (lower.includes('approval') || lower.includes('approve')) {
    return "**Token Approvals Explained** 🔐\n\nWhen you 'approve' a contract, you're giving it permission to spend your tokens. This is required for DEX swaps and DeFi protocols.\n\n**Key things to watch for:**\n• Unlimited approvals (giving blank check access)\n• Approvals to unknown contracts\n• `setApprovalForAll` for NFTs (gives access to entire collection)\n\n**Safety tip:** Always set specific approval amounts when possible, and regularly revoke unused approvals on sites like revoke.cash.";
  }

  if (lower.includes('what') && lower.includes('contract')) {
    return "A **smart contract** is a self-executing program on the blockchain. When you interact with a contract, you're essentially running code that performs specific actions like:\n\n• Transferring tokens\n• Swapping on DEXs\n• Staking/lending\n• Minting NFTs\n\nAlways verify contracts on block explorers (Etherscan) before interacting with them. Look for verified source code and audit reports.";
  }

  if (lower.includes('help') || lower.includes('hi') || lower.includes('hello')) {
    return "Hey there! 👋 I'm **ShieldAI**, your blockchain security assistant. Here's what I can help you with:\n\n🔍 **Analyze transactions** - Paste transaction data and I'll explain what it does\n🛡️ **Assess risks** - I'll check for scams, unlimited approvals, and suspicious patterns\n💬 **Answer questions** - Ask me about approvals, contracts, DeFi safety, etc.\n\nTry asking me something like:\n• \"What does this contract do?\"\n• \"Is unlimited approval dangerous?\"\n• \"How do I stay safe in DeFi?\"";
  }

  return "I'm ShieldAI, here to help you navigate blockchain transactions safely! 🛡️\n\nYou can:\n1. **Paste transaction data** for me to analyze\n2. **Ask questions** about blockchain security\n3. **Connect your wallet** to review pending transactions\n\nWhat would you like to know?";
}

module.exports = { explainTransaction, analyzeRiskWithAI, chat };
