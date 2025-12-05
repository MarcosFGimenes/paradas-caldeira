"use client";

import React, { useState } from "react";
import { WorkOrder, WorkOrderService } from "@/app/lib/firestore";

interface EditWorkOrderModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
  onUpdated?: (workOrder: WorkOrder) => void;
}

const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({ workOrder, onClose, onUpdated }) => {
  const [osNumber, setOsNumber] = useState(workOrder.osNumber?.toString() || "");
  const [tag, setTag] = useState(workOrder.tag?.toString() || "");
  const [machineName, setMachineName] = useState(workOrder.machineName || "");
  const [task, setTask] = useState(workOrder.task || workOrder.title || "");
  const [responsible, setResponsible] = useState(workOrder.responsible || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await WorkOrderService.update(workOrder.id!, {
        osNumber: osNumber || null,
        tag: tag || null,
        machineName: machineName || null,
        task: task || workOrder.title,
        responsible: responsible || null,
        title: task || workOrder.title,
      });
      onUpdated?.({
        ...workOrder,
        osNumber: osNumber || null,
        tag: tag || null,
        machineName: machineName || null,
        task: task || workOrder.title,
        responsible: responsible || null,
        title: task || workOrder.title,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar serviço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Editar serviço</p>
          <h2 className="text-xl font-semibold text-white">Atualizar informações do serviço</h2>
          <p className="text-sm text-slate-400">Ajuste os dados exibidos na lista e no detalhamento.</p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">O.S</label>
            <input
              type="text"
              value={osNumber}
              onChange={(e) => setOsNumber(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
              placeholder="Número da OS"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">TAG</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
              placeholder="TAG"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Máquina</label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            placeholder="Nome da máquina"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Tarefa/Serviço</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            placeholder="Descrição da tarefa"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Responsável</label>
          <input
            type="text"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
            placeholder="Nome do responsável"
          />
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

export default EditWorkOrderModal;
