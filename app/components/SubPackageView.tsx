"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { SubPackage, WorkOrder, WorkOrderService } from "@/app/lib/firestore";
import AddWorkOrderForm from "@/app/components/AddWorkOrderForm";
import { useWorkOrderUpdate } from "@/app/hooks/useWorkOrder";
import EditWorkOrderModal from "@/app/components/EditWorkOrderModal";

type Props = {
  subPackage: SubPackage;
  workOrders?: WorkOrder[];
  onWorkOrderProgressChange?: (id: string, value: number) => void;
  onWorkOrderRemoved?: (id: string) => void;
  onWorkOrderUpdated?: (workOrder: WorkOrder) => void;
};

export const SubPackageView: React.FC<Props> = ({
  subPackage,
  workOrders,
  onWorkOrderProgressChange,
  onWorkOrderRemoved,
  onWorkOrderUpdated,
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Processos</p>
          <p className="text-lg font-semibold text-white">{workOrdersState.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Realizados</p>
          <p className="text-lg font-semibold text-white">{completed}</p>
        </div>
      </div>

      <ServiceProgressChart workOrders={workOrdersState} />

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
            onDeleted={(id) => {
              setWorkOrdersState((prev) => prev.filter((item) => item.id !== id));
              onWorkOrderRemoved?.(id);
            }}
            onUpdated={(updated) => {
              setWorkOrdersState((prev) =>
                prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
              );
              onWorkOrderUpdated?.(updated);
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
  onDeleted?: (id: string) => void;
  onUpdated?: (workOrder: WorkOrder) => void;
};

const WorkOrderProgressRow: React.FC<WorkOrderProgressRowProps> = ({
  workOrder,
  onProgressUpdated,
  onDeleted,
  onUpdated,
}) => {
  const { update } = useWorkOrderUpdate();
  const [inputValue, setInputValue] = useState<string>(
    workOrder.progress !== undefined && workOrder.progress !== null ? String(workOrder.progress) : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    setInputValue(workOrder.progress !== undefined && workOrder.progress !== null ? String(workOrder.progress) : "");
  }, [workOrder.progress]);

  useEffect(() => {
    if (!workOrder.id) return;
    if (!inputValue.trim()) return;

    const numericValue = Number(inputValue);
    if (!Number.isFinite(numericValue)) return;

    const current = Number(workOrder.progress) || 0;
    const normalized = Math.max(0, Math.min(100, Math.round(numericValue)));
    if (normalized === current) return;

    const handler = setTimeout(async () => {
      setSaving(true);
      await update(workOrder.id!, { progress: normalized });
      onProgressUpdated?.(normalized);
      setSaving(false);
    }, 600);

    return () => clearTimeout(handler);
  }, [inputValue, update, workOrder.id, workOrder.progress, onProgressUpdated]);

  return (
    <div className="space-y-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 shadow-sm shadow-emerald-500/5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-emerald-200">O.S: {workOrder.osNumber ?? "-"}</p>
        <p className="text-base font-semibold text-white">{workOrder.machineName || "Sem máquina"}</p>
        <p className="text-sm text-slate-300">Responsável: {workOrder.responsible || "Não informado"}</p>
        <p className="text-sm text-slate-400">{workOrder.task || workOrder.title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
          Anterior: {Number(workOrder.progress) || 0}%
        </span>
        <label className="text-sm font-semibold text-slate-200" htmlFor={`progress-${workOrder.id}`}>
          Progresso (%)
        </label>
        <input
          id={`progress-${workOrder.id}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => {
            const nextValue = e.target.value
              .replace(/[^0-9]/g, "")
              .replace(/^0+(?=\d)/, "");
            setInputValue(nextValue);
          }}
          className="w-28 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          placeholder="0"
        />
        {saving ? (
          <span className="text-xs text-slate-400">Salvando...</span>
        ) : (
          <span className="text-xs text-emerald-300">Salvo automaticamente</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-300/60 hover:text-amber-100"
          onClick={() => setShowEdit(true)}
        >
          Editar serviço
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-300/60 hover:text-rose-100 disabled:opacity-60"
          disabled={deleting}
          onClick={async () => {
            if (!workOrder.id) return;
            const confirmed = window.confirm("Deseja excluir este serviço?");
            if (!confirmed) return;
            setDeleting(true);
            try {
              await WorkOrderService.remove(workOrder.id);
              onDeleted?.(workOrder.id);
            } catch (err) {
              console.error(err);
            } finally {
              setDeleting(false);
            }
          }}
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 p-4 backdrop-blur">
          <div className="w-full max-w-3xl">
            <EditWorkOrderModal
              workOrder={workOrder}
              onClose={() => setShowEdit(false)}
              onUpdated={(updated) => {
                onUpdated?.(updated);
                setShowEdit(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

type ServiceProgressChartProps = {
  workOrders: WorkOrder[];
};

const buildPath = (values: number[]) => {
  if (values.length === 0) return "";
  const maxIndex = Math.max(values.length - 1, 1);
  const commands = values.map((val, idx) => {
    const x = (idx / maxIndex) * 100;
    const y = 100 - Math.min(100, Math.max(0, val));
    return `${idx === 0 ? "M" : "L"} ${x},${y}`;
  });
  return commands.join(" ");
};

const ServiceProgressChart: React.FC<ServiceProgressChartProps> = ({ workOrders }) => {
  const normalized = workOrders.map((w, idx) => ({
    label: w.title || w.task || `Serviço ${idx + 1}`,
    progress: Math.min(100, Math.max(0, Number(w.progress) || 0)),
  }));

  const planned = normalized.map((_, idx) => {
    const maxIndex = Math.max(normalized.length - 1, 1);
    return Math.round((idx / maxIndex) * 100);
  });

  const realized = normalized.map((item) => item.progress);
  const average = realized.length
    ? Math.round(realized.reduce((sum, val) => sum + val, 0) / realized.length)
    : 0;
  const maxProgress = realized.length ? Math.max(...realized) : 0;
  const minProgress = realized.length ? Math.min(...realized) : 0;

  if (normalized.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400">
        Adicione serviços para visualizar o progresso planejado x realizado.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 shadow-inner shadow-emerald-500/5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Curva do serviço</p>
          <h4 className="text-lg font-semibold text-white">Evolução planejada versus realizada</h4>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/60">
            <svg viewBox="0 0 100 100" className="h-64 w-full">
              <defs>
                <linearGradient id="planned" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(94,234,212,0.15)" />
                  <stop offset="100%" stopColor="rgba(94,234,212,0.0)" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.02)" />
              <path
                d={buildPath(planned)}
                fill="none"
                strokeDasharray="4 4"
                strokeWidth="2"
                stroke="rgba(94,234,212,0.7)"
              />
              <path
                d={buildPath(realized)}
                fill="none"
                strokeWidth="2.75"
                stroke="rgb(249,115,22)"
              />
              {realized.map((value, idx) => {
                const maxIndex = Math.max(realized.length - 1, 1);
                const cx = (idx / maxIndex) * 100;
                const cy = 100 - value;
                return (
                  <circle key={idx} cx={cx} cy={cy} r={1.5} fill="rgb(249,115,22)" />
                );
              })}
            </svg>
          </div>
        </div>

        <div className="flex w-full flex-row justify-end gap-3 lg:w-56 lg:flex-col">
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Realizado</p>
              <p className="text-sm font-semibold">{average}% médio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Planejado</p>
              <p className="text-sm font-semibold">0% → 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-sky-300" />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Máx / Mín</p>
              <p className="text-sm font-semibold">{maxProgress}% / {minProgress}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubPackageView;
