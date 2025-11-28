// src/pages/Arena.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import "../pages/arena.css";

function PauseMenu({ onClose, onExit }) {
  // Modal popup centered
  return (
    <div className="arena-pause-overlay" role="dialog" aria-modal="true">
      <div className="arena-pause-card" role="document">
        <h3 className="pause-title">Game Paused</h3>
        <div className="arena-pause-actions">
          <button className="btn ghost" onClick={onClose}>Resume</button>
          <button className="btn primary" onClick={onExit}>Exit to Games</button>
        </div>
      </div>
    </div>
  );
}

export default function Arena() {
  const { slug } = useParams(); // e.g. "fluorin"
  const navigate = useNavigate();

  const [boss, setBoss] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [loadingBoss, setLoadingBoss] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [paused, setPaused] = useState(false);

  // Hide app header/navbar while in arena by adding body class
  useEffect(() => {
    document.body.classList.add("in-arena");
    return () => document.body.classList.remove("in-arena");
  }, []);

  // Fetch boss details from backend
  useEffect(() => {
    (async () => {
      setLoadingBoss(true);
      try {
        const resp = await fetch(`/api/bosses/${slug}`);
        if (!resp.ok) throw new Error("Failed loading boss");
        const data = await resp.json();
        setBoss({
          id: data.slug || data.id,
          name: data.name,
          image: data.image_url || data.image || "",
          difficulty: data.difficulty || data.level || "Medium",
          hp: data.hp || data.health || 100,
          dmg: data.dmg || data.damage || 10,
          description: data.description || "",
          skills: data.skills || data.reactions || [],
          powerups: data.powerups || [],
          symbol: data.symbol || (data.name ? data.name.charAt(0).toUpperCase() : "B"),
        });
      } catch (err) {
        console.error(err);
        setBoss(null);
      } finally {
        setLoadingBoss(false);
      }
    })();
  }, [slug]);

  // Fetch three starter player cards (H, O, Na) from Supabase
  useEffect(() => {
    (async () => {
      setLoadingCards(true);
      try {
        const prefer = ["H", "O", "Na"];
        let { data, error } = await supabase
          .from("cards")
          .select("id, name, symbol, health, damage, image_url")
          .in("symbol", prefer);

        if (error || !data || data.length === 0) {
          const { data: fallback, error: err2 } = await supabase
            .from("cards")
            .select("id, name, symbol, health, damage, image_url")
            .order("created_at", { ascending: true })
            .limit(3);
          if (err2) throw err2;
          data = fallback;
        }

        if (!data || data.length < 3) {
          const { data: more, error: e3 } = await supabase
            .from("cards")
            .select("id, name, symbol, health, damage, image_url")
            .order("created_at", { ascending: true })
            .limit(3);
          if (e3) throw e3;
          data = (data || []).concat(more || []);
        }

        const cards = (data || []).slice(0, 3).map((c) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          health: c.health ?? 0,
          damage: c.damage ?? 0,
          image: c.image_url || "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png",
        }));

        while (cards.length < 3) {
          cards.push({
            id: `placeholder-${cards.length}`,
            name: cards.length === 0 ? "Hydrogen" : cards.length === 1 ? "Oxygen" : "Sodium",
            symbol: cards.length === 0 ? "H" : cards.length === 1 ? "O" : "Na",
            health: 30,
            damage: 5,
            image: "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png",
          });
        }

        setPlayerCards(cards);
      } catch (err) {
        console.error("load player cards:", err);
        setPlayerCards([]);
      } finally {
        setLoadingCards(false);
      }
    })();
  }, []);

  function openPause() { setPaused(true); }
  function closePause() { setPaused(false); }
  function exitToGames() { navigate("/games"); }

  return (
    <main className="arena-root">
      {/* Pause button (top-right) */}
      <button
        className="arena-pause-toggle"
        onClick={openPause}
        aria-label="Pause"
        title="Pause"
      >
        <span className="pause-icon">II</span>
      </button>

      {/* Centered modal popup when paused */}
      {paused && <PauseMenu onClose={closePause} onExit={exitToGames} />}

      <div className="arena-container">
        {/* Title block moved to left to avoid pause button */}
        <div className="arena-title-block">
          <div>
            <h1 className="arena-title">{boss ? `Arena Boss — ${boss.id}` : "Arena"}</h1>
            <div className="arena-sub">Kalahkan Boss untuk memenangkan permainan!</div>
          </div>
        </div>

        <div className="arena-core">
          {/* Boss in compact card (same style as player cards) */}
          <div className="boss-row">
            <div className="player-card boss-as-player">
              {loadingBoss ? (
                <div className="muted">Memuat boss…</div>
              ) : boss ? (
                <>
                  <div className="player-image">
                    <img src={boss.image} alt={boss.name} />
                    <div className="player-symbol">{boss.symbol || (boss.name ? boss.name.charAt(0).toUpperCase() : "B")}</div>
                  </div>

                  <div className="player-meta">
                    <div className="player-name">{boss.name}</div>

                    <div className="meta-row">
                      <div className="hp-row">
                        <div className="meta-label">HP</div>
                        <div className="bar" aria-hidden="true">
                          <div className="bar-fill" style={{ width: `${Math.min(100, (boss.hp / 300) * 100)}%` }} />
                        </div>
                        <div className="meta-value">{boss.hp}</div>
                      </div>

                      <div className="dm-row">
                        <div className="meta-label">DMG</div>
                        <div className="bar dmg-bar" aria-hidden="true">
                          <div className="bar-fill" style={{ width: `${Math.min(100, (boss.dmg / 100) * 100)}%` }} />
                        </div>
                        <div className="meta-value">{boss.dmg}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="muted">Boss tidak ditemukan.</div>
              )}
            </div>
          </div>

          {/* VS circle */}
          <div className="vs-row">
            <div className="vs-circle">VS</div>
          </div>

          {/* Players horizontal, centered and wrapping on small screens */}
          <div className="players-row">
            <div className="players-stack">
              {loadingCards ? (
                <div className="muted">Memuat kartu pemain…</div>
              ) : (
                playerCards.map((pc) => (
                  <div className="player-card" key={pc.id}>
                    <div className="player-image">
                      <img src={pc.image} alt={pc.name} />
                      <div className="player-symbol">{pc.symbol}</div>
                    </div>
                    <div className="player-meta">
                      <div className="player-name">{pc.name}</div>

                      <div className="meta-row">
                        <div className="hp-row">
                          <div className="meta-label">HP</div>
                          <div className="bar" aria-hidden="true">
                            <div className="bar-fill" style={{ width: `${Math.min(100, (pc.health / 200) * 100)}%` }} />
                          </div>
                          <div className="meta-value">{pc.health}</div>
                        </div>

                        <div className="dm-row">
                          <div className="meta-label">DMG</div>
                          <div className="bar dmg-bar" aria-hidden="true">
                            <div className="bar-fill" style={{ width: `${Math.min(100, (pc.damage / 100) * 100)}%` }} />
                          </div>
                          <div className="meta-value">{pc.damage}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
