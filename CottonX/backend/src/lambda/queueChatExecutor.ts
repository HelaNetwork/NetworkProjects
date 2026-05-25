/**
 * queueChatExecutor.ts — GCP / Gemini Flash version.
 *
 * Replaces:
 *  - BedrockLLMAgent  →  GeminiAgent
 *  - BedrockClassifier →  GeminiClassifier
 *  - DynamoDbChatStorage → FirestoreChatStorage
 *  - SQS event handler  →  direct function call from server.ts
 *  - AWS DynamoDB client  →  Firestore (via dynamo_v3 shim)
 */

import { MultiAgentOrchestrator } from 'multi-agent-orchestrator';
import { OpenAIAgent } from '../agents/openai-agent';
import { OpenAIClassifier } from '../agents/openai-classifier';
import { GeminiAgent } from '../agents/gemini-agent';
import { GeminiClassifier } from '../agents/gemini-classifier';
import { FirestoreChatStorage } from '../agents/firestore-chat-storage';
import { logConsole, sendCharacterMessage } from '../utils';
import { createItem, getItem, scan } from './dynamo_v3';
import { CharacterWallet } from './tools/handlers/create-wallet-handler';
import { 
  IDENTITY_REINFORCEMENT, 
  HELA_NETWORK_CONTEXT, 
  TEAM_AWARENESS 
} from './tools/persona';
import { tradingToolDescription } from './tools/trading-tool';
import { twitterToolDescription } from './tools/twitter-tool';
import { walletToolDescription } from './tools/wallet-tool';
import { unifiedToolHandler } from './tools/unified-handler';

const TABLE_NAME = process.env.CORE_TABLE_NAME || 'CoreTable';
const TTL_DURATION = 3600 * 24 * 7; // 7 days

/**
 * Strips // and /* style comments from a JSON string to make parsing more robust.
 */
function stripJsonComments(str: string): string {
    return str.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
}
const EXTERNAL_APIS_ENABLED = process.env.ENABLE_EXTERNAL_APIS === 'true';

const firestoreChatStorage = new FirestoreChatStorage(TTL_DURATION);

if (EXTERNAL_APIS_ENABLED) {
  logConsole.info('🔌 External APIs ENABLED — all agents with full tool access');
} else {
  logConsole.info('🔇 External APIs DISABLED — agents running in chat-only mode');
}

// ── Agents ──────────────────────────────────────────────────────────────────

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini';
logConsole.info(`🤖 LLM Provider: ${LLM_PROVIDER.toUpperCase()}`);

const AgentClass = LLM_PROVIDER === 'featherless' ? OpenAIAgent : GeminiAgent;
const ClassifierClass = LLM_PROVIDER === 'featherless' ? OpenAIClassifier : GeminiClassifier;

export interface FirestoreAgent {
  character: number;
  createdAt: any;
  model: string;
  name: string;
  prompt: string;
  skills: string[];
}

let __orchestratorInstance: MultiAgentOrchestrator | null = null;
let __agentsLastLoaded = 0;

export async function getOrchestrator(): Promise<MultiAgentOrchestrator> {
  const now = Date.now();
  // Reload agents every 10 seconds during development
  if (__orchestratorInstance && (now - __agentsLastLoaded < 10 * 1000)) {
     return __orchestratorInstance;
  }

  logConsole.info('🚀 Initializing MultiAgentOrchestrator and fetching config from Firestore...');

  const customClassifier = new ClassifierClass({
    inferenceConfig: { maxTokens: 4000, temperature: 0, topP: 0.9 },
    ...(LLM_PROVIDER === 'featherless' && {
      modelId: process.env.API_MODEL_ID,
      baseUrl: process.env.API_BASE_URL
    })
  } as any);

  const newOrchestrator = new MultiAgentOrchestrator({
    storage: firestoreChatStorage,
    classifier: customClassifier as any,
    config: {
      USE_DEFAULT_AGENT_IF_NONE_IDENTIFIED: true,
      LOG_AGENT_CHAT: true,
      LOG_CLASSIFIER_CHAT: true,
      LOG_CLASSIFIER_RAW_OUTPUT: true,
      LOG_CLASSIFIER_OUTPUT: true,
      LOG_EXECUTION_TIMES: true,
    },
    logger: {
      info: (...args: any[]) => logConsole.info(...args),
      warn: (...args: any[]) => logConsole.warn(...args),
      error: (...args: any[]) => logConsole.error(...args),
      debug: (...args: any[]) => logConsole.info(...args),
      log: (...args: any[]) => logConsole.info(...args),
    } as any,
  });

  try {
      const agentDocs = await scan<FirestoreAgent>('agents', {}, null);
      if (agentDocs && agentDocs.length > 0) {
          agentDocs.sort((a, b) => (a.character || 0) - (b.character || 0));
          
          for (const doc of agentDocs) {
              const skills = Array.isArray(doc.skills) ? doc.skills : [];
              
              let tools: any[] = [];
              let useToolHandler: any = null;
              
              if (EXTERNAL_APIS_ENABLED) {
                  if (skills.includes('wallet')) {
                      tools = [...tools, ...walletToolDescription];
                  }
                  if (skills.includes('trading')) {
                      tools = [...tools, ...tradingToolDescription];
                  }
                  if (skills.includes('twitter') || skills.includes('grok')) {
                      tools = [...tools, ...twitterToolDescription];
                  }

                  if (tools.length > 0) {
                      // Deduplicate tools by name if necessary
                      const seen = new Set();
                      tools = tools.filter(t => {
                          const name = t.toolSpec.name;
                          const duplicate = seen.has(name);
                          seen.add(name);
                          return !duplicate;
                      });
                      useToolHandler = unifiedToolHandler;
                  }
              }

              const agent = new AgentClass({
                  name: doc.name,
                  description: `You are ${doc.name}. ${doc.prompt.substring(0, 500)}`,
                  streaming: false,
                  inferenceConfig: { temperature: 0 },
                  saveChat: true,
                  ...(tools.length > 0 && {
                      toolConfig: {
                          tool: tools as any,
                          useToolHandler: useToolHandler, 
                          toolMaxRecursions: 10,
                      }
                  }),
                  ...(LLM_PROVIDER === 'featherless' && {
                    modelId: process.env.API_MODEL_ID, 
                    baseUrl: process.env.API_BASE_URL
                  })
              } as any);
              
              const fullPrompt = `
${IDENTITY_REINFORCEMENT}
${HELA_NETWORK_CONTEXT}
${TEAM_AWARENESS}

${doc.prompt}
              `.trim();
              
              agent.setSystemPrompt(fullPrompt);
              newOrchestrator.addAgent(agent);
              
              if (doc.name === 'Yasmin') {
                  newOrchestrator.setDefaultAgent(agent);
              }
          }
      }
  } catch (error) {
      logConsole.error("Failed to load generic agents from Firestore:", error);
  }

  __orchestratorInstance = newOrchestrator;
  __agentsLastLoaded = now;
  
  logConsole.info(`📋 Active agents loaded: ${Object.values(newOrchestrator.getAllAgents()).map((a: any) => a.name).join(', ')}`);
  
  return __orchestratorInstance;
}

// ── Payload interface (unchanged) ────────────────────────────────────────────

export interface InvokeModelPayload {
  connectionId?: string;
  stage?: string;
  domainName?: string;
  chatMode: 'RECURSIVE' | 'STANDARD';
  sendersWalletAddress: string;
  createdBy: string;
  characterId: string;
  sessionId: string;
  temperature: number;
  data: string;
  maxTokens: number;
  topP: number;
  llmProvider?: string;
  llmModelId?: string;
}

const recursiveOptions = { maxRecursions: 10 };

// ── Public entry point (called by server.ts instead of SQS) ──────────────

export async function processChat(payload: InvokeModelPayload): Promise<void> {
  const { sessionId, createdBy, characterId, sendersWalletAddress, data, chatMode, llmProvider, llmModelId } = payload;
  await handleMessage(sessionId, createdBy, characterId, chatMode, sendersWalletAddress, data, 0, llmProvider, llmModelId);
}

// ── Internal handler (logic preserved from the original) ─────────────────

const handleMessage = async (
  sessionId: string,
  createdBy: string,
  characterId: string,
  mode: 'RECURSIVE' | 'STANDARD',
  sendersWalletAddress: string,
  data: string,
  currentRecursion: number,
  llmProvider?: string,
  llmModelId?: string,
  targetAgentId?: string,
) => {
  if (targetAgentId) {
    logConsole.info(`🔹 Routing forced by handoff hint: ${targetAgentId}`);
  }

  let responseCharacterId: string | undefined;

  // HARD STOP: Prevent infinite recursion if limit is reached
  if (currentRecursion >= recursiveOptions.maxRecursions) {
    logConsole.warn(`⚠️ [RECURSION LIMIT] Hard stop reached at depth ${currentRecursion}. Session: ${sessionId}`);
    return;
  }

  try {
    const orchestrator = await getOrchestrator();
    const agents = orchestrator.getAllAgents();
    orchestrator.classifier.setSystemPrompt(
      `
      {{AGENT_DESCRIPTIONS}}
      {{HISTORY}}
      {{CUSTOM_PLACEHOLDER}}
      `,
      {
        CUSTOM_PLACEHOLDER:
          "Important: If a message starts with 'Hey <Agent Name>,' ensure you route the message to the Agent specified as <Agent Name>.",
      },
    );

    const unixTimestampInMillis = Math.floor(Date.now());
    const messageObject = {
      PK: `session#${sessionId}`,
      SK: `message#${unixTimestampInMillis}`,
      createdAt: new Date().toISOString(),
      createdBy,
      message: data,
      ttl: unixTimestampInMillis / 1000 + TTL_DURATION,
      sessionId,
      characterId,
    };
    // docClient param is ignored by Firestore shim — pass null
    await createItem(messageObject.PK, messageObject.SK, messageObject, TABLE_NAME, null);
    
    // Get wallet addresses for all agents
    const wallets = [];
    for (const agent of Object.values(orchestrator.getAllAgents())) {
      const wallet = await getItem<CharacterWallet>('wallet', `${createdBy}#${agent.name}`, TABLE_NAME, null);
      wallets.push({ agent: agent.name, address: wallet?.walletAddress });
    }
    logConsole.info('Wallets:', JSON.stringify(wallets, null, 2));

    // System prompt is now handled at the agent level in persona/index.ts

    const recursionState = mode === 'RECURSIVE' ? `
      <recursion_state>
        <current_depth>${currentRecursion}</current_depth>
        <max_depth>${recursiveOptions.maxRecursions}</max_depth>
        <instruction>If current_depth is close to max_depth (e.g. ${recursiveOptions.maxRecursions - 2} or higher), you MUST conclude the conversation, summarize your actions, and DO NOT hand off to another agent.</instruction>
      </recursion_state>` : '';

    const message = `
      <metadata>
        <created_by>${createdBy}</created_by>
        <session_id>${sessionId}</session_id>
        <character_id>${characterId}</character_id>
        <senders_wallet_address>${sendersWalletAddress}</senders_wallet_address>
      </metadata>
      ${recursionState}

      <message>New message from: ${characterId}: ${data}</message>`;

    const response = await orchestrator.routeRequest(message, createdBy, sessionId, {
      characterId,
      createdBy,
      sessionId,
      sendersWalletAddress,
      wallets: wallets.map((w: any) => `${w.agent}: ${w.address || null}`).join(', '),
      llmProvider: llmProvider as any,
      llmModelId: llmModelId as any,
      targetAgentId: targetAgentId as any,
    });

    responseCharacterId = response.metadata.agentName;

    let rawOutput = response.output.toString();
    const toolCallRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
    const match = rawOutput.match(toolCallRegex);
    let chatMessageText = rawOutput;

    if (match) {
        try {
            const cleanedJson = stripJsonComments(match[1]);
            const parsedObj = JSON.parse(cleanedJson);
            let extractedToolName: string | undefined = parsedObj.action;
            let extractedToolParams: any = parsedObj.parameters || {};
            
            // Fallback: If the user provided a different structure, try the recursive search
            if (!extractedToolName) {
                function findTool(node: any) {
                    if (!node || typeof node !== 'object') return;
                    if (typeof node.name === 'string') {
                        extractedToolName = node.name;
                        extractedToolParams = node.arguments || node.parameters || node.input || {};
                        return true;
                    }
                    if (typeof node.function === 'string') {
                        extractedToolName = node.function;
                        extractedToolParams = node.arguments || node.parameters || node.input || {};
                        return true;
                    }
                    if (node.function && typeof node.function.name === 'string') {
                        extractedToolName = node.function.name;
                        extractedToolParams = node.function.arguments || node.function.parameters || {};
                        return true;
                    }
                    for (const key of Object.keys(node)) {
                        if (findTool(node[key])) return true;
                    }
                    return false;
                }
                findTool(parsedObj);
            }
            
            if (typeof extractedToolParams === 'string') {
                try { extractedToolParams = JSON.parse(extractedToolParams); } catch(e){}
            }
            
            extractedToolParams.createdBy = createdBy;
            extractedToolParams.characterId = responseCharacterId;
            extractedToolParams.sessionId = sessionId;
            
            // Use 'chat' from JSON if available, otherwise strip the block from raw output
            if (parsedObj.chat) {
                chatMessageText = parsedObj.chat;
            } else {
                chatMessageText = rawOutput.replace(toolCallRegex, '').trim();
            }

            if (chatMessageText === '') {
                chatMessageText = `*Executing task...*`;
            }

            const availableTools = [...tradingToolDescription, ...twitterToolDescription, ...walletToolDescription];
            const isValidTool = availableTools.find(t => t.toolSpec.name === extractedToolName);
            
            // NEW: Only treat as a tool call if it clearly intended to be one or matches a known tool.
            // If it's just random JSON like {"status": "ok"}, we ignore it and treat as chat.
            const hasExplicitActionKey = !!(parsedObj.action || parsedObj.tool || parsedObj.function);
            const shouldExecuteTool = isValidTool || hasExplicitActionKey;

            if (shouldExecuteTool && !isValidTool) {
               const isTerminationImminent = currentRecursion >= (recursiveOptions.maxRecursions - 2);
               const definitionsMap = availableTools.map(t => `- ${t.toolSpec.name}: ${t.toolSpec.description}`).join('\\n');
               
               let errorMsg = `SYSTEM ERROR: The tool '${extractedToolName || "you provided"}' does not exist or was hallucinated. 

Available tools are:
${definitionsMap}

CRITICAL: You MUST use ONLY an available tool from the list above. Ensure your response is VALID JSON with no comments.`;

               if (isTerminationImminent) {
                 errorMsg += `\n\nWARNING: You are near the recursion limit. If you have already performed this action and are repeating yourself, YOU MUST SUMMARIZE AND STOP NOW. DO NOT retry the tool again.`;
               }
               
               await sendCharacterMessage(responseCharacterId, sessionId, null, chatMessageText + `\\n\\n*(Failed to execute ${extractedToolName || "invalid"} - Tool not found)*`);
               
               // Delay to prevent 429 Concurrency limit from Featherless
               await new Promise(resolve => setTimeout(resolve, 2000));
               return await handleMessage(sessionId, createdBy, responseCharacterId, mode, sendersWalletAddress, errorMsg, currentRecursion + 1, llmProvider, llmModelId, responseCharacterId);
            }

            if (isValidTool) {
                const mockResponse: any = {
                metadata: response.metadata,
                content: [{
                    toolUse: {
                        toolUseId: "manual_" + Date.now(),
                        name: extractedToolName,
                        input: extractedToolParams
                    }
                }],
                role: 'assistant'
            };

            // 1. Send and Save the agent's conversational response first
            const responseUnixTimestampInMillis = Math.floor(Date.now());
            const responseMessageObject = {
                PK: `session#${sessionId}`,
                SK: `message#${responseUnixTimestampInMillis}`,
                createdAt: new Date().toISOString(),
                createdBy,
                message: chatMessageText,
                ttl: responseUnixTimestampInMillis / 1000 + TTL_DURATION,
                sessionId,
                characterId: responseCharacterId,
            };
            await createItem(messageObject.PK, messageObject.SK, responseMessageObject, TABLE_NAME, null);
            await sendCharacterMessage(responseCharacterId, sessionId, null, chatMessageText);

            // 2. Execute the tool
            const toolResult = await unifiedToolHandler(mockResponse, []);

            // 3. Feed the result back recursively to the SAME agent
            if (toolResult && toolResult.content && toolResult.content.length > 0) {
                const resultItems = toolResult.content.map((c: any) => c.toolResult?.content?.[0]?.text || JSON.stringify(c)).join("\n");
                const feedbackText = `TOOL_RESULT for ${extractedToolName}:\n${resultItems}`;
                
                logConsole.info(`🔹 Feeding tool result back to ${responseCharacterId}`);
                
                // Delay to prevent 429
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                return await handleMessage(
                    sessionId,
                    createdBy,
                    responseCharacterId,
                    mode,
                    sendersWalletAddress,
                    feedbackText,
                    currentRecursion + 1,
                    llmProvider,
                    llmModelId,
                    );
                } else {
                    return;
                }
            } else {
                // FALLBACK: If a JSON block was found but wasn't a valid tool
                // We just send the chat message and proceed to the recursion/handoff check.
                await sendCharacterMessage(responseCharacterId, sessionId, null, chatMessageText);
            }
        } catch(e) {
            logConsole.error("Failed to parse/execute LLM json block:", e);
        }
    } else {
        // --- CASE 2: No JSON tool call block found ---
        const responseUnixTimestampInMillis = Math.floor(Date.now());
        const responseMessageObject = {
            PK: `session#${sessionId}`,
            SK: `message#${responseUnixTimestampInMillis}`,
            createdAt: new Date().toISOString(),
            createdBy,
            message: chatMessageText,
            ttl: responseUnixTimestampInMillis / 1000 + TTL_DURATION,
            sessionId,
            characterId: responseCharacterId,
        };
        await createItem(messageObject.PK, messageObject.SK, responseMessageObject, TABLE_NAME, null);

        // Send response back via WebSocket
        logConsole.info(`> Agent Name: ${response.metadata.agentName}`);
        logConsole.info(`> Response: ${JSON.stringify(response).substring(0, 500)}`);

        await sendCharacterMessage(
            responseCharacterId,
            sessionId,
            null,
            chatMessageText,
        );
    }

    // --- SHARED RECURSION / HANDOFF LOGIC ---
    // At this point, chatMessageText contains the final text we should check for handoffs.
    
    logConsole.info(`🔹 Checking recursion: mode=${mode}, recursion=${currentRecursion}/${recursiveOptions.maxRecursions}`);

    if (currentRecursion >= recursiveOptions.maxRecursions) {
        logConsole.info(`Max recursion reached: ${currentRecursion}`);
        return;
    }

    if (mode === 'RECURSIVE') {
        // We check BOTH the raw output and the extracted chatMessageText for handoffs
        const combinedText = (response.output.toString() + " " + chatMessageText).trim();
        
        // Enhanced handoff detection: find all unique agent mentions
        const agentRegex = /(?:hey|hi|hello|,\s*)?\s*(Eric|Yasmin|Harper|Rishi)\b/ig;
        const matches = Array.from(combinedText.matchAll(agentRegex));
        const mentionedAgents = Array.from(new Set(matches.map(m => m[1])));
        
        // Filter out the current agent to prevent self-recursion
        const validHandoffTargets = mentionedAgents.filter(
            name => name.toLowerCase() !== (responseCharacterId || '').toLowerCase()
        );

        if (validHandoffTargets.length > 0) {
            // Handle the first valid handoff target sequentially
            const targetAgent = validHandoffTargets[0];
            logConsole.info(`🔹 Recursive handoff detected: ${responseCharacterId} -> ${targetAgent} (Total mentions: ${validHandoffTargets.join(', ')})`);
            
            return await handleMessage(
                sessionId,
                createdBy,
                responseCharacterId,
                mode,
                sendersWalletAddress,
                combinedText,
                currentRecursion + 1,
                llmProvider,
                llmModelId,
                targetAgent,
            );
        } else {
            logConsole.info(`🔹 No external agent handoff detected. Halting recursion.`);
            return;
        }
    }
  } catch (error) {
    console.error(`Failed to process message: ${error}`);
    if (responseCharacterId && sessionId) {
      await sendCharacterMessage(
        responseCharacterId,
        sessionId,
        null,
        JSON.stringify({ error: 'Something went wrong, please try again in a few moments.' }),
      );
    }
    throw error;
  }
};
