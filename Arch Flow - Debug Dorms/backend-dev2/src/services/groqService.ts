import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

console.log(`GROQ KEY LOADED: ${!!process.env.GROQ_API_KEY}`);
console.log(`USE_GROQ: ${process.env.USE_GROQ}`);

// --- GOVERNANCE STATE ---
interface UserState {
    requestCount: number;
    dailyCount: number;
    lastCallTime: number;
}

const userMap = new Map<string, UserState>();
const cache = new Map<string, string>();
const MAX_CACHE = 50;

const MAX_SESSION_REQUESTS = 20;
const MAX_DAILY_REQUESTS = 100;
const RATE_LIMIT_MS = 2000;

/**
 * Retrieves or initializes user state.
 */
function getUserState(userId: string): UserState {
    if (!userMap.has(userId)) {
        userMap.set(userId, {
            requestCount: 0,
            dailyCount: 0,
            lastCallTime: 0,
        });
    }
    return userMap.get(userId)!;
}

/**
 * Executes a controlled Groq API call with strict governance.
 */
export async function getGroqResponse(prompt: string, userId: string, nodesMetadata: any[]): Promise<string | null> {
    console.log("🔥 GroqService HIT");
    try {
        // 1. ENV CHECK
        console.log("USE_GROQ:", process.env.USE_GROQ);
        if (process.env.USE_GROQ !== "true") {
            console.log("Blocked: USE_GROQ disabled");
            return null;
        }

        // 2. INTENT FILTER (Heuristic)
        const q = prompt.toLowerCase();
        const allowedIntents = ["overview", "architecture", "explain", "summarize", "what", "how", "purpose"];
        const isAllowed = allowedIntents.some(i => q.includes(i));
        if (!isAllowed || q.split(" ").length < 3) {
            console.log("Blocked: trivial query");
            return null;
        }

        // 3. CACHE CHECK
        if (cache.has(prompt)) {
            console.log("Cache hit");
            return cache.get(prompt)!;
        }

        // 4. USER STATE LOAD
        const state = getUserState(userId);

        // 5. DAILY LIMIT
        if (state.dailyCount >= MAX_DAILY_REQUESTS) {
            console.log("Blocked: daily limit reached");
            return null;
        }

        // 6. SESSION LIMIT
        if (state.requestCount >= MAX_SESSION_REQUESTS) {
            console.log("Blocked: session limit reached");
            return null;
        }

        // 7. RATE LIMIT
        const now = Date.now();
        if (now - state.lastCallTime < RATE_LIMIT_MS) {
            console.log("Blocked: rate limited");
            return null;
        }

        // 8. DATA PREPARATION (Strictly Top 10)
        const nodeSummary = nodesMetadata
            .slice(0, 10)
            .map(n => `- ${n.name} (${n.priority}, In: ${n.inDegree || 0}, Out: ${n.outDegree || 0})`)
            .join("\n");

        const fullPrompt = `
You are a senior software architect. 
Analyze this repository structure based on the following key nodes:

${nodeSummary}

User Query: "${prompt}"

Explain:
1. Architecture type
2. Key modules
3. How components interact

Keep it concise, technical, and architectural.
`.trim();

        // 9. API CALL WITH TIMEOUT
        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Groq timeout")), 2000)
        );

        const apiCall = groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: fullPrompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("Calling Groq API...");
        const response: any = await Promise.race([apiCall, timeoutPromise]);
        console.log("Groq SUCCESS");

        const text = response.choices[0]?.message?.content;

        // 10. RESPONSE VALIDATION
        if (!text || text.length < 20) return null;

        // 11. SUCCESS FLOW
        state.requestCount++;
        state.dailyCount++;
        state.lastCallTime = now;

        // Manage Cache (FIFO-ish)
        if (cache.size >= MAX_CACHE) {
            const firstKey = cache.keys().next().value;
            if (firstKey) cache.delete(firstKey);
        }
        cache.set(prompt, text);

        console.log("Groq used");
        return text;

    } catch (error: any) {
        if (error.message === "Groq timeout") {
            console.log("Groq TIMEOUT");
        } else {
            console.error("Groq ERROR:", error.message);
        }
        console.log("Fallback triggered");
        return null;
    }
}
