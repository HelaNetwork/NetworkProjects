import { ConversationMessage, ParticipantRole } from "multi-agent-orchestrator";
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../utils";
import { createImage } from "./handlers/create-image-handler";
import { createTweetZernio } from "./handlers/create-tweet-zernio";
import { getGrokAnalysis } from "./handlers/get-grok-information-handler";
import { getTweets } from "./handlers/get-tweets-handler";
import { searchWeb } from "./handlers/search-web-handler";

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

export const twitterToolDescription = [
    {
        toolSpec: {
            name: "Create_Tweet_Tool",
            description: "Creates a tweet given a message, ensuring URLs are left intact",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "The message to tweet which can include a link to the NFT to promote",
                        },
                        createdBy: {
                            type: "string",
                            description: "The user that is performing the action. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is performing the action.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                    },
                    required: ["message", "createdBy", "characterId", "sessionId"],
                }
            },
        },
    },
    {
        toolSpec: {
            name: "Fetch_Tweets_Tool",
            description: "Fetches tweets from the twitter API",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        userHandle: {
                            type: "string",
                            description: "The Twitter handle to fetch tweets from. (e.g. 'elonmusk')",
                        },
                    },
                }
            },
        }
    },
    {
        toolSpec: {
            name: "Get_Grok_Information_Tool",
            description: "Fetches information about a user's Twitter account, or the current Web3 and crypto landscape is no userHandle is provided",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        userHandle: {
                            type: "string",
                            description: "The Twitter handle to fetch information about, or leave blank to get information about the current Web3 and crypto landscape",
                        },
                        createdBy: {
                            type: "string",
                            description: "The user that is performing the action. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is performing the action.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                    },
                    required: ["createdBy", "characterId", "sessionId"],
                }
            },
        }
    },
    {
        toolSpec: {
            name: "Create_Image_Tool",
            description: "Creates an image given a prompt and explicitly returns its imageKey value",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The prompt to create an image with.",
                        },
                        imageName: {
                            type: "string",
                            description: "The name of the image to create. This should be a short name for the image based on the prompt. Should not include spaces, underscores, or special characters.",
                        },
                        createdBy: {
                            type: "string",
                            description: "The user that is performing the action. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is performing the action. This will always be Yasmin.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                    },
                    required: ["prompt", "createdBy", "characterId", "sessionId"],
                }
            },
        },
    },
    {
        toolSpec: {
            name: "Search_Web_Tool",
            description: "Searches the web for information about crypto, tokens, sentiment, or any other topic.",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query (e.g., 'HeLa blockchain sentiment' or 'trending memecoins').",
                        },
                        createdBy: {
                            type: "string",
                            description: "The user that is performing the action.",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is performing the action.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                    },
                    required: ["query", "createdBy", "characterId", "sessionId"],
                }
            },
        }
    },
];

export async function twitterToolHandler(response: Response, conversation: ConversationMessage[]) {
    logConsole.info(`Twitter Tool fired with response: ${JSON.stringify(response)} ${JSON.stringify(conversation)}`);

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
                case "Create_Tweet_Tool":
                    // Robust parameter mapping
                    const tweetMessage = toolUse.input.message || toolUse.input.tweet_text || toolUse.input.text || toolUse.input.content;
                    
                    if (!tweetMessage) {
                        throw new Error("Missing 'message' parameter for Create_Tweet_Tool");
                    }

                    result = await createTweetZernio(
                        tweetMessage,
                        toolUse.input.sessionId,
                        toolUse.input.characterId,
                        toolUse.input.createdBy
                    );
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'tweet_sent',
                        metadata: {
                            message: tweetMessage,
                            tweetId: (result as any)?.tweet_data?.id
                        }
                    });
                    break;
                case "Get_Grok_Information_Tool":
                    result = await getGrokAnalysis(
                        toolUse.input.createdBy,
                        toolUse.input.characterId,
                        toolUse.input.sessionId,
                        toolUse.input.userHandle
                    );
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'analysis_complete',
                        metadata: {
                            type: 'Grok X Analysis',
                            userHandle: toolUse.input.userHandle
                        }
                    });
                    break;

                case "Create_Image_Tool":
                    result = await createImage({
                        imageName: toolUse.input.imageName,
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        sessionId: toolUse.input.sessionId,
                        prompt: toolUse.input.prompt
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'image_created',
                        metadata: {
                            prompt: toolUse.input.prompt,
                            imageKey: result?.imageKey
                        }
                    });
                    break;

                case "Fetch_Tweets_Tool":
                    result = await getTweets(toolUse.input.userHandle);
                    break;
                case "Search_Web_Tool":
                    result = await searchWeb({
                        query: toolUse.input.query,
                        sessionId: toolUse.input.sessionId,
                        characterId: toolUse.input.characterId
                    });
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