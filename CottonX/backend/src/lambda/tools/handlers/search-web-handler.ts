import axios from 'axios';
import { logConsole, sendCharacterMessage } from '../../../utils';

export async function searchWeb({ query, sessionId, characterId }: { query: string, sessionId: string, characterId: string }) {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        logConsole.error("TAVILY_API_KEY is missing in environment variables.");
        return { error: "Search configuration missing." };
    }

    try {
        logConsole.info(`🔹 Performing Tavily search for: "${query}"`);
        await sendCharacterMessage(characterId, sessionId, null, `Searching the web for: "${query}"...`);

        const response = await axios.post('https://api.tavily.com/search', {
            api_key: apiKey,
            query: query,
            search_depth: "basic",
            include_answer: true,
            max_results: 5
        });

        const data = response.data;
        
        // Formulate a concise summary for the agent
        const resultsSummary = data.results.map((r: any) => `- ${r.title}: ${r.content} (${r.url})`).join('\n');
        const finalAnswer = data.answer || "No direct answer found, but here are some results.";

        return {
            status: "success",
            answer: finalAnswer,
            results: resultsSummary,
            query: query
        };

    } catch (error: any) {
        logConsole.error("Error calling Tavily API:", error.response?.data || error.message);
        return {
            status: "error",
            message: error.message
        };
    }
}
