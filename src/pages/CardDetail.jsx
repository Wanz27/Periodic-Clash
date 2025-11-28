// src/pages/CardDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { useToast } from "../components/ToastProvider";
import "../pages/CardDetail.css";

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [sharing, setSharing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("id", id).single();
      if (error) {
        console.error(error);
        return;
      }
      setCard(data);
    })();
  }, [id]);

  if (!card) return <div className="card-detail-page">Loading…</div>;

  // compute hp percent example (assume max HP 100 for visual)
  const hpPercent = Math.min(100, Math.round(((card.health ?? 0) / 100) * 100));

  // share handler: try Web Share API, fallback copy to clipboard
  async function handleShare() {
    const shareUrl = `${window.location.origin}/cards/${card.id}`;

    try {
      setSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: `Kartu: ${card.name}`,
          text: `${card.name} — ${card.rarity || "Common"} • HP ${card.health} • DMG ${card.damage}`,
          url: shareUrl,
        });
        toast.success("Berhasil dibagikan ✔️");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link kartu disalin ke clipboard 📋");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membagikan kartu ❌");
    } finally {
      setSharing(false);
    }
  }

  // navigate to edit page for this card
  function goToEdit() {
    // navigate to route that must render CardForm in edit mode
    navigate(`/cards/${card.id}/edit`);
  }

  return (
    <main className="card-detail-page">
      <div className="card-detail-panel">
        <div className="card-detail-media" role="img" aria-label={card.name}>
          <div className="card-symbol-badge">{card.symbol || "?"}</div>
          <img src={card.image_url || "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png"} alt={card.name} />
        </div>

        <div className="card-detail-body">
          <div className="card-head">
            <div className="card-title">
              <h1>{card.name}</h1>
              <div className="card-subtitle">({card.symbol})</div>
            </div>
            <div className="badge-rarity">{card.rarity || "Common"}</div>
          </div>

          <div className="stats-row">
            <div className="stat-pill">HP: {card.health ?? 0}</div>
            <div className="stat-pill">DMG: {card.damage ?? 0}</div>

            <div style={{ marginLeft: "auto", minWidth: 200 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>DIfficulty: Easy</div>
              <div className="stat-bar" aria-hidden="true">
                <div className="fill" style={{ width: `30%` }} />
              </div>
            </div>
          </div>

          <div className="card-desc">{card.description || "Tidak ada deskripsi tersedia."}</div>

          <div className="reaction-panel">
            <strong>Reaksi & Efek</strong>
            <div className="reaction-list">
              {Array.isArray(card.reactions) && card.reactions.length > 0 ? (
                card.reactions.map((r, i) => (
                  <div key={i} className="reaction-item">
                    <div style={{ fontWeight: 800 }}>{r.with} → {r.result}</div>
                    <div style={{ color: "rgba(255,255,255,0.85)" }}>{r.effect}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(255,255,255,0.85)" }}>Belum ada reaksi terdaftar.</div>
              )}
            </div>
          </div>

          <div className="power-panel">
            <strong>Power-ups</strong>
            <div className="power-list">
              {Array.isArray(card.powerups) && card.powerups.length > 0 ? (
                card.powerups.map((p, i) => (
                  <div key={i} className="power-item">
                    <div style={{ fontWeight: 800 }}>{p.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.85)" }}>{p.effect}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "rgba(255,255,255,0.85)" }}>Tidak ada power-up.</div>
              )}
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn-large ghost" onClick={() => navigate("/cards")}>Kembali</button>

            {/* Edit: langsung menuju ke form edit */}
            <button
              className="btn-large primary"
              onClick={goToEdit}
              title="Edit kartu"
            >
              Edit
            </button>

            {/* Share: Web Share API or copy to clipboard */}
            <button
              className="btn-large ghost"
              onClick={handleShare}
              disabled={sharing}
              title="Bagikan link kartu"
            >
              {sharing ? "Membagikan..." : "Bagikan"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
