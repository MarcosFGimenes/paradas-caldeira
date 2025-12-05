"use client";
import React, { useEffect, useState } from "react";
import ExcelImporter from "@/app/utils/excelImporter";
import {
  Package,
  PackageService,
  SubPackage,
  SubPackageService,
  WorkOrderService,
} from "@/app/lib/firestore";

type Props = {
  onClose?: () => void;
};

export const ImportExcelModal: React.FC<Props> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [subPackages, setSubPackages] = useState<SubPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedSubPackage, setSelectedSubPackage] = useState<string>("auto");

  const normalizeName = (value: string) =>
    value
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const list = await PackageService.list();
        setPackages(list);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os pacotes disponíveis."
        );
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    if (!selectedPackage) {
      setSubPackages([]);
      setSelectedSubPackage("auto");
      return;
    }

    const fetchSubPackages = async () => {
      try {
        const list = await SubPackageService.listByPackage(selectedPackage);
        setSubPackages(list);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os subpacotes deste pacote."
        );
      }
    };

    fetchSubPackages();
  }, [selectedPackage]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const onImport = async () => {
    if (!file) {
      setError("Selecione um arquivo para importar.");
      return;
    }
    if (!selectedPackage) {
      setError("Escolha o pacote que receberá os serviços importados.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const parsed = await ExcelImporter.parseFile(file);
      if (!parsed.length) {
        setMessage("Nenhuma linha válida encontrada. Confira o cabeçalho na linha 6.");
        return;
      }

      const normalizedSubPackageLookup = new Map(
        subPackages.map((sub) => [normalizeName(sub.name), sub.id])
      );

      const unmatchedOffices = new Set<string>();

      for (const p of parsed) {
        const rawOffice = p.office?.toString();
        const normalizedOffice = rawOffice ? normalizeName(rawOffice) : "";

        let targetSubPackageId: string | undefined;

        if (selectedSubPackage === "auto") {
          if (normalizedOffice) {
            const matchedSubPackageId = normalizedSubPackageLookup.get(normalizedOffice);
            if (matchedSubPackageId) {
              targetSubPackageId = matchedSubPackageId;
            } else {
              unmatchedOffices.add(rawOffice || "(vazio)");
            }
          }
        } else if (selectedSubPackage) {
          targetSubPackageId = selectedSubPackage;
        }

        await WorkOrderService.create({
          title: p.title || p.task || "Importado",
          packageId: selectedPackage,
          subPackageId: targetSubPackageId,
          status: p.status || "pending",
          office: p.office ?? null,
          osNumber: p.osNumber ?? null,
          tag: p.tag ?? null,
          machineName: p.machineName ?? null,
          task: p.task ?? p.title ?? null,
          responsible: p.responsible ?? null,
          sourceRow: p.rowIndex,
        });
      }

      const unmatchedText =
        unmatchedOffices.size === 0
          ? ""
          : ` As oficinas sem subpacote correspondente foram mantidas sem vínculo: ${Array.from(
              unmatchedOffices
            ).join(", ")}.`;

      setMessage(
        `Importadas ${parsed.length} tarefas para ${
          packages.find((p) => p.id === selectedPackage)?.name || "o pacote selecionado"
        }.${unmatchedText}`
      );
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Importar Excel</p>
          <h2 className="text-xl font-semibold text-white">Adicionar serviços via planilha</h2>
          <p className="text-sm text-slate-400">
            A planilha deve ter o cabeçalho na linha 6 com as colunas: OFICINA, O.S, TAG, NOME
            MAQUINA, TAREFA e RESPONSÁVEL.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-rose-400/60 hover:text-rose-100"
        >
          Fechar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Pacote</label>
          <select
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
          >
            <option value="">Selecione um pacote</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Subpacote (opcional)</label>
          <select
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            value={selectedSubPackage}
            onChange={(e) => setSelectedSubPackage(e.target.value)}
            disabled={!subPackages.length}
          >
            <option value="auto">Automático (coluna OFICINA)</option>
            <option value="">Sem subpacote</option>
            {subPackages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200">Arquivo (.xlsx)</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
          className="w-full rounded-lg border border-dashed border-emerald-400/40 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        />
        <p className="text-xs text-slate-400">
          Use a linha 6 para os cabeçalhos e coloque os dados abaixo, como na planilha de exemplo enviada.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400/60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onImport}
          disabled={!file || loading}
          className="rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Importando..." : "Importar"}
        </button>
      </div>
    </div>
  );
};

export default ImportExcelModal;
