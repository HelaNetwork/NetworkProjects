import { NextResponse } from "next/server";
import { processDueJobs } from "@/lib/automation";

export async function POST() {
  try {
    const results = await processDueJobs();
    return NextResponse.json(
      {
        processed: results.length,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process automation jobs"
      },
      { status: 500 }
    );
  }
}
