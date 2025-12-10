import { NextResponse } from "next/server";
import { WorkOrderService } from "@/app/lib/firestore";

export async function GET() {
  try {
    const summaries = await WorkOrderService.listSummaries();
    return NextResponse.json(summaries);
  } catch (error) {
    console.error("Erro ao listar resumos de O.S.", error);
    return NextResponse.json({ error: "Erro ao listar resumos de O.S." }, { status: 500 });
  }
}
