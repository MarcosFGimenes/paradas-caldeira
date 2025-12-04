"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PackageService, Package as PackageType } from "@/app/lib/firestore";

export const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await PackageService.list();
        if (!mounted) return;
        setPackages(list);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h3>Pacotes</h3>
      {loading && <div>Carregando pacotes...</div>}
      {!loading && packages.length === 0 && <div>Nenhum pacote</div>}
      <ul>
        {packages.map((p) => (
          <li key={p.id}>
            <Link href={`/packages/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PackageList;
