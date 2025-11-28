// src/components/PreparationModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../components/PreparationModal.css";

export default function PreparationModal({ boss, onClose }) {
    const navigate = useNavigate();

    function startFight() {
        onClose();
        navigate(`/games/${boss.id}/arena`);
    }

    return (
        <div className="prep-overlay" role="dialog" aria-modal="true">
            <motion.div
                className="prep-panel"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="prep-grid">
                    <div className="prep-inner-scroll">
                        {/* LEFT SIDE – IMAGE */}
                        <div className="prep-left">
                            <div className="symbol-badge">{boss.symbol || boss.id.charAt(0).toUpperCase()}</div>
                            <img src={boss.image} alt={boss.name} className="prep-image" />
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="prep-right">
                            {/* HEADER */}
                            <div className="prep-header-top">
                                <div>
                                    <h1 className="prep-name">{boss.name}</h1>
                                    <span className="prep-symbol">({boss.id.toUpperCase()})</span>
                                </div>

                                <div className="rarity-badge">{boss.difficulty}</div>
                            </div>

                            {/* STATS */}
                            <div className="prep-stats-row">
                                <div className="pill">HP: {boss.hp}</div>
                                <div className="pill">DMG: {boss.dmg}</div>

                                <div className="difficulty-wrapper">
                                    <span className="diff-label">Difficulty: {boss.difficulty}</span>
                                    <div className="diff-bar">
                                        <div
                                            className="diff-fill"
                                            style={{
                                                width:
                                                    boss.difficulty === "Easy"
                                                        ? "30%"
                                                        : boss.difficulty === "Medium"
                                                            ? "60%"
                                                            : "90%",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <p className="prep-desc">{boss.description}</p>

                            {/* Skills */}
                            <div className="prep-box">
                                <h3>Reaksi & Efek</h3>
                                {boss.skills.map((s, i) => (
                                    <div className="skill-row" key={i}>
                                        <span className="skill-name">{s.name}</span>
                                        <span className="skill-effect">{s.desc}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Powerups */}
                            <div className="prep-box">
                                <h3>Power-ups</h3>
                                {boss.powerups?.length > 0 ? (
                                    boss.powerups.map((p, i) => (
                                        <div className="skill-row" key={i}>
                                            <span className="skill-name">{p.name}</span>
                                            <span className="skill-effect">{p.effect}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="skill-effect muted">Tidak ada power-up.</div>
                                )}
                            </div>
                        </div>
                        
                        {/* BUTTONS */}
                        <div className="prep-actions">
                            <button className="btn-large ghost" onClick={onClose}>Kembali</button>
                            <button className="btn-large primary" onClick={startFight}>
                                Lawan!
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
