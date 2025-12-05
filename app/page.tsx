"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <p className="text-sm text-slate-300">
        Redirecionando para a tela de login...
      </p>
    </div>
  );
}
