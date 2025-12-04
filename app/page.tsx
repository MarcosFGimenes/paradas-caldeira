"use client";

import React, { useState } from "react";
import PackageList from "@/app/components/PackageList";
import ImportExcelModal from "@/app/components/ImportExcelModal";

export default function Home() {
  const [showImport, setShowImport] = useState(false);

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Paradas Caldeira</h1>
        <div>
          <button onClick={() => setShowImport(true)}>Importar Excel</button>
        </div>
      </header>

      <main style={{ marginTop: 16 }}>
        <PackageList />
      </main>

      {showImport && (
        <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ width: 640, maxWidth: "95%" }}>
            <ImportExcelModal onClose={() => setShowImport(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
