"use client";
import React, { useEffect, useState } from "react";
import { WorkOrder } from "@/app/lib/firestore";
import { useWorkOrderUpdate } from "@/app/hooks/useWorkOrder";

type Props = {
  workOrder: WorkOrder;
};

export const WorkOrderItem: React.FC<Props> = ({ workOrder }) => {
  const { update, loading } = useWorkOrderUpdate();
  const [status, setStatus] = useState<string>(workOrder.status || "pending");
  const progressValue = Number.isFinite(Number(workOrder.progress))
    ? Number(workOrder.progress)
    : 0;

  useEffect(() => {
    setStatus(workOrder.status || "pending");
  }, [workOrder.status]);

  const toggleStatus = async () => {
    const next = status === "done" ? "pending" : "done";
    if (!workOrder.id) return;
    setStatus(next);
    await update(workOrder.id, { status: next });
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 shadow-sm shadow-emerald-500/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-200">O.S: {workOrder.osNumber ?? "-"}</p>
          <p className="text-base font-semibold text-white">{workOrder.machineName || "Sem máquina"}</p>
          <p className="text-sm text-slate-300">Responsável: {workOrder.responsible || "Não informado"}</p>
          <p className="text-sm text-slate-400">{workOrder.task || workOrder.title}</p>
          <p className="text-sm font-semibold text-emerald-200">Progresso: {progressValue}%</p>
          <p className="text-xs text-slate-500">ID: {workOrder.id}</p>
        </div>
        <div className="flex items-start gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              status === "done"
                ? "bg-emerald-500/10 text-emerald-200"
                : "bg-amber-500/10 text-amber-200"
            }`}
          >
            {status === "done" ? "Concluído" : "Pendente"}
          </span>
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100 disabled:opacity-60"
            onClick={toggleStatus}
            disabled={loading}
          >
            {status === "done" ? "Reabrir" : "Concluir"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderItem;
