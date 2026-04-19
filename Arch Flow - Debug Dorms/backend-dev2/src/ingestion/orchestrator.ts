import { AnalysisResult } from "../types/graphTypes";
import { ingest, IngestionInput } from "./repoIngestion";
import { validateInput } from "../utils/validator";
import { buildArchitectureGraph } from "../graph/graphBuilder";
import { deepFreeze } from "../utils/deepFreeze";

/**
 * Single orchestrator for the full analysis pipeline.
 */
export async function analyzeRepository(input: IngestionInput): Promise<AnalysisResult> {
  const raw = await ingest(input);
  const { files, dependencies } = validateInput(raw.files, raw.dependencies);
  const result = buildArchitectureGraph({ files, dependencies });

  const payloadStr = JSON.stringify(result);
  result.metadata.payloadSize = Math.round(payloadStr.length / 1024);

  deepFreeze(result.nodeMap);
  deepFreeze(result.searchIndex);
  deepFreeze(result.queryContext);

  return result;
}
