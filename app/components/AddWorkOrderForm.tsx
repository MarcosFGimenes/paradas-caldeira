"use client";

import React, { useMemo, useState } from "react";
import { WorkOrder, WorkOrderService } from "@/app/lib/firestore";

interface AddWorkOrderFormProps {
  packageId: string;
  subPackageId: string;
  onCreated?: (workOrder: WorkOrder) => void;
}

const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({ packageId, subPackageId, onCreated }) => {
  const [title, setTitle] = useState("");
  const [office, setOffice] = useState("");
  const [osNumber, setOsNumber] = useState("");
  const [tag, setTag] = useState("");
  const [machineName, setMachineName] = useState("");
  const [task, setTask] = useState("");
  const [responsible, setResponsible] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedTitle = useMemo(() => title || task, [task, title]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!normalizedTitle.trim()) {
      setError("Informe um título ou tarefa para o serviço.");
      return;
    }

    setLoading(true);
    try {
      const createdAt = Date.now();
      const baseData: WorkOrder = {
        title: normalizedTitle.trim(),
        packageId,
        subPackageId,
        status: "todo",
        progress: 0,
        office: office || null,
        osNumber: osNumber || null,
        tag: tag || null,
        machineName: machineName || null,
        task: task || normalizedTitle,
        responsible: responsible || null,
        createdAt: new Date(createdAt),
        updatedAt: new Date(createdAt),
        importOrder: createdAt,
      };

      const id = await WorkOrderService.create(baseData);
      onCreated?.({ ...baseData, id });
      setTitle("");
      setOffice("");
      setOsNumber("");
      setTag("");
      setMachineName("");
      setTask("");
      setResponsible("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar serviço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/5 bg-slate-900/70 p-4 shadow-inner shadow-emerald-500/5">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Novo serviço</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do serviço"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tarefa</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Descrição / Tarefa"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Oficina</label>
          <input
            type="text"
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            placeholder="Mecânico / Elétrico"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">O.S.</label>
          <input
            type="text"
            value={osNumber}
            onChange={(e) => setOsNumber(e.target.value)}
            placeholder="Número da O.S"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">TAG</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="TAG"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nome da máquina</label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            placeholder="Ex.: Bomba principal"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Responsável</label>
          <input
            type="text"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            placeholder="Nome do responsável"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-slate-400">Os campos seguem o padrão da importação via Excel.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60 sm:mt-6"
        >
          {loading ? "Adicionando..." : "Adicionar serviço"}
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</div>
      )}
    </form>
  );
};

export default AddWorkOrderForm;
