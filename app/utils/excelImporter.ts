import * as XLSX from "xlsx";
import { WorkOrder } from "@/app/lib/firestore";

export type ParsedWorkOrder = Partial<WorkOrder> & { rowIndex?: number };

export class ExcelImporter {
  static async parseFile(file: File): Promise<ParsedWorkOrder[]> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: null,
      // a planilha tem cabeçalho na linha 6 (índice 5)
      range: 5,
      raw: false,
      blankrows: false,
    });

    const normalizeKey = (key: string) => key?.toString().trim().toLowerCase();

    const parsed: ParsedWorkOrder[] = json.map((row, idx) => {
      const normalizedEntries = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeKey(key), value])
      );

      const task =
        normalizedEntries["tarefa"] ||
        normalizedEntries["descrição"] ||
        normalizedEntries["descricao"];

      const workOrder: ParsedWorkOrder = {
        title: task ? String(task) : `Linha ${idx + 1}`,
        status: "pending",
        rowIndex: idx + 6, // linha real na planilha (começa na linha 6)
        office: normalizedEntries["oficina"] || undefined,
        osNumber: normalizedEntries["o.s"] || normalizedEntries["os"] || undefined,
        tag: normalizedEntries["tag"] || undefined,
        machineName: normalizedEntries["nome maquina"] || normalizedEntries["nome máquina"] || undefined,
        task: task ? String(task) : undefined,
        responsible: normalizedEntries["responsável"] || normalizedEntries["responsavel"] || undefined,
      };

      return workOrder;
    });

    return parsed.filter((row) => row.title?.trim());
  }
}

export default ExcelImporter;
