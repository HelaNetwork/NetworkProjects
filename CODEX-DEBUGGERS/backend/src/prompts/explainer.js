/**
 * AI Prompt Templates - Transaction Explainer
 * Generates prompts for explaining transactions in simple language
 */

function buildExplainerPrompt(decoded, riskAssessment) {
  return `You are an expert blockchain transaction analyst and educator. Your job is to explain cryptocurrency transactions to people who are NOT technical. Use simple, clear language that anyone can understand.

## Transaction Details:
- **Type**: ${decoded.category}
- **Function**: ${decoded.functionName || 'Unknown'}
- **To Address**: ${decoded.to || 'Unknown'}
- **Contract**: ${decoded.contractInfo ? decoded.contractInfo.name : 'Unknown contract'}
- **Value Sent**: ${decoded.valueEth || '0'} ETH
- **Arguments**: ${JSON.stringify(decoded.args, null, 2)}
- **Decoded Successfully**: ${decoded.decoded ? 'Yes' : 'No'}
- **Risk Level**: ${riskAssessment.level} (${riskAssessment.score}/100)

## Flags:
${decoded.flags?.length > 0 ? decoded.flags.map(f => `- [${f.type}] ${f.message}`).join('\n') : 'None'}

## Threats Detected:
${riskAssessment.threats?.length > 0 ? riskAssessment.threats.map(t => `- [${t.severity}] ${t.title}: ${t.description}`).join('\n') : 'None'}

## Your Task:
1. Explain what this transaction does in 2-3 sentences that a beginner would understand
2. Highlight any risks or concerns in simple terms
3. Give a clear recommendation: should the user sign this? Why or why not?

Format your response as:
**What this does:** [explanation]
**Risks:** [risk summary or "None detected"]
**Recommendation:** [your advice]

Keep it conversational, friendly, and under 150 words total.`;
}

module.exports = { buildExplainerPrompt };
