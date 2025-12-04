"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PackageService, SubPackageService, Package as PackageType, SubPackage } from "@/app/lib/firestore";
import SubPackageView from "@/app/components/SubPackageView";

export default function PackagePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [pkg, setPkg] = useState<PackageType | null>(null);
  const [subpackages, setSubpackages] = useState<SubPackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const p = await PackageService.get(id);
        const subs = await SubPackageService.listByPackage(id);
        if (!mounted) return;
        setPkg(p);
        setSubpackages(subs);
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

  return (
    <div style={{ padding: 16 }}>
      {loading && <div>Carregando...</div>}
      {pkg && (
        <header>
          <h2>{pkg.name}</h2>
          {pkg.description && <p>{pkg.description}</p>}
        </header>
      )}

      <main>
        {subpackages.map((s) => (
          <SubPackageView key={s.id} subPackage={s} />
        ))}
      </main>
    </div>
  );
}
