import {
  calculateAudit,
  type SpendInput,
  type UseCase,
} from "@/lib/audit/engine";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tools, teamSize, useCase } = body as {
      tools: SpendInput[];
      teamSize: number;
      useCase: UseCase;
    };

    if (!tools || !teamSize || !useCase) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const auditResult = calculateAudit(tools, teamSize, useCase);

    const resultId = generateResultId();

    return NextResponse.json({
      id: resultId,
      ...auditResult,
      tools,
      teamSize,
      useCase,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed to run audit" }, { status: 500 });
  }
}

function generateResultId(): string {
  return Math.random().toString(36).substring(2, 15);
}
