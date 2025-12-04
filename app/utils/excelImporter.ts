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
    });

    const parsed: ParsedWorkOrder[] = json.map((row, idx) => {
      // mapping best-effort: try to map common column names
      const title = row.title || row.Title || row.titulo || row.Título || row['Descrição'] || row.description || row['Descricao'];
      const packageId = row.packageId || row.package || row.Pacote || row['package id'];
      const subPackageId = row.subPackageId || row.subpackage || row.Subpackage;
      const status = row.status || row.Status || row.estado || row.estado;

      return {
        title: title ? String(title) : `Linha ${idx + 1}`,
        packageId: packageId ? String(packageId) : undefined,
        subPackageId: subPackageId ? String(subPackageId) : undefined,
        status: status ? String(status) : "pending",
        rowIndex: idx,
      } as ParsedWorkOrder;
    });

    return parsed;
  }
}

export default ExcelImporter;
