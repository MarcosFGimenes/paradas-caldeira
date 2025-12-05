"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("last-email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (email) {
      localStorage.setItem("last-email", email);
    }
  }, [email]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(
      "Autenticação não está configurada neste ambiente. Use o formulário apenas como referência visual."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr,0.95fr]">
          <div className="space-y-6 rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-2xl shadow-emerald-500/10">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wide text-emerald-200">Portal</p>
              <h1 className="text-2xl font-semibold text-white">Acessar painel</h1>
              <p className="text-sm text-slate-400">
                Entre para visualizar e criar pacotes, subpacotes e serviços.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                  placeholder="voce@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-slate-800 text-emerald-400 focus:ring-emerald-400"
                  />
                  Lembrar acesso
                </label>
                <button
                  type="button"
                  className="text-emerald-200 underline decoration-emerald-500/60 decoration-2 underline-offset-4 transition hover:text-emerald-100"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-emerald-500/80 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                Entrar
              </button>

              {message && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  {message}
                </div>
              )}
            </form>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 p-6 shadow-2xl shadow-emerald-500/20">
            <h3 className="text-lg font-semibold text-white">Vantagens</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Centralize pacotes e subpacotes com histórico de serviços.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Controle de etapas com status e datas previstas.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Importação rápida de dados via Excel.
              </li>
            </ul>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Primeiro acesso?</p>
              <p className="text-slate-300">
                Solicite a criação da sua conta ao administrador para liberar os módulos de cadastro.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
              <span className="font-semibold">Ambiente demo</span>
              <Link
                href="/packages"
                className="rounded-full border border-emerald-300/40 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50 transition hover:border-emerald-200/60"
              >
                Visualizar pacotes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
