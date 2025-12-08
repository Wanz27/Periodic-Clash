// src/pages/Result.jsx
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../pages/Arena.css"; // pakai styling yang ada, atau gunakan file css lain jika perlu

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // reliably parse "outcome" query param
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const outcome = useMemo(() => {
    const o = (params.get("outcome") || "").toLowerCase();
    if (o === "win" || o === "lose") return o;
    return null;
  }, [params]);

  // If outcome missing or unknown, show neutral message and route back to games after small delay
  useEffect(() => {
    if (!outcome) {
      const t = setTimeout(() => navigate("/games", { replace: true }), 1800);
      return () => clearTimeout(t);
    }
  }, [outcome, navigate]);

  if (!outcome) {
    return (
      <main className="arena-root" style={{ padding: 48 }}>
        <div className="arena-container">
          <div style={{ color: "white", textAlign: "center" }}>
            <h1 className="arena-title">Result</h1>
            <p className="arena-sub">Hasil tidak ditemukan. Mengembalikan ke daftar game...</p>
          </div>
        </div>
      </main>
    );
  }

  const isWin = outcome === "win";

  return (
    <main className="arena-root" style={{ padding: 48 }}>
      <div className="arena-container" style={{ maxWidth: 720, textAlign: "center" }}>
        <h1 className="arena-title" style={{ marginBottom: 8 }}>{isWin ? "Victory!" : "Defeat"}</h1>
        <div style={{ color: "rgba(255,255,255,0.85)", marginBottom: 18 }}>
          {isWin ? "Selamat! Boss berhasil dikalahkan." : "Semua kartu pemain gugur. Coba lagi!"}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
          <button className="btn primary" onClick={() => navigate("/games", { replace: true })}>Kembali ke Games</button>
          <button className="btn ghost" onClick={() => navigate("/", { replace: true })}>Ke Beranda</button>
        </div>

        <div style={{ color: "var(--muted-200)" }}>
          <small>Outcome: <strong>{outcome}</strong></small>
        </div>
      </div>
    </main>
  );
}
