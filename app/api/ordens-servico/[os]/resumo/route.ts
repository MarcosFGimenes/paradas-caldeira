import { NextRequest, NextResponse } from "next/server";
import { WorkOrderService } from "@/app/lib/firestore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ os: string }> }
) {
  try {
    const { os } = await params;
    const summary = await WorkOrderService.getSummaryByOs(os);

    if (!summary) {
      return NextResponse.json({ error: "O.S. não encontrada" }, { status: 404 });
    }

    return NextResponse.json(summary);
  } catch (error) {
    const { os } = await params;
    console.error(`Erro ao buscar resumo da O.S. ${os}`, error);
    return NextResponse.json({ error: "Erro ao buscar resumo da O.S." }, { status: 500 });
  }
}
