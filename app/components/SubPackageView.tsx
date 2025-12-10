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
  loading?: boolean;
  onLoadRequest?: () => void;
  onWorkOrderProgressChange?: (id: string, value: number, workOrder: WorkOrder) => void;
  onWorkOrderRemoved?: (id: string, subPackageId?: string | null) => void;
  onWorkOrderUpdated?: (workOrder: WorkOrder) => void;
  onWorkOrderCreated?: (workOrder: WorkOrder) => void;
  allowManage?: boolean;
  allowProgressUpdate?: boolean;
};

export const SubPackageView: React.FC<Props> = ({
  subPackage,
  workOrders,
  loading: loadingProp = false,
  onLoadRequest,
  onWorkOrderProgressChange,
  onWorkOrderRemoved,
  onWorkOrderUpdated,
  onWorkOrderCreated,
  allowManage = true,
  allowProgressUpdate = true,
}) => {
  const getOrderValue = (item: WorkOrder) => {
    if (typeof item.importOrder === "number") return item.importOrder;
    if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
    if (typeof item.createdAt === "number") return item.createdAt;
    if (item.createdAt instanceof Date) return item.createdAt.getTime();
    if (typeof item.createdAt === "string") {
      const parsed = Date.parse(item.createdAt);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return 0;
  };

  const sortWorkOrders = (list: WorkOrder[]) =>
    [...list].sort((a, b) => {
      const aOrder = getOrderValue(a);
      const bOrder = getOrderValue(b);
      if (aOrder === bOrder) return 0;
      return aOrder < bOrder ? -1 : 1;
    });

  const [workOrdersState, setWorkOrdersState] = useState<WorkOrder[]>(workOrders ? sortWorkOrders(workOrders) : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestedLoad, setRequestedLoad] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setRequestedLoad(false);
    setShowAddForm(false);
    setError(null);
  }, [subPackage.id]);

  useEffect(() => {
    if (workOrders) {
      setWorkOrdersState(sortWorkOrders(workOrders));
      setError(null);
      setLoading(false);
      return;
    }

    if (onLoadRequest) {
      if (!requestedLoad) {
        setRequestedLoad(true);
        setLoading(true);
        onLoadRequest();
      }
      return;
    }

    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await WorkOrderService.listBySubPackage(subPackage.id || "");
        if (!mounted) return;
        setWorkOrdersState(sortWorkOrders(list));
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
  }, [subPackage.id, workOrders, onLoadRequest, requestedLoad]);

  useEffect(() => {
    setLoading(loadingProp);
  }, [loadingProp]);

  const completed = useMemo(
    () => workOrdersState.filter((w) => w.status === "done").length,
    [workOrdersState]
  );

  const averageProgress = useMemo(() => {
    if (workOrdersState.length === 0) return 0;
    const total = workOrdersState.reduce((sum, w) => sum + (Number(w.progress) || 0), 0);
    return Math.round(total / workOrdersState.length);
  }, [workOrdersState]);

  const handleServiceCreated = (created: WorkOrder) => {
    setWorkOrdersState((prev) => sortWorkOrders([...prev, created]));
    onWorkOrderCreated?.(created);
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

      <div className="rounded-xl border border-dashed border-emerald-400/40 bg-emerald-400/5 p-4 text-sm text-emerald-100">
        Atualize o progresso digitando a porcentagem de cada serviço. Os valores são salvos automaticamente.
      </div>

      {allowManage ? (
        <div className="space-y-3">
          <button
            type="button"
            className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-500/10 transition hover:border-emerald-300 hover:text-emerald-100"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? "Fechar formulário" : "Adicionar novo serviço"}
          </button>
          {showAddForm && (
            <AddWorkOrderForm
              packageId={subPackage.packageId}
              subPackageId={subPackage.id || ""}
              onCreated={handleServiceCreated}
            />
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Faça login para adicionar novos serviços a este subpacote.
        </div>
      )}

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
                prev.map((item) =>
                  item.id === w.id ? { ...item, progress: value, updatedAt: new Date() } : item
                )
              );
              if (w.id) {
                onWorkOrderProgressChange?.(w.id, value, {
                  ...w,
                  progress: value,
                  updatedAt: new Date(),
                });
              }
            }}
            onDeleted={(id) => {
              setWorkOrdersState((prev) => prev.filter((item) => item.id !== id));
              onWorkOrderRemoved?.(id, w.subPackageId ?? subPackage.id);
            }}
            onUpdated={(updated) => {
              setWorkOrdersState((prev) =>
                prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
              );
              onWorkOrderUpdated?.(updated);
            }}
            allowManage={allowManage}
            allowProgressUpdate={allowProgressUpdate}
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
  allowManage?: boolean;
  allowProgressUpdate?: boolean;
};

const WorkOrderProgressRow: React.FC<WorkOrderProgressRowProps> = ({
  workOrder,
  onProgressUpdated,
  onDeleted,
  onUpdated,
  allowManage = true,
  allowProgressUpdate = true,
}) => {
  const { update } = useWorkOrderUpdate();
  const parseDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "object" && typeof value.toDate === "function") return value.toDate();
    if (typeof value === "object" && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatShortDateTime = (date: Date | null) => {
    if (!date) return "Sem registro";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month} ${hours}:${minutes}`;
  };

  const [lastSavedProgress, setLastSavedProgress] = useState<number>(Number(workOrder.progress) || 0);
  const [inputValue, setInputValue] = useState<string>(
    workOrder.progress !== undefined && workOrder.progress !== null ? String(workOrder.progress) : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(parseDate(workOrder.updatedAt));

  useEffect(() => {
    setInputValue(workOrder.progress !== undefined && workOrder.progress !== null ? String(workOrder.progress) : "");
    setLastSavedProgress(Number(workOrder.progress) || 0);
    setLastUpdatedAt(parseDate(workOrder.updatedAt));
  }, [workOrder.progress, workOrder.updatedAt]);

  useEffect(() => {
    if (!allowProgressUpdate) return;
    if (!workOrder.id) return;
    if (!inputValue.trim()) return;

    const numericValue = Number(inputValue);
    if (!Number.isFinite(numericValue)) return;

    const current = Number(workOrder.progress) || 0;
    const normalized = Math.max(0, Math.min(100, Math.round(numericValue)));
    if (normalized === current) return;

    const handler = setTimeout(async () => {
      setSaving(true);
      setSaveError(null);
      try {
        await update(workOrder.id!, { progress: normalized });
        setLastSavedProgress(normalized);
        setLastUpdatedAt(new Date());
        onProgressUpdated?.(normalized);
      } catch (err) {
        console.error(err);
        setSaveError("Erro ao salvar. Tente novamente.");
      } finally {
        setSaving(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [allowProgressUpdate, inputValue, update, workOrder.id, workOrder.progress, onProgressUpdated]);

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
          Anterior: {lastSavedProgress}%
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
          onChange={
            allowProgressUpdate
              ? (e) => {
                  const nextValue = e.target.value
                    .replace(/[^0-9]/g, "")
                    .replace(/^0+(?=\d)/, "");
                  setInputValue(nextValue);
                  setSaveError(null);
                }
              : undefined
          }
          className="w-28 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
          placeholder="0"
          disabled={!allowProgressUpdate}
        />
        {saving ? (
          <span className="text-xs text-slate-400">Salvando...</span>
        ) : saveError ? (
          <span className="text-xs text-rose-300">{saveError}</span>
        ) : (
          <span className="text-xs text-emerald-300">Salvo automaticamente</span>
        )}
      </div>
      <p className="text-xs text-slate-400">Última atualização: {formatShortDateTime(lastUpdatedAt)}</p>
      {allowManage && (
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
                await WorkOrderService.removeWithLogs(workOrder.id);
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
      )}

      {allowManage && showEdit && (
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

export default SubPackageView;
