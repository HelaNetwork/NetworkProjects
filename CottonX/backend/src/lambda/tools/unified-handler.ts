import { ConversationMessage, ParticipantRole } from "multi-agent-orchestrator";
import { walletToolHandler } from "./wallet-tool";
import { tradingToolHandler } from "./trading-tool";
import { twitterToolHandler } from "./twitter-tool";
import { logConsole } from "../../utils";

export async function unifiedToolHandler(response: any, conversation: ConversationMessage[]) {
    logConsole.info(`Unified Tool Handler fired with response: ${JSON.stringify(response)}`);

    if (!response.content) {
        throw new Error("No content blocks in response");
    }

    // Filter content blocks that are tool calls
    const toolCalls = response.content.filter((block: any) => "toolUse" in block);
    
    if (toolCalls.length === 0) {
        return { role: ParticipantRole.USER, content: [] };
    }

    // Group tool calls by their respective handlers
    // This is a simple implementation: we try to run each tool against all handlers
    // but in reality we should probably map them. For now, since each handler 
    // has a 'default' case that returns null or logs a warning, we can be a bit more robust.

    const results = await Promise.all(toolCalls.map(async (toolCall: any) => {
        const { name } = toolCall.toolUse;
        
        // Wrap the single tool call into the format the handlers expect
        const subResponse = {
            ...response,
            content: [toolCall]
        };

        // Try to find which handler handles this tool
        // Wallet tools
        const walletTools = [
            "Create_Wallet_Tool", "Get_Wallet_Tool", "Deploy_Contract_Tool", 
            "Get_ETH_Balance_Tool", "Request_Funds_Tool", "Create_NFT_Tool", 
            "Manage_Basename_Tool", "Get_Token_Balance_Tool", "Transfer_ETH_Tool", 
            "Transfer_Token_Tool", "Create_Uniswap_Pool_Tool", "Establish_DEX_Infrastructure_Tool"
        ];
        
        // Trading tools
        const tradingTools = [
            "Trading_Tool", "Get_Token_Balance_Tool", "Transfer_ETH_Tool", 
            "Request_Funds_Tool", "Get_ETH_Balance_Tool", "Transfer_Token_Tool"
        ];

        // Twitter tools
        const twitterTools = [
            "Create_Tweet_Tool", "Fetch_Tweets_Tool", "Get_Grok_Information_Tool", "Create_Image_Tool", 
            "Search_Web_Tool"
        ];

        if (twitterTools.includes(name)) {
            return await twitterToolHandler(subResponse, conversation);
        } else if (tradingTools.includes(name)) {
             // NOTE: Some tools overlap (like Get_ETH_Balance_Tool), 
             // we prioritize based on the agent's typical skill set or just pick one.
            return await tradingToolHandler(subResponse, conversation);
        } else if (walletTools.includes(name)) {
            return await walletToolHandler(subResponse, conversation);
        } else {
            logConsole.warn(`No handler found for tool: ${name}`);
            return null;
        }
    }));

    // Flatten and filter results
    const validResults = results
        .filter(r => r !== null)
        .flatMap(r => r.content);

    return { role: ParticipantRole.USER, content: validResults };
}
