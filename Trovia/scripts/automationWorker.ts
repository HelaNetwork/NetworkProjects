import "dotenv/config";
import cron from "node-cron";
import { processDueJobs } from "../lib/automation";

async function runDueJobs() {
  console.log("[AUTOMATION_WORKER] Starting due-job check");
  const results = await processDueJobs();
  console.log(
    "[AUTOMATION_WORKER] Finished",
    JSON.stringify(
      {
        processed: results.length,
        results
      },
      null,
      2
    )
  );
}

async function main() {
  const mode = (process.env.AUTOMATION_WORKER_MODE || "once").trim().toLowerCase();

  if (mode === "watch") {
    console.log("[AUTOMATION_WORKER] Watch mode enabled (cron: every minute)");

    await runDueJobs();

    cron.schedule("* * * * *", async () => {
      try {
        await runDueJobs();
      } catch (error) {
        console.error("[AUTOMATION_WORKER] Scheduled run failed", error instanceof Error ? error.message : String(error));
      }
    });

    return;
  }

  await runDueJobs();
}

main().catch((error) => {
  console.error("[AUTOMATION_WORKER] Error", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
