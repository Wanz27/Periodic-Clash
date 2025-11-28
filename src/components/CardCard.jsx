// src/components/CardCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function CardCard({ card, onDelete, onEdit }) {
  const img = card.image_url || "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png"; // placeholder lokal

  return (
    <article className="card" role="article" aria-label={`Card ${card.name}`}>
      <Link to={`/cards/${card.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card-media" aria-hidden="true">
          <img src={img} alt={card.name} />
        </div>
      </Link>

      <div className="card-body">
        <div className="card-title">
          <h3>{card.name}</h3>
          {card.symbol && <div className="card-symbol">({card.symbol})</div>}
        </div>

        <div className="card-chips" aria-hidden="true">
          <div className="chip">{card.rarity || "Common"}</div>
          <div className="chip">HP: {card.health ?? 0}</div>
          <div className="chip">DMG: {card.damage ?? 0}</div>
        </div>

        <div className="card-desc">
          {card.description || "Tidak ada deskripsi. Klik untuk melihat detail."}
        </div>

        <div className="card-actions">
          <button className="btn primary" onClick={(e) => { e.preventDefault(); onEdit && onEdit(); }}>
            Edit
          </button>
          <button className="btn ghost" onClick={(e) => { e.preventDefault(); onDelete && onDelete(); }}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
