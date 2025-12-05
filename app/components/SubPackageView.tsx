"use client";
import React, { useEffect, useMemo, useState } from "react";
import { SubPackage, WorkOrder, WorkOrderService } from "@/app/lib/firestore";
import WorkOrderItem from "@/app/components/WorkOrderItem";
import AddWorkOrderForm from "@/app/components/AddWorkOrderForm";

type Props = {
  subPackage: SubPackage;
  workOrders?: WorkOrder[];
};

export const SubPackageView: React.FC<Props> = ({ subPackage, workOrders }) => {
  const [workOrdersState, setWorkOrdersState] = useState<WorkOrder[]>(workOrders || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workOrders) {
      setWorkOrdersState(workOrders);
      setError(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await WorkOrderService.listBySubPackage(subPackage.id || "");
        if (!mounted) return;
        setWorkOrdersState(list);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar ordens");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [subPackage.id, workOrders]);

  const completed = useMemo(
    () => workOrdersState.filter((w) => w.status === "done").length,
    [workOrdersState]
  );

  const handleServiceCreated = (id: string, title: string) => {
    setWorkOrdersState((prev) => [
      ...prev,
      {
        id,
        title,
        packageId: subPackage.packageId,
        subPackageId: subPackage.id,
        status: "todo",
      },
    ]);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-emerald-500/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Subpacote</p>
          <h3 className="text-xl font-semibold text-white">{subPackage.name}</h3>
          {subPackage.description && (
            <p className="text-sm text-slate-400">{subPackage.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Aberto
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            Serviços: {workOrdersState.length}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Processos</p>
          <p className="text-lg font-semibold text-white">{workOrdersState.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Realizados</p>
          <p className="text-lg font-semibold text-white">{completed}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Entrega prevista</p>
          <p className="text-lg font-semibold text-white">-</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
        >
          Copiar link
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
        >
          Redacionar token
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
        >
          Editar dados
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-400/5 p-4 text-sm text-emerald-100">
        Selecione serviços disponíveis para este subpacote.
      </div>

      <AddWorkOrderForm
        packageId={subPackage.packageId}
        subPackageId={subPackage.id || ""}
        onCreated={handleServiceCreated}
      />

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      )}
      {loading && (
        <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Carregando ordens...
        </div>
      )}
      {!loading && workOrdersState.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400">
          Nenhuma ordem neste subpacote.
        </div>
      )}
      <div className="space-y-3">
        {workOrdersState.map((w) => (
          <WorkOrderItem key={w.id} workOrder={w} />
        ))}
      </div>
    </div>
  );
};

export default SubPackageView;
