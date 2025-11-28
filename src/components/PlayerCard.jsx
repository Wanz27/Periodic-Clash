// src/components/PlayerCard.jsx
import React from "react";
import "./PlayerCard.css"; // file CSS kecil untuk styling lokal (lihat snippet css di bawah)

export default function PlayerCard({ card }) {
  // card: { id, name, symbol, health, damage, image }
  return (
    <article className="playercard" role="article" aria-label={`Kartu ${card.name}`}>
      <div className="playercard-media">
        <img
          src={card.image || "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png"}
          alt={card.name}
          loading="lazy"
        />
        <div className="playercard-symbol">{card.symbol || (card.name || "U").charAt(0)}</div>
      </div>

      <div className="playercard-body">
        <div className="playercard-title">{card.name}</div>

        <div className="playercard-bars">
          <div className="bar-row">
            <div className="bar-label">HP</div>
            <div className="bar track">
              {/* visual percent (assume max 100 default) */}
              <div
                className="bar-fill hp"
                style={{ width: `${Math.min(100, Math.round((card.health || 0))) }%` }}
                aria-hidden="true"
              />
            </div>
            <div className="bar-value">{card.health ?? 0}</div>
          </div>

          <div className="bar-row">
            <div className="bar-label">DMG</div>
            <div className="bar track">
              <div
                className="bar-fill dmg"
                style={{ width: `${Math.min(100, Math.round((card.damage || 0))) }%` }}
                aria-hidden="true"
              />
            </div>
            <div className="bar-value">{card.damage ?? 0}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
