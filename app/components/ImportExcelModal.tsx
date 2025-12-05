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
  defaultPackageId?: string;
  hidePackageSelector?: boolean;
};

export const ImportExcelModal: React.FC<Props> = ({
  onClose,
  defaultPackageId,
  hidePackageSelector = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [subPackages, setSubPackages] = useState<SubPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");

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
    if (defaultPackageId) {
      setSelectedPackage(defaultPackageId);
    }
  }, [defaultPackageId]);

  useEffect(() => {
    if (!selectedPackage) {
      setSubPackages([]);
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
    let shouldClose = false;
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

      const existingOrders = await WorkOrderService.listByPackage(selectedPackage);
      let currentSubPackages = [...subPackages];
      const normalizeOsNumber = (value: string | number | null | undefined) =>
        value?.toString().trim().toLowerCase();
      const normalizeText = (value: string | number | null | undefined) =>
        value
          ?.toString()
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}+/gu, "");
      const deriveOfficeKey = (officeValue?: string | number | null) => {
        const normalized = normalizeText(officeValue);
        if (!normalized) return undefined;
        if (normalized.includes("mec")) return "mecanico";
        if (normalized.includes("eletr")) return "eletrico";
        return normalized;
      };
      const knownOsNumbers = new Set(
        existingOrders
          .map((order) => normalizeOsNumber(order.osNumber))
          .filter(Boolean) as string[]
      );

      const ensureSubPackageForOffice = async (
        officeKey: string | undefined | null
      ): Promise<string | null> => {
        if (!officeKey) return null;

        const existing = currentSubPackages.find((sub) =>
          normalizeText(sub.name)?.includes(officeKey)
        );
        if (existing?.id) {
          return existing.id;
        }

        const newName =
          officeKey === "mecanico"
            ? "Mecânico"
            : officeKey === "eletrico"
              ? "Elétrico"
              : officeKey;

        const createdId = await SubPackageService.create({
          packageId: selectedPackage,
          name: newName,
        });

        const newSub = { id: createdId, packageId: selectedPackage, name: newName };
        currentSubPackages = [...currentSubPackages, newSub];
        setSubPackages(currentSubPackages);

        return createdId;
      };

      let createdCount = 0;
      let skippedCount = 0;

      for (const p of parsed) {
        const normalizedOsNumber = normalizeOsNumber(p.osNumber ?? null);
        if (normalizedOsNumber && knownOsNumbers.has(normalizedOsNumber)) {
          skippedCount += 1;
          continue;
        }

        const officeKey = deriveOfficeKey(p.office ?? null);
        const matchedSubPackageId = await ensureSubPackageForOffice(officeKey);

        await WorkOrderService.create({
          title: p.title || p.task || "Importado",
          packageId: selectedPackage,
          subPackageId: matchedSubPackageId,
          status: p.status || "pending",
          office: p.office ?? null,
          osNumber: p.osNumber ?? null,
          tag: p.tag ?? null,
          machineName: p.machineName ?? null,
          task: p.task ?? p.title ?? null,
          responsible: p.responsible ?? null,
          sourceRow: p.rowIndex,
        });

        if (normalizedOsNumber) {
          knownOsNumbers.add(normalizedOsNumber);
        }
        createdCount += 1;
      }

      const packageName =
        packages.find((p) => p.id === selectedPackage)?.name || "o pacote selecionado";
      if (!createdCount) {
        setMessage(`Nenhuma nova O.S. para importar em ${packageName}. Todas já existem.`);
        return;
      }

      const skippedText = skippedCount
        ? ` ${skippedCount} linha${skippedCount > 1 ? "s" : ""} ignorada${
            skippedCount > 1 ? "s" : ""
          } por O.S. duplicada.`
        : "";

      const summary = `Importadas ${createdCount} tarefas para ${packageName}.${skippedText}`;

      if (skippedCount) {
        alert(summary);
      }

      setMessage(summary);
      shouldClose = true;
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
      if (shouldClose) {
        onClose?.();
      }
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

      {!hidePackageSelector && (
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
        </div>
      )}

      {hidePackageSelector && selectedPackage && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-slate-400">Pacote</p>
            <p className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm font-semibold text-white">
              {packages.find((p) => p.id === selectedPackage)?.name || "Pacote selecionado"}
            </p>
          </div>
        </div>
      )}

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
          O subpacote é detectado automaticamente pela coluna OFICINA (MECÂNICO/ELÉTRICO).
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
