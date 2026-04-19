import OpenAI from 'openai';
import { Agent, ConversationMessage, ParticipantRole } from 'multi-agent-orchestrator';

export interface OpenAIAgentOptions {
  name: string;
  description: string;
  streaming?: boolean;
  modelId?: string;
  apiKey?: string;
  baseUrl?: string;
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

export class OpenAIAgent extends Agent {
  private client: OpenAI;
  private modelId: string;
  private systemPromptText: string;
  private agentToolConfig?: OpenAIAgentOptions['toolConfig'];
  private inferenceConfig: OpenAIAgentOptions['inferenceConfig'];

  constructor(options: OpenAIAgentOptions) {
    super({
      name: options.name,
      description: options.description,
      saveChat: options.saveChat ?? true,
    });
    this.client = new OpenAI({
      apiKey: options.apiKey || process.env.FEATHERLESS_API_KEY || '',
      baseURL: options.baseUrl || 'https://api.featherless.ai/v1',
    });
    this.modelId = options.modelId || process.env.API_MODEL_ID || 'deepseek-ai/DeepSeek-V3-0324';
    this.systemPromptText = options.systemPrompt || '';
    this.agentToolConfig = options.toolConfig;
    this.inferenceConfig = options.inferenceConfig || {};
  }

  setSystemPrompt(prompt: string) {
    this.systemPromptText = prompt;
  }

  private getClient(provider: string = 'featherless') {
    let apiKey = process.env.FEATHERLESS_API_KEY || '';
    let baseURL = 'https://api.featherless.ai/v1';

    if (provider === 'groq') {
      apiKey = process.env.GROQ_API_KEY || '';
      baseURL = 'https://api.groq.com/openai/v1';
    } else if (provider === 'deepseek') {
        apiKey = process.env.DEEPSEEK_API_KEY || '';
        baseURL = 'https://api.deepseek.com';
    }

    return new OpenAI({ apiKey, baseURL });
  }

  async processRequest(
    inputText: string,
    userId: string,
    sessionId: string,
    chatHistory: ConversationMessage[],
    additionalParams?: Record<string, any>,
  ): Promise<ConversationMessage> {
    const provider = additionalParams?.llmProvider || process.env.LLM_PROVIDER || 'featherless';
    const modelId = additionalParams?.llmModelId || this.modelId;
    const client = this.getClient(provider);
    
    // 1. Build OpenAI tools array
    const openAiTools = this.agentToolConfig?.tool
      ? this.agentToolConfig.tool.map(tool => ({
          type: 'function',
          function: {
            name: tool.toolSpec.name,
            description: tool.toolSpec.description,
            parameters: tool.toolSpec.inputSchema.json,
          },
        }))
      : undefined;

    // 2. Build history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPromptText },
      ...this.buildOpenAIHistory(chatHistory),
      { role: 'user', content: inputText },
    ];

    // 3. Initial Request
    let response = await client.chat.completions.create({
      model: modelId,
      messages,
      tools: openAiTools as any,
      temperature: this.inferenceConfig?.temperature ?? 0,
      max_tokens: this.inferenceConfig?.maxTokens ?? 4096,
      top_p: this.inferenceConfig?.topP ?? 0.9,
    });

    let message = response.choices[0].message;
    let recursionCount = 0;
    const maxRecursions = this.agentToolConfig?.toolMaxRecursions ?? 5;

    // 4. Tool-calling loop
    while (message.tool_calls && message.tool_calls.length > 0 && recursionCount < maxRecursions) {
      messages.push(message);

      // Execute tool calls
      const toolResults = await this.executeToolCalls(message.tool_calls, chatHistory);
      
      // Add results to history
      messages.push(...toolResults);

      // Next model turn
      response = await client.chat.completions.create({
        model: modelId,
        messages,
        tools: openAiTools as any,
      });

      message = response.choices[0].message;
      recursionCount++;
    }

    return {
      role: ParticipantRole.ASSISTANT,
      content: [{ text: message.content || '' }],
    };
  }

  private buildOpenAIHistory(chatHistory: ConversationMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return chatHistory.map((msg) => {
      const role = msg.role === ParticipantRole.USER ? 'user' : 'assistant';
      let content = '';
      if (msg.content) {
        content = msg.content.map(block => (typeof block === 'string' ? block : block.text || '')).join('\n');
      }
      return { role, content } as OpenAI.Chat.ChatCompletionMessageParam;
    });
  }

  private async executeToolCalls(
    toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[],
    chatHistory: ConversationMessage[],
  ): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
    if (!this.agentToolConfig) return [];

    // Convert OpenAI tool calls to Bedrock-style for the existing handler
    const bedrockContent = toolCalls.map(tc => {
      const func = 'function' in tc ? tc.function : null;
      if (!func) return null;
      return {
        toolUse: {
          toolUseId: tc.id,
          name: func.name,
          input: JSON.parse(func.arguments),
        },
      };
    }).filter(Boolean);

    const bedrockResponse = {
      content: bedrockContent,
      role: 'assistant',
    };

    const handlerResult = await this.agentToolConfig.useToolHandler(
      bedrockResponse,
      chatHistory,
    );

    // Convert results back to OpenAI message parts
    return toolCalls.map(tc => {
      const result = handlerResult.content.find((i: any) => i.toolResult?.toolUseId === tc.id);
      return {
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result?.toolResult?.content?.[0]?.json || { success: true }),
      } as OpenAI.Chat.ChatCompletionMessageParam;
    });
  }
}
