"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PackageService, Package as PackageType } from "@/app/lib/firestore";

type PackageListProps = {
  refreshKey?: number;
  onEdit?: (pkg: PackageType) => void;
  onDeleted?: () => void;
  allowManage?: boolean;
};

export const PackageList: React.FC<PackageListProps> = ({
  refreshKey,
  onEdit,
  onDeleted,
  allowManage = true,
}) => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await PackageService.list();
        if (!mounted) return;
        setPackages(list);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Erro ao buscar pacotes");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      const aTime = a.createdAt?.seconds || a.createdAt?._seconds || 0;
      const bTime = b.createdAt?.seconds || b.createdAt?._seconds || 0;
      return bTime - aTime;
    });
  }, [packages]);

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Carregando pacotes...
        </div>
      )}
      {!loading && packages.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400">
          Nenhum pacote cadastrado ainda.
        </div>
      )}

      <ul className="space-y-3">
        {sortedPackages.map((p) => (
          <li key={p.id}>
            <Link
              href={`/packages/${p.id}`}
              className="group block rounded-xl border border-white/5 bg-gradient-to-r from-slate-900/80 to-slate-900/40 px-4 py-3 shadow-lg shadow-emerald-500/5 transition hover:border-emerald-300/40 hover:shadow-emerald-500/15"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">{p.name}</p>
                  <p className="text-sm text-slate-400">
                    {p.description || "Pacote sem descrição disponível."}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  Aberto
                </span>
              </div>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                Link direto
              </span>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100"
                onClick={async () => {
                  const url = `${origin || (typeof window !== "undefined" ? window.location.origin : "")}/packages/${p.id}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    setCopiedId(p.id || null);
                    setTimeout(() => setCopiedId(null), 2000);
                  } catch (err) {
                    console.error("Erro ao copiar link", err);
                  }
                }}
              >
                {copiedId === p.id ? "Link copiado" : urlDisplayText(origin, p.id)}
              </button>
              {allowManage && (
                <>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 font-semibold text-amber-200 transition hover:border-amber-300/60 hover:text-amber-100"
                    onClick={() => onEdit?.(p)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 font-semibold text-rose-200 transition hover:border-rose-300/60 hover:text-rose-100 disabled:opacity-60"
                    disabled={removingId === p.id}
                    onClick={async () => {
                      if (!p.id) return;
                      const confirmed = window.confirm(
                        `Deseja excluir o pacote "${p.name}"? Essa ação remove apenas o pacote, mantendo os subpacotes e serviços associados para revisão manual.`
                      );
                      if (!confirmed) return;
                      setRemovingId(p.id);
                      try {
                        await PackageService.remove(p.id);
                        setPackages((prev) => prev.filter((pkg) => pkg.id !== p.id));
                        onDeleted?.();
                      } catch (err) {
                        console.error(err);
                        setError(
                          err instanceof Error ? err.message : "Erro ao excluir o pacote."
                        );
                      } finally {
                        setRemovingId(null);
                      }
                    }}
                  >
                    {removingId === p.id ? "Excluindo..." : "Excluir"}
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

function urlDisplayText(origin: string, id?: string) {
  const base = origin || "URL";
  return `${base}/packages/${id ?? ""}`;
}

export default PackageList;
