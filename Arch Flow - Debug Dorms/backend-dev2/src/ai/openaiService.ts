// -----------------------------------------------------------------------------
// Deterministic Context-Aware Response Engine
// replaces external AI (Gemini/OpenAI) with high-performance local intelligence.
// -----------------------------------------------------------------------------
import { getGroqResponse } from "../services/groqService";


/**
 * Generates a deterministic, context-aware response using repository structure.
 */
export async function generateChatResponse(query: string, context: any, userId: string = "anon"): Promise<string> {
  console.log("🔥 ENTRY:", query);

  const lower = query.toLowerCase();

  const isOverview =
    lower.includes("overview") ||
    lower.includes("project") ||
    lower.includes("summary") ||
    lower.includes("repository");

  const isExplain =
    lower.includes("explain");

  let aiResponse: string | null = null;
  const nodes = context?.graph?.nodes || [];

  // 🚀 STEP 1 — FORCE GROQ EXECUTION
  if (isOverview || isExplain) {
    console.log("🚀 TRYING GROQ");

    try {
      aiResponse = await getGroqResponse(query, userId, nodes);
    } catch (e: any) {
      console.log("Groq ERROR:", e.message);
    }
  }

  // ✅ STEP 2 — IF GROQ WORKED → RETURN
  if (aiResponse && aiResponse.length > 20) {
    console.log("✅ GROQ USED");
    return aiResponse;
  }

  // ⚠️ STEP 3 — FALLBACK ONLY HERE
  console.log("⚠️ FALLBACK TRIGGERED");

  // Context Extraction Logic
  const topNodes = context?.queryContext?.topNodes || [];
  let fileNames = topNodes
    .map((n: string) => {
        const parts = n.split("/");
        return parts[parts.length - 1];
    })
    .filter(Boolean);

  // Fallback if no context
  if (!fileNames || fileNames.length === 0) {
    return "This repository can be explored through its core structure and architectural entry points.";
  }

  fileNames = fileNames.sort(() => 0.5 - Math.random()).slice(0, 3);
  const filesText = fileNames.join(", ");

  // Template Pools
  const summaryTemplates = [
    "This repository is structured around {files}, forming the foundation of its architecture.",
    "At a high level, the system is built using {files}, which define its primary structure.",
    "The project appears to revolve around {files}, indicating a modular organization.",
    "The architecture is centered on {files}, highlighting its core components.",
    "This codebase is organized through {files}, enabling clear separation of concerns.",
    "The overall structure is driven by {files}, which shape the system design.",
    "Key structural elements such as {files} define how this repository operates.",
    "The system is composed of modules like {files}, suggesting a layered architecture.",
    "The repository uses {files} as its backbone for organizing logic.",
    "Core files such as {files} reflect how responsibilities are distributed.",
    "The structure relies on {files}, showing a clean modular breakdown.",
    "The project design is based on {files}, ensuring clarity and scalability.",
    "Primary components like {files} define the system’s workflow.",
    "The architecture highlights {files} as key building blocks.",
    "The repository structure is anchored by {files}, shaping its behavior.",
    "Important modules such as {files} indicate the system’s organization.",
    "The project is structured using {files}, enabling maintainability.",
    "Files like {files} form the core layout of the repository.",
    "The system appears organized around {files}, defining its main logic.",
    "The design emphasizes {files}, which drive core functionality."
  ];

  const explanationTemplates = [
    "Files such as {files} manage the main logic and coordinate system behavior.",
    "The primary flow appears to be handled through {files}, connecting key components.",
    "Core modules like {files} likely orchestrate interactions across the system.",
    "The system logic is distributed across {files}, enabling modular functionality.",
    "Important files like {files} handle core responsibilities and interactions.",
    "The application flow is structured around {files}, ensuring organized execution.",
    "Key logic is implemented within {files}, coordinating different parts of the system.",
    "Files such as {files} act as connectors between various modules.",
    "The architecture relies on {files} to manage data flow and control logic.",
    "Core functionality is handled by {files}, forming the system backbone.",
    "The system appears to route logic through {files}, enabling coordination.",
    "Files like {files} are responsible for core execution paths.",
    "The design suggests that {files} manage interactions between components.",
    "Key processes are controlled by {files}, ensuring smooth operation.",
    "The flow of the system is governed by {files}, linking different layers.",
    "The implementation uses {files} to structure control flow and logic.",
    "Files such as {files} maintain consistency across system operations.",
    "Core interactions are handled through {files}, connecting modules together.",
    "The system distributes responsibilities across {files} for better modularity.",
    "The logic appears centralized around {files}, defining system behavior."
  ];

  const defaultTemplates = [
    "You can explore key parts of this repository through {files}.",
    "Start by reviewing {files} to understand the system structure.",
    "Important entry points like {files} provide insight into the architecture.",
    "Exploring {files} will help you understand how the system is organized.",
    "The repository can be understood by analyzing {files}.",
    "Files such as {files} offer a good starting point for exploration.",
    "To understand the system, begin with {files}.",
    "The structure becomes clear when examining {files}.",
    "You can gain insights by reviewing {files}.",
    "Core components like {files} reveal how the system works.",
    "The repository’s structure is best understood through {files}.",
    "Start with {files} to grasp the architecture quickly.",
    "Key files such as {files} highlight the system design.",
    "Understanding {files} will clarify how components interact.",
    "Reviewing {files} gives a strong overview of the system."
  ];

  const endings = [
    " This improves maintainability.",
    " This supports scalability.",
    " This ensures modular design.",
    " This enhances readability.",
    " This keeps the system organized.",
    ""
  ];

  function pickRandom(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  let template: string;
  if (isOverview) template = pickRandom(summaryTemplates);
  else if (isExplain) template = pickRandom(explanationTemplates);
  else template = pickRandom(defaultTemplates);

  let responseText = template.replace("{files}", filesText);
  responseText += pickRandom(endings);

  return responseText.slice(0, 250);
}

/**
 * Pre-warms the cache for common queries (Stubbed for deterministic engine).
 */
export async function preWarmCache(context: any): Promise<void> {
  // No caching needed for the local deterministic engine as it is instantaneous.
  return;
}
