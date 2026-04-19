import { logConsole, sendCharacterMessage } from '../../../utils';

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

interface GrokResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
        index: number;
    }[];
}

export async function getGrokAnalysis(createdBy: string, characterId: string, sessionId: string, username?: string,) {
    try {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
            throw new Error('XAI_API_KEY environment variable is not set');
        }

        logConsole.info('Starting Grok analysis for user:', username);

        await sendCharacterMessage(characterId, sessionId, docClient, "Okay, I'll check whats happening on X.");
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert crypto market analyst focused on identifying profitable business opportunities from social media activity. Your goal is to analyze Twitter activity and extract actionable insights that can be used to develop profitable crypto projects, tokens, and on-chain activities. Focus on very recent activity, engagement metrics, and sentiment to identify market gaps and opportunities.'
                    },
                    {
                        role: 'user',
                        content: username
                            ? `Please analyze @${username}'s most recent Twitter activity, keep your response very concise and to the point in LESS THAN 50 words.`
                            : `How would we best bring the world onchain? Keep your response very concise and to the point in LESS THAN 50 words. Consider that we could launch ERC20 tokens, NFTs create tweets and so on. Return notable handles that are aligned to this goal.`
                    }
                ],
                model: 'grok-beta',
                stream: false,
                temperature: 0
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as GrokResponse;
        const timestamp = new Date().toISOString();

        const analysis = {
            analysis: data.choices[0].message.content,
            username,
            timestamp
        };

        logConsole.info('Grok analysis completed', { username, timestamp });
        return analysis;

    } catch (error: any) {
        logConsole.error('Error getting Grok information:', error);
        return {
            error: error.name || 'GrokAPIError',
            message: `Failed to get Grok information: ${error.message}`
        };
    }
} 