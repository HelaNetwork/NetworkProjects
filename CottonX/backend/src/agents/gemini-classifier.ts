/**
 * GeminiClassifier — Replaces BedrockClassifier for intent routing.
 * Uses Gemini Flash to decide which agent should handle a request.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Classifier, ConversationMessage, ClassifierResult } from 'multi-agent-orchestrator';

export interface GeminiClassifierOptions {
  modelId?: string;
  inferenceConfig?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  };
}

export class GeminiClassifier extends Classifier {
  private genAI: GoogleGenerativeAI;
  private geminiModelId: string;
  private geminiInferenceConfig: GeminiClassifierOptions['inferenceConfig'];

  constructor(options: GeminiClassifierOptions = {}) {
    super();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.geminiModelId = options.modelId || 'gemini-2.5-flash';
    this.geminiInferenceConfig = options.inferenceConfig || {};
  }

  async processRequest(
    inputText: string,
    chatHistory: ConversationMessage[],
    additionalParams?: Record<string, any>
  ): Promise<ClassifierResult> {
    const modelId = additionalParams?.llmModelId || this.geminiModelId;
    const model = this.genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: this.geminiInferenceConfig?.temperature ?? 0,
        maxOutputTokens: this.geminiInferenceConfig?.maxTokens ?? 1000,
        topP: this.geminiInferenceConfig?.topP ?? 0.9,
      },
    });

    // The system prompt is set by the orchestrator via setSystemPrompt.
    // We use `this.systemPrompt` which is the rendered prompt with agent
    // descriptions and history injected by the parent class.
    const systemPrompt = (this as any).systemPrompt || '';

    // If a target agent was explicitly requested (e.g. via recursion handoff), force it
    let targetHint = "";
    if (additionalParams?.targetAgentId) {
      targetHint = `\n\nSTRICT ROUTING HINT: The current message is a handoff intended for ${additionalParams.targetAgentId}. You MUST select ${additionalParams.targetAgentId} unless there is a critical reason not to.`;
    }

    // Ensure the system prompt strictly forces XML output
    const enforceXmlPrompt = `${systemPrompt}${targetHint}\n\nIMPORTANT: Analyze the user intent and select the most appropriate agent. You MUST output your final agent selection wrapped exactly in <selected_agent>Agent Name</selected_agent> tags. Do not use Markdown blocks or write conversational text.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: inputText }] }],
      systemInstruction: enforceXmlPrompt,
    });

    const responseText = result.response.text();

    // The orchestrator typically asks the LLM to output <selected_agent>Agent Name</selected_agent>
    let agentName = responseText.trim();
    
    // Try to extract from standard XML
    const xmlMatch = responseText.match(/<selected_agent>\s*(.*?)\s*<\/selected_agent>/i);
    if (xmlMatch && xmlMatch[1]) {
      agentName = xmlMatch[1].trim();
    } else {
      // Try to extract from markdown JSON
      const jsonMatch = responseText.match(/"selectedAgent"\s*:\s*"([^"]+)"/i);
      if (jsonMatch && jsonMatch[1]) {
         agentName = jsonMatch[1].trim();
      } else {
         // Fallback ONLY to strict whole string match (ignore case)
         const knownAgents = ['Eric', 'Yasmin', 'Harper', 'Rishi'];
         const strictMatch = knownAgents.find(a => agentName.toLowerCase() === a.toLowerCase());
         if (strictMatch) agentName = strictMatch;
      }
    }

    // Parse the classifier output — the orchestrator expects a ClassifierResult
    // with agentId and confidence. 
    return {
      selectedAgent: this.getAgentById(agentName),
      confidence: 1.0,
    } as ClassifierResult;
  }
}
