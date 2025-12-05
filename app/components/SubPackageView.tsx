"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { SubPackage, WorkOrder, WorkOrderService } from "@/app/lib/firestore";
import AddWorkOrderForm from "@/app/components/AddWorkOrderForm";
import { useWorkOrderUpdate } from "@/app/hooks/useWorkOrder";

type Props = {
  subPackage: SubPackage;
  workOrders?: WorkOrder[];
  onWorkOrderProgressChange?: (id: string, value: number) => void;
};

export const SubPackageView: React.FC<Props> = ({
  subPackage,
  workOrders,
  onWorkOrderProgressChange,
}) => {
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

  const averageProgress = useMemo(() => {
    if (workOrdersState.length === 0) return 0;
    const total = workOrdersState.reduce((sum, w) => sum + (Number(w.progress) || 0), 0);
    return Math.round(total / workOrdersState.length);
  }, [workOrdersState]);

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
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Aberto
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            Serviços: {workOrdersState.length}
          </span>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Progresso médio: {averageProgress}%
          </span>
          <Link
            href="/packages"
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
          >
            Voltar para o menu
          </Link>
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

      <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-400/5 p-4 text-sm text-emerald-100">
        Atualize o progresso digitando a porcentagem de cada serviço. Os valores são salvos automaticamente.
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
          <WorkOrderProgressRow
            key={w.id}
            workOrder={w}
            onProgressUpdated={(value) => {
              setWorkOrdersState((prev) =>
                prev.map((item) => (item.id === w.id ? { ...item, progress: value } : item))
              );
              if (w.id) {
                onWorkOrderProgressChange?.(w.id, value);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

type WorkOrderProgressRowProps = {
  workOrder: WorkOrder;
  onProgressUpdated?: (value: number) => void;
};

const WorkOrderProgressRow: React.FC<WorkOrderProgressRowProps> = ({ workOrder, onProgressUpdated }) => {
  const { update } = useWorkOrderUpdate();
  const [progress, setProgress] = useState<number>(Number(workOrder.progress) || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProgress(Number(workOrder.progress) || 0);
  }, [workOrder.progress]);

  useEffect(() => {
    if (!workOrder.id) return;
    const current = Number(workOrder.progress) || 0;
    if (progress === current) return;
    const handler = setTimeout(async () => {
      setSaving(true);
      const normalized = Number.isFinite(progress) ? Math.max(0, Math.min(100, Math.round(progress))) : 0;
      await update(workOrder.id!, { progress: normalized });
      onProgressUpdated?.(normalized);
      setSaving(false);
    }, 600);

    return () => clearTimeout(handler);
  }, [progress, update, workOrder.id, onProgressUpdated]);

  return (
    <div className="space-y-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 shadow-sm shadow-emerald-500/5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-emerald-200">O.S: {workOrder.osNumber ?? "-"}</p>
        <p className="text-base font-semibold text-white">{workOrder.machineName || "Sem máquina"}</p>
        <p className="text-sm text-slate-300">Responsável: {workOrder.responsible || "Não informado"}</p>
        <p className="text-sm text-slate-400">{workOrder.task || workOrder.title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-200">Progresso (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-28 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
        />
        {saving ? (
          <span className="text-xs text-slate-400">Salvando...</span>
        ) : (
          <span className="text-xs text-emerald-300">Salvo automaticamente</span>
        )}
      </div>
    </div>
  );
};

export default SubPackageView;
