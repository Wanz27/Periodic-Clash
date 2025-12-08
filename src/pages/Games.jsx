// src/pages/Games.jsx
import React, { useEffect, useState } from "react";
import BossCard from "../components/BossCard";
import PreparationModal from "../components/PreparationModal";
import "../pages/games.css";
import { supabase } from "../config/supabaseClient";

export default function Games() {
  const [bosses, setBosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoss, setSelectedBoss] = useState(null);

  async function loadBosses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bosses")
        .select(
          "id, slug, name, image_url, difficulty, hp, dmg, description, skills, powerups"
        )
        .order("created_at", { ascending: true }); // sesuaikan kalau kolomnya beda

      if (error) throw error;

      setBosses(data || []);
    } catch (err) {
      console.error("Error load bosses:", err);
      setBosses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBosses();
  }, []);

  function openPrep(boss) {
    setSelectedBoss(boss);
  }

  function closePrep() {
    setSelectedBoss(null);
  }

  return (
    <main className="games-page container">
      <header className="games-header">
        <h1>Boss Encounters</h1>
        <p className="muted">
          Pilih boss untuk melihat strategi dan persiapan. Difficulty
          menunjukkan tingkat tantangan.
        </p>
      </header>

      <section className="boss-list" aria-label="List boss">
        {loading ? (
          <div className="muted">Memuat bos...</div>
        ) : bosses.length === 0 ? (
          <div className="muted">Belum ada boss tersedia.</div>
        ) : (
          bosses.map((b) => (
            <BossCard
              key={b.slug || b.id}
              boss={{
                id: b.slug || b.id,
                name: b.name,
                image: b.image_url,
                difficulty: b.difficulty,
                hp: b.hp,
                dmg: b.dmg,
                description: b.description,
                skills: b.skills || [],
                powerups: b.powerups || [],
              }}
              onPrepare={() =>
                openPrep({
                  id: b.slug || b.id,
                  name: b.name,
                  image: b.image_url,
                  difficulty: b.difficulty,
                  hp: b.hp,
                  dmg: b.dmg,
                  description: b.description,
                  skills: b.skills || [],
                  powerups: b.powerups || [],
                })
              }
            />
          ))
        )}
      </section>

      {selectedBoss && (
        <PreparationModal boss={selectedBoss} onClose={closePrep} />
      )}
    </main>
  );
}
