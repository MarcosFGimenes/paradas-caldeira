"use client";

import React, { useState } from "react";
import Link from "next/link";
import PackageList from "@/app/components/PackageList";
import ImportExcelModal from "@/app/components/ImportExcelModal";
import AddPackageModal from "@/app/components/AddPackageModal";
import EditPackageModal from "@/app/components/EditPackageModal";
import { Package } from "@/app/lib/firestore";

export default function PackagesPage() {
  const [showImport, setShowImport] = useState(false);
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

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
          </div>
        </header>

        <main className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-2xl shadow-emerald-500/5 sm:p-6">
          <PackageList
            refreshKey={refreshKey}
            onEdit={(pkg) => setEditingPackage(pkg)}
            onDeleted={() => setRefreshKey((prev) => prev + 1)}
            allowManage
          />
        </main>
      </div>

      {(showImport || showNewPackage) && (
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

      {editingPackage && (
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
