"use client";
import React, { useState } from "react";
import ExcelImporter from "@/app/utils/excelImporter";
import { WorkOrderService } from "@/app/lib/firestore";

type Props = {
  onClose?: () => void;
};

export const ImportExcelModal: React.FC<Props> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const onImport = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const parsed = await ExcelImporter.parseFile(file);
      for (const p of parsed) {
        await WorkOrderService.create({
          title: p.title || "Importado",
          packageId: p.packageId || "",
          subPackageId: p.subPackageId,
          status: p.status || "pending",
        });
      }
      setMessage(`Importadas ${parsed.length} ordens`);
    } catch (err: any) {
      setMessage(`Erro: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
      <h3>Importar Excel</h3>
      <input type="file" accept=".xlsx,.xls" onChange={onFileChange} />
      <div style={{ marginTop: 8 }}>
        <button onClick={onImport} disabled={!file || loading}>
          {loading ? "Importando..." : "Importar"}
        </button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>
          Fechar
        </button>
      </div>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  );
};

export default ImportExcelModal;
