"use client";

import React, { useState } from "react";
import { Package, PackageService } from "@/app/lib/firestore";

interface EditPackageModalProps {
  pkg: Package;
  onClose: () => void;
  onUpdated?: (pkg: Package) => void;
}

const EditPackageModal: React.FC<EditPackageModalProps> = ({ pkg, onClose, onUpdated }) => {
  const [name, setName] = useState(pkg.name || "");
  const [description, setDescription] = useState(pkg.description || "");
  const [status, setStatus] = useState<"open" | "closed">(pkg.status || "open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Informe um nome para o pacote.");
      return;
    }

    setLoading(true);
    try {
      await PackageService.update(pkg.id!, { name, description, status });
      onUpdated?.({ ...pkg, name, description, status });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar pacote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Editar pacote</p>
          <h2 className="text-xl font-semibold text-white">Atualizar informações</h2>
          <p className="text-sm text-slate-400">Ajuste o nome e a descrição do pacote.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-rose-400/60 hover:text-rose-100"
        >
          Fechar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Nome do pacote</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            placeholder="Ex.: Pacote hidráulico"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            placeholder="Descreva o objetivo do pacote"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "open" | "closed")}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          >
            <option value="open">Aberto</option>
            <option value="closed">Fechado</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</div>
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
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPackageModal;
