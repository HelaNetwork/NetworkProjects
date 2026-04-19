import { ConversationMessage, ParticipantRole } from "multi-agent-orchestrator";
import { logConsole, sendCharacterMessage } from "../../utils";
import { getPriceAnalytics } from "./handlers/get-candles-handler";

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

export const analyticsToolDescription = [
    {
        toolSpec: {
            name: "Analytics_Tool",
            description: "Executes an analytics query based on the provided parameters",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        pairContractAddress: {
                            type: "string",
                            description: "The contract address of the pair to analyze.",
                        }
                    },
                    required: ["pairContractAddress"],
                }
            },
        }
    }
];

export async function analyticsToolHandler(response: Response, conversation: ConversationMessage[]) {
    logConsole.info(`Analytics Tool fired with response: ${JSON.stringify(response)} ${JSON.stringify(conversation)}`);

    if (!response.content) {
        throw new Error("No content blocks in response");
    }

    if (response?.content?.[0]?.text && response?.content?.[0]?.toolUse?.input?.characterId && response?.content?.[0]?.toolUse?.input?.sessionId) {
        await sendCharacterMessage(response.content[0].toolUse.input.characterId, response.content[0].toolUse.input.sessionId, docClient, response.content[0].text);
    }

    const toolResults = await Promise.all(response.content.map(async (contentBlock: any) => {
        if (!("toolUse" in contentBlock)) return null;

        const { toolUse } = contentBlock;
        let result;

        try {
            switch (toolUse.name) {
                case "Analytics_Tool":
                    result = await getPriceAnalytics(toolUse.input.pairContractAddress);
                    break;

                default:
                    logConsole.warn(`Tool ${toolUse.name} not found`);
                    return null;
            }

            logConsole.info(`Response from ${toolUse.name}: ${JSON.stringify(result)}`);
            return {
                toolResult: {
                    toolUseId: toolUse.toolUseId,
                    content: [{ json: { result } }],
                }
            };
        } catch (error) {
            logConsole.error(`Error executing ${toolUse.name}: ${error}`);
            return {
                toolResult: {
                    toolUseId: toolUse.toolUseId,
                    content: [{ json: { error: error } }],
                }
            };
        }
    }));

    const validResults = toolResults.filter(result => result !== null);
    return { role: ParticipantRole.USER, content: validResults };
}

interface Response {
    content: Content[];
    role: string;
}

interface Content {
    text?: string;
    toolUse?: ToolUse;
}

interface ToolUse {
    input: any;
    name: string;
    toolUseId: string;
}