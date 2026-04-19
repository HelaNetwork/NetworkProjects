import { ConversationMessage, ParticipantRole } from "multi-agent-orchestrator";
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../utils";
import { getEthBalance } from "./handlers/eth-balance-handler";
import { executeTrade } from "./handlers/execute-trade-handler";
import { requestFunds } from "./handlers/request-funds-handler";
import { getTokenBalance } from "./handlers/token-balance-handler";
import { transferETH } from "./handlers/transfer-eth-handler";
import { transferToken } from "./handlers/transfer-token";

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

export const tradingToolDescription = [
    {
        toolSpec: {
            name: "Trading_Tool",
            description: "Executes a trade based on the provided tokens and amount",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        tokenContractAddress: {
                            type: "string",
                            description: "The contract address of the ERC20 token to trade.",
                        },
                        action: {
                            type: "string",
                            description: "the action to execute, buy or sell.",
                        },
                        amountInWei: {
                            type: "string",
                            description: "the amount of the token to trade in Wei. If buying, this is the amount of ETH to spend. If selling, this is the amount of tokens to sell.",
                        },
                        characterId: {
                            type: "string",
                            description: "the character id of the user executing the trade.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session identifier that is executing the trade.",
                        },
                        createdBy: {
                            type: "string",
                            description: "The user that is executing the trade. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                    },
                    required: ["tokenContractAddress", "action", "amountOfTokensInWei", "characterId", "sessionId", "createdBy"],
                }
            },
        },
    },
    {
        toolSpec: {
            name: "Get_Token_Balance_Tool",
            description: "Gets the ERC20 token balance of the wallet given a token address",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        createdBy: {
                            type: "string",
                            description: "The user that is performing the action. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is performing the action.",
                        },
                        tokenAddress: {
                            type: "string",
                            description: "The address of the token to get the balance of.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                    },
                    required: ["createdBy", "characterId", "tokenAddress", "sessionId"],
                }
            },
        }
    },
    {
        toolSpec: {
            name: "Transfer_ETH_Tool",
            description: "Transfers ETH from one wallet to another",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        createdBy: {
                            type: "string",
                            description: "The user that is transferring the funds. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is transferring the funds, we will use this to look up the wallet address in the tool.",
                        },
                        destinationWalletAddress: {
                            type: "string",
                            description: "The destination character's wallet address to transfer the funds to.",
                        },
                        amountInWei: {
                            type: "string",
                            description: "The amount of funds to transfer in Wei.",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                    },
                    required: ["createdBy", "characterId", "destinationWalletAddress", "amountInWei", "sessionId"],
                }
            },
        }
    },
    {
        toolSpec: {
            name: "Request_Funds_Tool",
            description: "Requests funds from the user that will be sent to the agents wallet",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        createdBy: {
                            type: "string",
                            description: "The user that is performing the action. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is performing the action. This will always be Harper",
                        },
                        sessionId: {
                            type: "string",
                            description: "The session that is performing the action.",
                        },
                        sendersWalletAddress: {
                            type: "string",
                            description: "The wallet address of the user that is sending the funds. This is not the wallet address of the character.",
                        }
                    },
                    required: ["createdBy", "characterId", "sessionId", "sendersWalletAddress"],
                }
            },
        },
    },
    {
        toolSpec: {
            name: "Get_ETH_Balance_Tool",
            description: "Gets the ETH balance of the wallet along with a friendly concise message",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
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
            name: "Transfer_Token_Tool",
            description: "Transfers an ERC20 token from one wallet to another",
            inputSchema: {
                json: {
                    type: "object",
                    properties: {
                        createdBy: {
                            type: "string",
                            description: "The user that is transferring the funds. (starts with 'user_' and will look something like 'user_2nCKty8ggdPrOyvsNgupp1oDd9Y')",
                        },
                        characterId: {
                            type: "string",
                            description: "The character that is transferring the funds, we will use this to look up the wallet address in the tool.",
                        },
                        destinationWalletAddress: {
                            type: "string",
                            description: "The destination character's wallet address to transfer the funds to.",
                        },
                        amountInWei: {
                            type: "string",
                            description: "The amount of tokens to transfer in Wei.",
                        },
                    },
                    required: ["createdBy", "characterId", "destinationWalletAddress", "amountInWei", "sessionId"],
                }
            },
        }
    }
];

export async function tradingToolHandler(response: Response, conversation: ConversationMessage[]) {
    logConsole.info(`Trading Tool fired with response: ${JSON.stringify(response)} ${JSON.stringify(conversation)}`);

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
                case "Trading_Tool":
                    const tradeTokenAddress = toolUse.input.tokenContractAddress || toolUse.input.tokenAddress || toolUse.input.address;
                    const tradeAmount = toolUse.input.amountInWei || toolUse.input.amountOfTokensInWei || toolUse.input.amount;
                    const tradeAction = toolUse.input.action || toolUse.input.operation || toolUse.input.side;

                    if (!tradeTokenAddress || !tradeAmount || !tradeAction) {
                        throw new Error("Missing required parameters for Trading_Tool (address, amount, action)");
                    }

                    result = await executeTrade({
                        tokenAddress: tradeTokenAddress,
                        amountInWei: tradeAmount,
                        operation: tradeAction,
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        sessionId: toolUse.input.sessionId,
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'trade_executed',
                        metadata: {
                            tokenAddress: tradeTokenAddress,
                            action: tradeAction,
                            amount: tradeAmount,
                            transactionHash: result?.transactionHash
                        }
                    });
                    break;

                case "Request_Funds_Tool":
                    result = await requestFunds({
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        sessionId: toolUse.input.sessionId,
                        sendersWalletAddress: toolUse.input.sendersWalletAddress,
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'funds_requested',
                        metadata: {
                            sender: toolUse.input.sendersWalletAddress
                        }
                    });
                    break;

                case "Get_ETH_Balance_Tool":
                    result = await getEthBalance({
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'get_eth_balance',
                        metadata: {}
                    });
                    break;

                case "Get_Token_Balance_Tool":
                    result = await getTokenBalance({
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        tokenAddress: toolUse.input.tokenAddress,
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'get_token_balance',
                        metadata: { tokenAddress: toolUse.input.tokenAddress }
                    });
                    break;

                case "Transfer_ETH_Tool":
                    result = await transferETH({
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        senderWalletAddress: toolUse.input.senderWalletAddress,
                        destinationWalletAddress: toolUse.input.destinationWalletAddress,
                        amountInWei: toolUse.input.amountInWei,
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'transfer_sent',
                        metadata: {
                            to: toolUse.input.destinationWalletAddress,
                            amount: toolUse.input.amountInWei,
                            symbol: 'HELA'
                        }
                    });
                    break;

                case "Transfer_Token_Tool":
                    result = await transferToken({
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        tokenAddress: toolUse.input.tokenAddress,
                        recipientAddress: toolUse.input.recipientAddress,
                        amount: toolUse.input.amount,
                    });
                    await sendGodMessage(toolUse.input.sessionId, docClient, {
                        createdBy: toolUse.input.createdBy,
                        characterId: toolUse.input.characterId,
                        createdAt: new Date().toISOString(),
                        eventName: 'transfer_token_sent',
                        metadata: {
                            to: toolUse.input.recipientAddress,
                            amount: toolUse.input.amount
                        }
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