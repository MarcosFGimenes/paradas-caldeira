"use client";
import { useEffect, useState, useCallback } from "react";
import {
  WorkOrder,
  WorkOrderService,
  PackageService,
  SubPackageService,
} from "@/app/lib/firestore";

export function useWorkOrderUpdate() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id: string, data: Partial<WorkOrder>) => {
    setLoading(true);
    try {
      await WorkOrderService.update(id, data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading };
}

export type WorkOrderFilters = {
  packageId?: string | null;
  subPackageId?: string | null;
  status?: string | null;
  search?: string | null;
};

export function useWorkOrderFilters(initial?: WorkOrderFilters) {
  const [filters, setFilters] = useState<WorkOrderFilters>(initial || {});

  const setFilter = (key: keyof WorkOrderFilters, value: any) => {
    setFilters((s) => ({ ...s, [key]: value }));
  };

  return { filters, setFilter, setFilters } as const;
}

export function useFilteredWorkOrders(filters: WorkOrderFilters) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        if (filters.subPackageId) {
          const list = await WorkOrderService.listBySubPackage(filters.subPackageId);
          if (!mounted) return;
          setWorkOrders(list.filter((w) => (filters.status ? w.status === filters.status : true)));
          return;
        }

        if (filters.packageId) {
          const list = await WorkOrderService.listByPackage(filters.packageId);
          if (!mounted) return;
          setWorkOrders(
            list.filter((w) => (filters.status ? w.status === filters.status : true)).filter((w) => {
              if (!filters.search) return true;
              return JSON.stringify(w).toLowerCase().includes(filters.search!.toLowerCase());
            })
          );
          return;
        }

        setWorkOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [filters.packageId, filters.subPackageId, filters.status, filters.search]);

  return { workOrders, loading } as const;
}
