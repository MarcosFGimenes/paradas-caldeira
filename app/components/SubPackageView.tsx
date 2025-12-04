"use client";
import React, { useEffect, useState } from "react";
import { SubPackage, WorkOrder, WorkOrderService } from "@/app/lib/firestore";
import WorkOrderItem from "@/app/components/WorkOrderItem";

type Props = {
  subPackage: SubPackage;
};

export const SubPackageView: React.FC<Props> = ({ subPackage }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await WorkOrderService.listBySubPackage(subPackage.id || "");
        if (!mounted) return;
        setWorkOrders(list);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Erro ao carregar ordens");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [subPackage.id]);

  return (
    <div style={{ marginBottom: 16 }}>
      <h4>{subPackage.name}</h4>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Carregando ordens...</div>}
      {!loading && workOrders.length === 0 && <div>Nenhuma ordem neste subpacote</div>}
      <div>
        {workOrders.map((w) => (
          <WorkOrderItem key={w.id} workOrder={w} />
        ))}
      </div>
    </div>
  );
};

export default SubPackageView;
