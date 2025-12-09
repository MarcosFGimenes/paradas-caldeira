"use client";

import Link from "next/link";
import PackageList from "@/app/components/PackageList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6 shadow-2xl shadow-emerald-500/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-200">Visão geral</p>
              <h1 className="text-3xl font-semibold text-white">Pacotes disponíveis</h1>
              <p className="text-sm text-slate-300">
                Visualize rapidamente os pacotes cadastrados sem precisar de login. Entre no painel apenas se precisar criar ou editar.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-100 shadow-lg shadow-emerald-500/10 transition hover:border-emerald-300 hover:text-white"
            >
              Entrar para gerenciar
            </Link>
          </div>
        </header>

        <main className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-2xl shadow-emerald-500/10 sm:p-6">
          <PackageList allowManage={false} />
        </main>
      </div>
    </div>
  );
}
