"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  PackageService,
  SubPackageService,
  WorkOrderService,
  Package as PackageType,
  SubPackage,
  WorkOrder,
} from "@/app/lib/firestore";
import SubPackageView from "@/app/components/SubPackageView";

export default function PackagePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [pkg, setPkg] = useState<PackageType | null>(null);
  const [subpackages, setSubpackages] = useState<
    { subPackage: SubPackage; workOrders: WorkOrder[] }[]
  >([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const p = await PackageService.get(id);
        const subs = await SubPackageService.listByPackage(id);
        const subsWithOrders = await Promise.all(
          subs.map(async (s) => {
            const workOrders = s.id ? await WorkOrderService.listBySubPackage(s.id) : [];
            return { subPackage: s, workOrders };
          })
        );
        if (!mounted) return;
        setPkg(p);
        setSubpackages(subsWithOrders);
        setSelectedSubId((prev) => prev || subsWithOrders[0]?.subPackage.id || null);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar pacote");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) return <div>ID de pacote não fornecido</div>;

  const selectedSubPackage = useMemo(
    () => subpackages.find((s) => s.subPackage.id === selectedSubId),
    [selectedSubId, subpackages]
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
        {pkg && (
          <header className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-emerald-500/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">Pacote</p>
                <h1 className="text-2xl font-semibold text-white">{pkg.name}</h1>
                {pkg.description && <p className="text-sm text-slate-400">{pkg.description}</p>}
              </div>
              <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                Aberto
              </span>
            </div>
          </header>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
        )}
        {loading && (
          <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">Carregando...</div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <section className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-emerald-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Lista de subpacotes</p>
                <h3 className="text-lg font-semibold text-white">Organize por empresa/etapa</h3>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                {subpackages.length} itens
              </span>
            </div>

            <div className="space-y-3">
              {subpackages.map(({ subPackage, workOrders }) => {
                const total = workOrders.length;
                const done = workOrders.filter((w) => w.status === "done").length;
                const selected = selectedSubId === subPackage.id;

                return (
                  <button
                    key={subPackage.id}
                    type="button"
                    onClick={() => setSelectedSubId(subPackage.id || null)}
                    className={`w-full text-left transition ${
                      selected
                        ? "border-emerald-400/60 bg-emerald-400/10 shadow-lg shadow-emerald-500/15"
                        : "border-white/5 bg-white/5 hover:border-emerald-300/40"
                    } rounded-xl border px-4 py-3`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Processos: {total}</p>
                        <p className="text-base font-semibold text-white">{subPackage.name}</p>
                        <p className="text-xs text-slate-400">Realizados: {done}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900 px-3 py-2 text-right">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">Entrega prevista</p>
                        <p className="text-sm font-semibold text-white">-</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!loading && subpackages.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400">
                  Nenhum subpacote cadastrado.
                </div>
              )}
            </div>
          </section>

          <section>
            {selectedSubPackage ? (
              <SubPackageView
                subPackage={selectedSubPackage.subPackage}
                workOrders={selectedSubPackage.workOrders}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400">
                Selecione um subpacote para visualizar os serviços disponíveis.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
