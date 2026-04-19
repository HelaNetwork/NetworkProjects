/**
 * GeminiAgent — A custom Agent implementation for multi-agent-orchestrator
 * that uses Google Gemini 1.5 Flash instead of AWS Bedrock.
 *
 * Supports:
 *  - System prompts
 *  - Multi-turn conversation
 *  - Function calling (tool use) with recursive execution
 */

import {
  GoogleGenerativeAI,
  Content,
  FunctionDeclaration,
  Part,
  FunctionCallingMode,
} from '@google/generative-ai';
import { Agent, ConversationMessage, ParticipantRole } from 'multi-agent-orchestrator';

// ── Tool format conversion ─────────────────────────────────────────────────

/** Convert Bedrock-style toolSpec to Gemini functionDeclaration */
function bedrockToolToGemini(bedrockTool: any): FunctionDeclaration {
  const spec = bedrockTool.toolSpec;
  return {
    name: spec.name,
    description: spec.description,
    parameters: spec.inputSchema?.json as any,
  };
}

// ── GeminiAgent ─────────────────────────────────────────────────────────────

export interface GeminiAgentOptions {
  name: string;
  description: string;
  streaming?: boolean;
  modelId?: string;
  systemPrompt?: string;
  saveChat?: boolean;
  inferenceConfig?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
  toolConfig?: {
    tool: any[];           // Bedrock-style tool descriptions
    useToolHandler: Function;
    toolMaxRecursions?: number;
  };
}

export class GeminiAgent extends Agent {
  private genAI: GoogleGenerativeAI;
  private modelId: string;
  private systemPromptText: string;
  private agentToolConfig?: GeminiAgentOptions['toolConfig'];
  private inferenceConfig: GeminiAgentOptions['inferenceConfig'];

  constructor(options: GeminiAgentOptions) {
    super({
      name: options.name,
      description: options.description,
      saveChat: options.saveChat ?? true,
    });
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.modelId = options.modelId || 'gemini-2.5-flash';
    this.systemPromptText = options.systemPrompt || '';
    this.agentToolConfig = options.toolConfig;
    this.inferenceConfig = options.inferenceConfig || {};
  }

  setSystemPrompt(prompt: string) {
    this.systemPromptText = prompt;
  }

  /* ── Core handler ─────────────────────────────────────────────────────── */

  async processRequest(
    inputText: string,
    userId: string,
    sessionId: string,
    chatHistory: ConversationMessage[],
    additionalParams?: Record<string, any>,
  ): Promise<ConversationMessage> {
    const modelId = additionalParams?.llmModelId || this.modelId;

    // 1. Build Gemini tools array
    const geminiTools: FunctionDeclaration[] = this.agentToolConfig?.tool
      ? this.agentToolConfig.tool.map(bedrockToolToGemini)
      : [];

    // 2. Create model
    const model = this.genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: this.systemPromptText || undefined,
      generationConfig: {
        temperature: this.inferenceConfig?.temperature ?? 0,
        maxOutputTokens: this.inferenceConfig?.maxTokens ?? 4096,
        topP: this.inferenceConfig?.topP ?? 0.9,
      },
      tools: geminiTools.length > 0
        ? [{ functionDeclarations: geminiTools }]
        : undefined,
    });

    // 3. Build history from ConversationMessage[]
    const history: Content[] = this.buildGeminiHistory(chatHistory);

    // 4. Start chat
    const chat = model.startChat({ history });

    // 5. Send user message
    let result = await chat.sendMessage(inputText);
    let response = result.response;

    // 6. Tool-calling loop
    let recursionCount = 0;
    const maxRecursions = this.agentToolConfig?.toolMaxRecursions ?? 5;

    while (recursionCount < maxRecursions) {
      const functionCalls = response.candidates?.[0]?.content?.parts?.filter(
        (p: Part) => 'functionCall' in p
      );

      if (!functionCalls || functionCalls.length === 0) break;

      // Execute function calls via existing tool handler
      const toolResults = await this.executeFunctionCalls(
        functionCalls,
        chatHistory,
      );

      // Send function results back to the model
      result = await chat.sendMessage(toolResults);
      response = result.response;
      recursionCount++;
    }

    // 7. Extract final text
    const outputText = response.text() || 'No response content';

    return {
      role: ParticipantRole.ASSISTANT,
      content: [{ text: outputText }],
    };
  }

  /* ── Helpers ──────────────────────────────────────────────────────────── */

  private buildGeminiHistory(chatHistory: ConversationMessage[]): Content[] {
    return chatHistory.map((msg) => {
      const role = msg.role === ParticipantRole.USER ? 'user' : 'model';
      const textParts: Part[] = [];
      if (msg.content) {
        for (const block of msg.content) {
          if (typeof block === 'string') {
            textParts.push({ text: block });
          } else if ('text' in block && block.text) {
            textParts.push({ text: block.text });
          }
        }
      }
      if (textParts.length === 0) {
        textParts.push({ text: ' ' }); // Gemini needs at least one part
      }
      return { role, parts: textParts };
    });
  }

  /**
   * Execute function calls using the existing Bedrock-format tool handler.
   * Converts Gemini functionCall → Bedrock toolUse, calls handler, converts back.
   */
  private async executeFunctionCalls(
    functionCallParts: Part[],
    chatHistory: ConversationMessage[],
  ): Promise<Part[]> {
    if (!this.agentToolConfig) return [];

    // Build a Bedrock-style "response" object so the existing handler works
    const bedrockContent = functionCallParts.map((part: any) => ({
      toolUse: {
        toolUseId: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: part.functionCall.name,
        input: part.functionCall.args,
      },
    }));

    const bedrockResponse = {
      content: bedrockContent,
      role: 'assistant',
    };

    // Call the existing handler (walletToolHandler, tradingToolHandler, etc.)
    const handlerResult = await this.agentToolConfig.useToolHandler(
      bedrockResponse,
      chatHistory,
    );

    // Convert handler result back to Gemini functionResponse parts
    const geminiParts: Part[] = [];
    if (handlerResult?.content) {
      for (const item of handlerResult.content) {
        if (item?.toolResult) {
          const matchingCall = bedrockContent.find(
            (c: any) => c.toolUse.toolUseId === item.toolResult.toolUseId
          );
          geminiParts.push({
            functionResponse: {
              name: matchingCall?.toolUse.name || 'unknown',
              response: item.toolResult.content?.[0]?.json || {},
            },
          } as any);
        }
      }
    }

    return geminiParts;
  }
}
