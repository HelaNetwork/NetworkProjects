import { NextResponse } from "next/server";
import { readAgentSkill } from "@/lib/agent-skill";

export async function GET() {
  const content = await readAgentSkill("user-agent");

  return new NextResponse(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
