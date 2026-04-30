/**
 * AI Prompt Templates - Risk Analysis
 * Generates prompts for in-depth risk analysis
 */

function buildRiskAnalysisPrompt(decoded, riskAssessment) {
  return `You are a blockchain security expert. Analyze this transaction for potential risks, scams, and vulnerabilities.

## Transaction Data:
- Function: ${decoded.functionName}
- Category: ${decoded.category}
- Target: ${decoded.to}
- Contract: ${decoded.contractInfo ? JSON.stringify(decoded.contractInfo) : 'Unknown'}
- Value: ${decoded.valueEth} ETH
- Arguments: ${JSON.stringify(decoded.args, null, 2)}
- Raw data length: ${decoded.rawData?.length || 0} characters
- Gas limit: ${decoded.gasLimit || 'default'}

## Automated Risk Assessment:
- Score: ${riskAssessment.score}/100
- Level: ${riskAssessment.level}
- Threats found: ${riskAssessment.threats?.length || 0}

## Automated Threats:
${riskAssessment.threats?.map(t => `- ${t.title} (${t.severity}): ${t.description}`).join('\n') || 'None detected by automated system'}

## Your Analysis:
Provide a detailed but concise security analysis covering:
1. **Transaction Safety**: Is this transaction safe to sign?
2. **Hidden Risks**: Any risks the automated system might have missed?
3. **Contract Trust**: Can we trust this contract? Why or why not?
4. **Best Practices**: What safety steps should the user take?

Be specific, factual, and avoid unnecessary fear-mongering. If the transaction appears safe, say so clearly.
Keep your response under 200 words.`;
}

module.exports = { buildRiskAnalysisPrompt };
