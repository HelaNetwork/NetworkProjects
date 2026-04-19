import { createStrategyAgent, createUserAgent, runAgentToCompletion } from "./lib/runtime.js";

async function main() {
  const strategyAgent = createStrategyAgent();
  const userAgent = createUserAgent();

  console.log("[demo] running strategy agent");
  const strategyTranscript = await runAgentToCompletion(strategyAgent);
  console.dir(strategyTranscript, { depth: null });

  console.log("[demo] running user agent");
  const userTranscript = await runAgentToCompletion(userAgent);
  console.dir(userTranscript, { depth: null });
}

main().catch((error) => { 
  console.error("[demo] failed", error);
  process.exitCode = 1;
});
