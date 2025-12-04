"use client";
import React from "react";
import { WorkOrder } from "@/app/lib/firestore";
import { useWorkOrderUpdate } from "@/app/hooks/useWorkOrder";

type Props = {
  workOrder: WorkOrder;
};

export const WorkOrderItem: React.FC<Props> = ({ workOrder }) => {
  const { update, loading } = useWorkOrderUpdate();

  const toggleStatus = async () => {
    const next = workOrder.status === "done" ? "pending" : "done";
    if (!workOrder.id) return;
    await update(workOrder.id, { status: next });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>{workOrder.title}</strong>
          <div style={{ fontSize: 12, color: "#666" }}>{workOrder.id}</div>
        </div>
        <div>
          <span style={{ marginRight: 8 }}>{workOrder.status || "pending"}</span>
          <button onClick={toggleStatus} disabled={loading}>
            {workOrder.status === "done" ? "Reabrir" : "Concluir"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderItem;
