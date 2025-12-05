"use client";

import React, { useState } from "react";
import { WorkOrderService } from "@/app/lib/firestore";

interface AddWorkOrderFormProps {
  packageId: string;
  subPackageId: string;
  onCreated?: (id: string, title: string) => void;
}

const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({ packageId, subPackageId, onCreated }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Informe um título para o serviço.");
      return;
    }

    setLoading(true);
    try {
      const id = await WorkOrderService.create({
        title,
        packageId,
        subPackageId,
        status: "todo",
        progress: 0,
      });
      onCreated?.(id, title);
      setTitle("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar serviço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/5 bg-slate-900/70 p-4 shadow-inner shadow-emerald-500/5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Novo serviço</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Instalação de quadro elétrico"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          />
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
