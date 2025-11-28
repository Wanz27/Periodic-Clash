// src/components/BossCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function BossCard({ boss, onPrepare }) {
  return (
    <motion.article
      className="boss-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -6 }}
      role="button"
      tabIndex={0}
      onClick={onPrepare}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onPrepare(); }}
      aria-label={`Prepare vs ${boss.name}`}
    >
      <div className="boss-thumb" aria-hidden="true">
        <img src={boss.image} alt={boss.name} />
      </div>

      <div className="boss-meta">
        <div className="boss-title">
          <h3>{boss.name}</h3>
          <div className={`badge difficulty ${boss.difficulty.toLowerCase()}`}>{boss.difficulty}</div>
        </div>

        <div className="boss-stats">
          <div className="stat">HP <strong>{boss.hp}</strong></div>
          <div className="stat">DMG <strong>{boss.dmg}</strong></div>
        </div>

        <p className="boss-desc">{boss.description}</p>

        <div className="boss-actions">
          <button className="btn ghost" onClick={(e)=>{ e.stopPropagation(); onPrepare(); }}>Persiapkan</button>
        </div>
      </div>
    </motion.article>
  );
}
