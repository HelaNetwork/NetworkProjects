import OpenAI from 'openai';
import { Classifier, ConversationMessage, ClassifierResult } from 'multi-agent-orchestrator';

export interface OpenAIClassifierOptions {
  modelId?: string;
  apiKey?: string;
  baseUrl?: string;
  inferenceConfig?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  };
}

export class OpenAIClassifier extends Classifier {
  private client!: OpenAI;
  modelId: string;
  private inferenceConfig: OpenAIClassifierOptions['inferenceConfig'];

  constructor(options: OpenAIClassifierOptions = {}) {
    super();
    this.modelId = options.modelId || process.env.API_MODEL_ID || 'deepseek-ai/DeepSeek-V3-0324';
    this.inferenceConfig = options.inferenceConfig || {};
  }

  private getClient(provider: string = 'featherless'): OpenAI {
    let apiKey = process.env.FEATHERLESS_API_KEY || '';
    let baseURL = 'https://api.featherless.ai/v1';

    if (provider === 'groq') {
      apiKey = process.env.GROQ_API_KEY || '';
      baseURL = 'https://api.groq.com/openai/v1';
    } else if (provider === 'deepseek') {
      apiKey = process.env.DEEPSEEK_API_KEY || '';
      baseURL = 'https://api.deepseek.com';
    }

    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}. Please check your .env file.`);
    }

    console.log(`[OpenAIClassifier] Creating client for provider: ${provider}, baseURL: ${baseURL}`);
    
    return new OpenAI({ 
      apiKey, 
      baseURL,
      dangerouslyAllowBrowser: false
    });
  }

  async processRequest(
    inputText: string,
    chatHistory: ConversationMessage[],
    additionalParams?: Record<string, any>
  ): Promise<ClassifierResult> {
    const provider = additionalParams?.llmProvider || process.env.LLM_PROVIDER || 'featherless';
    const modelId = additionalParams?.llmModelId || this.modelId;
    
    console.log(`[OpenAIClassifier] Using provider: ${provider}, model: ${modelId}`);
    
    const client = this.getClient(provider);

    const systemPrompt = (this as any).systemPrompt || '';

    // If a target agent was explicitly requested (e.g. via recursion handoff), force it
    let targetHint = "";
    if (additionalParams?.targetAgentId) {
      targetHint = `\n\nSTRICT ROUTING HINT: The current message is a handoff intended for ${additionalParams.targetAgentId}. You MUST select ${additionalParams.targetAgentId} unless there is a critical reason not to.`;
    }

    // Standardize the prompt to force XML output
    const enforceXmlPrompt = `${systemPrompt}${targetHint}\n\nIMPORTANT: Analyze the user intent and select the most appropriate agent. You MUST output your final agent selection wrapped exactly in <selected_agent>Agent Name</selected_agent> tags. Do not use Markdown blocks or write conversational text.`;

    const response = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: enforceXmlPrompt },
        { role: 'user', content: inputText },
      ],
      temperature: this.inferenceConfig?.temperature ?? 0,
      max_tokens: this.inferenceConfig?.maxTokens ?? 1000,
      top_p: this.inferenceConfig?.topP ?? 0.9,
    });

    const responseText = response.choices[0]?.message?.content || '';

    // Extraction logic similar to GeminiClassifier
    let agentName = responseText.trim();
    const xmlMatch = responseText.match(/<selected_agent>\s*(.*?)\s*<\/selected_agent>/i);
    
    if (xmlMatch && xmlMatch[1]) {
      agentName = xmlMatch[1].trim();
    } else {
      // Fallback: search for known agents
      const knownAgents = ['Eric', 'Yasmin', 'Harper', 'Rishi'];
      const strictMatch = knownAgents.find(a => agentName.toLowerCase().includes(a.toLowerCase()));
      if (strictMatch) agentName = strictMatch;
    }

    return {
      selectedAgent: this.getAgentById(agentName),
      confidence: 1.0,
    } as ClassifierResult;
  }
}
