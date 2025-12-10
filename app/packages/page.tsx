"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import PackageList from "@/app/components/PackageList";
import ImportExcelModal from "@/app/components/ImportExcelModal";
import AddPackageModal from "@/app/components/AddPackageModal";
import EditPackageModal from "@/app/components/EditPackageModal";
import { ensureAuth } from "@/app/lib/firebase";
import { Package } from "@/app/lib/firestore";

export default function PackagesPage() {
  const [showImport, setShowImport] = useState(false);
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const auth = ensureAuth();
      setAuthorized(!!auth.currentUser);
      setAuthChecked(true);

      unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthorized(!!user);
        setAuthChecked(true);
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível verificar a autenticação.";
      setAuthError(message);
      setAuthChecked(true);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handlePackageCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handlePackageUpdated = (pkg: Package) => {
    setEditingPackage(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Pacotes</p>
            <h1 className="text-2xl font-semibold text-white">Todos os pacotes</h1>
            <p className="text-sm text-slate-400">Acesse e organize todos os pacotes cadastrados.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-200 underline decoration-emerald-500/60 decoration-2 underline-offset-4 transition hover:text-emerald-100"
            >
              Voltar para início
            </Link>
            {authorized ? (
              <>
                <button
                  type="button"
                  className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-500/10 transition hover:border-emerald-300 hover:text-emerald-100"
                  onClick={() => setShowNewPackage(true)}
                >
                  Adicionar pacote
                </button>
                <button
                  type="button"
                  className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-500/10 transition hover:border-emerald-300 hover:text-emerald-100"
                  onClick={() => setShowImport(true)}
                >
                  Importar Excel
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-100"
              >
                Entrar para gerenciar
              </Link>
            )}
          </div>
        </header>

        {authError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {authError}
          </div>
        )}

        {!authChecked ? (
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-200 shadow-2xl shadow-emerald-500/5">
            Verificando autenticação...
          </div>
        ) : authorized ? (
          <main className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-2xl shadow-emerald-500/5 sm:p-6">
            <PackageList
              refreshKey={refreshKey}
              onEdit={(pkg) => setEditingPackage(pkg)}
              onDeleted={() => setRefreshKey((prev) => prev + 1)}
              allowManage
            />
          </main>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-6 text-slate-200 shadow-2xl shadow-emerald-500/5">
            <p className="text-lg font-semibold text-white">Acesso restrito</p>
            <p className="text-sm text-slate-300">
              Faça login para visualizar e gerenciar pacotes. O catálogo público continua disponível na página inicial.
            </p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-lg shadow-emerald-500/10 transition hover:border-emerald-300 hover:text-white"
              >
                Ir para login
              </Link>
            </div>
          </div>
        )}
      </div>

      {authorized && (showImport || showNewPackage) && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/60 p-4 backdrop-blur-md">
          {showImport && (
            <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl">
              <ImportExcelModal onClose={() => setShowImport(false)} />
            </div>
          )}
          {showNewPackage && (
            <div className="w-full max-w-3xl">
              <AddPackageModal
                onClose={() => setShowNewPackage(false)}
                onCreated={handlePackageCreated}
              />
            </div>
          )}
        </div>
      )}

      {authorized && editingPackage && (
        <div className="fixed inset-0 z-10 grid place-items-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl">
            <EditPackageModal
              pkg={editingPackage}
              onClose={() => setEditingPackage(null)}
              onUpdated={handlePackageUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
