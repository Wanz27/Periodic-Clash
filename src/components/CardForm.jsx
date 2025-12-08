// src/components/CardForm.jsx
import React, { useEffect, useState, useRef } from "react";
import "../components/CardForm.css"; // pastikan path & nama file css benar
import { useToast } from "./ToastProvider";
import { supabase } from "../config/supabaseClient";

const PLACEHOLDER = "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png";

// simple reaction lookup
const REACTION_LOOKUP = {
  "H+O": "H2O",
  "O+H": "H2O",
  "Na+Cl": "NaCl",
  "Cl+Na": "NaCl",
  "H+H": "H2",
  "C+O2": "CO2",
  "O2+C": "CO2",
};

function computeResult(a, b) {
  const A = String(a || "").trim();
  const B = String(b || "").trim();
  if (!A && !B) return "-";
  if (!A) return B;
  if (!B) return A;
  const k1 = `${A}+${B}`;
  const k2 = `${B}+${A}`;
  if (REACTION_LOOKUP[k1]) return REACTION_LOOKUP[k1];
  if (REACTION_LOOKUP[k2]) return REACTION_LOOKUP[k2];
  return `${A}${B}`; // fallback naive
}

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CardForm({ initial = {}, onClose = () => { }, onSaved = () => { } }) {
  const toast = useToast();

  const [form, setForm] = useState({
    id: null,
    name: "",
    symbol: "",
    rarity: "Common",
    health: 30,
    damage: 5,
    description: "",
    reactions: [],
    powerups: [],
    image_file: null,
    image_url: "",
  });

  const [previewUrl, setPreviewUrl] = useState(PLACEHOLDER);
  const [uploading, setUploading] = useState(false);
  const [editingReactionIndex, setEditingReactionIndex] = useState(null);
  const [editingPowerIndex, setEditingPowerIndex] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initial && Object.keys(initial).length) {
      // normalize arrays
      const safe = {
        ...initial,
        reactions: Array.isArray(initial.reactions) ? initial.reactions : [],
        powerups: Array.isArray(initial.powerups) ? initial.powerups : [],
      };
      setForm((f) => ({ ...f, ...safe }));
      setPreviewUrl(initial.image_url || PLACEHOLDER);
    } else {
      setForm((f) => ({ ...f, id: null }));
      setPreviewUrl(PLACEHOLDER);
    }
  }, [initial]);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setField("image_file", file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(form.image_url || PLACEHOLDER);
    }
  }

  // Reactions handlers (quick add prefill result)
  function addReactionQuick(withElement) {
    const base = form.symbol || withElement;
    const result = computeResult(base, withElement);
    const newReaction = { with: withElement, result, effect: "" };
    setForm((f) => ({ ...f, reactions: [...(f.reactions || []), newReaction] }));
    setEditingReactionIndex((form.reactions || []).length);
    setEditingPowerIndex(null);
  }

  function addReactionManual() {
    const newReaction = { with: "X", result: computeResult(form.symbol || "X", "X"), effect: "" };
    setForm((f) => ({ ...f, reactions: [...(f.reactions || []), newReaction] }));
    setEditingReactionIndex((form.reactions || []).length);
    setEditingPowerIndex(null);
  }

  function updateReactionField(i, k, v) {
    setForm((f) => {
      const copy = [...(f.reactions || [])];
      copy[i] = { ...copy[i], [k]: v };
      // if 'with' changed, compute result automatically if result not manually edited
      if (k === "with") {
        copy[i].result = computeResult(form.symbol || copy[i].with, copy[i].with);
      }
      return { ...f, reactions: copy };
    });
  }

  function saveReactionInline(i) {
    setEditingReactionIndex(null);
    toast.success("Reaksi disimpan.");
  }

  function removeReaction(i) {
    if (!confirm("Hapus reaksi ini?")) return;
    setForm((f) => {
      const copy = [...(f.reactions || [])];
      copy.splice(i, 1);
      return { ...f, reactions: copy };
    });
    toast.info("Reaksi dihapus.");
  }

  // Powerups
  function addPowerQuick(name = "Shield") {
    const newP = { name, effect: "" };
    setForm((f) => ({ ...f, powerups: [...(f.powerups || []), newP] }));
    setEditingPowerIndex((form.powerups || []).length);
    setEditingReactionIndex(null);
  }

  function addPowerManual() {
    const newP = { name: "New Power", effect: "" };
    setForm((f) => ({ ...f, powerups: [...(f.powerups || []), newP] }));
    setEditingPowerIndex((form.powerups || []).length);
    setEditingReactionIndex(null);
  }

  function updatePowerField(i, k, v) {
    setForm((f) => {
      const copy = [...(f.powerups || [])];
      copy[i] = { ...copy[i], [k]: v };
      return { ...f, powerups: copy };
    });
  }

  function savePowerInline(i) {
    setEditingPowerIndex(null);
    toast.success("Power-up disimpan.");
  }

  function removePower(i) {
    if (!confirm("Hapus power-up ini?")) return;
    setForm((f) => {
      const copy = [...(f.powerups || [])];
      copy.splice(i, 1);
      return { ...f, powerups: copy };
    });
    toast.info("Power-up dihapus.");
  }

  // submit -> langsung ke Supabase (Storage + Table)
  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    toast.info("Menyimpan kartu...");

    try {
      // 1. Upload gambar ke Supabase Storage (bucket: card-images)
      let imageUrl = form.image_url || "";

      if (form.image_file) {
        const file = form.image_file;
        const ext = file.name.split(".").pop();
        const randomPart =
          (window.crypto && crypto.randomUUID && crypto.randomUUID()) ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const fileName = `${randomPart}.${ext}`;
        const filePath = fileName; // kalau mau di-folder: `cards/${fileName}`

        const { error: uploadError } = await supabase
          .storage
          .from("card-images") // ← sesuaikan dengan nama bucket-mu
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase
          .storage
          .from("card-images")
          .getPublicUrl(filePath);

        imageUrl = publicData.publicUrl;
      }

      // (opsional) ambil user untuk isi kolom owner
      let ownerId = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        ownerId = userData?.user?.id || null;
      } catch {
        ownerId = null;
      }

      // 2. Payload sesuai struktur tabel "cards"
      const payload = {
        owner: ownerId,
        name: form.name,
        symbol: form.symbol || null,
        rarity: form.rarity || null,
        health: Number(form.health) || 0,
        damage: Number(form.damage) || 0,
        reactions: form.reactions || [],
        powerups: form.powerups || [],
        description: form.description || null,
        image_url: imageUrl,
        is_public: true,
      };

      // 3. Insert / update ke Supabase
      let res;
      if (form.id) {
        res = await supabase
          .from("cards")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single();
      } else {
        res = await supabase
          .from("cards")
          .insert(payload)
          .select()
          .single();
      }

      if (res.error) throw res.error;

      toast.success(form.id ? "Perubahan disimpan." : "Kartu ditambahkan.");
      onSaved(res.data); // biar parent refresh katalog
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan kartu: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="cardform-overlay" role="dialog" aria-modal="true">
      <form className="cardform-panel" onSubmit={handleSubmit}>
        <div className="cardform-media">
          <div className="media-badge">{form.symbol || "?"}</div>
          <img src={previewUrl} alt={form.name || "Preview"} />
        </div>

        <div className="cardform-body">
          <div className="cardform-header">
            <div>
              <h3 className="cardform-title">{form.id ? "Edit Kartu" : "Tambah Kartu"}</h3>
              <div className="cardform-hint">Isi data kartu unsur — nama, rarity, statistik, reaksi, dst.</div>
            </div>

            <div>
              <button type="button" className="btn-ghost" onClick={() => onClose()} aria-label="Close form">Batal</button>
            </div>
          </div>

          <div className="cardform-body-inner">
            <div className="field">
              <label>Nama Unsur</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>

            <div className="cardform-row col-2">
              <div className="field">
                <label>Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setField("symbol", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Rarity</label>
                <select value={form.rarity} onChange={(e) => setField("rarity", e.target.value)}>
                  <option>Common</option>
                  <option>Uncommon</option>
                  <option>Rare</option>
                  <option>Epic</option>
                  <option>Legendary</option>
                </select>
              </div>
            </div>

            <div className="cardform-row col-2">
              <div className="field">
                <label>Health</label>
                <input type="number" value={form.health} onChange={(e) => setField("health", e.target.value)} />
              </div>
              <div className="field">
                <label>Damage</label>
                <input type="number" value={form.damage} onChange={(e) => setField("damage", e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Deskripsi</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>

            <div className="field">
              <label>Gambar Kartu</label>

              <div className="upload-wrapper">
                <label className="upload-btn">
                  Pilih Gambar
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>

                <span className="upload-filename">
                  {form.image_file?.name || (form.image_url ? "File sudah ada" : "Belum ada file")}
                </span>
              </div>

              <div className="cardform-hint">Ukuran ideal: 720×1080, PNG/JPG. (Preview muncul segera)</div>
              <img className="preview-small" src={previewUrl} alt="preview small" />
            </div>

            <div className="field">
              <label>Reaksi</label>
              <div className="chips-row" style={{ marginBottom: 8 }}>
                <div className="chip" onClick={() => addReactionQuick("O")}>+ O</div>
                <div className="chip" onClick={() => addReactionQuick("Cl")}>+ Cl</div>
                <div className="chip" onClick={() => addReactionQuick("N")}>+ N</div>
                <div className="chip ghost" onClick={() => addReactionManual()}>Tambah manual</div>
              </div>

              <div className="list-compact">
                {form.reactions.length === 0 ? (
                  <div className="muted">Belum ada reaksi — gunakan tombol di atas.</div>
                ) : (
                  form.reactions.map((r, i) => (
                    <div key={i} className="list-item">
                      <div className="list-item-main">
                        {editingReactionIndex === i ? (
                          <>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input className="inline-input" value={r.with} onChange={(e) => updateReactionField(i, "with", e.target.value)} />
                              <span style={{ alignSelf: "center", fontWeight: 800 }}>→</span>
                              <input className="inline-input" value={r.result} onChange={(e) => updateReactionField(i, "result", e.target.value)} />
                            </div>
                            <input className="inline-input" placeholder="Efek singkat (contoh: Restore 10 HP)" value={r.effect} onChange={(e) => updateReactionField(i, "effect", e.target.value)} />
                          </>
                        ) : (
                          <>
                            <div className="list-item-title" style={{ fontWeight: 900 }}>{r.with} → {r.result}</div>
                            <div className="list-item-sub">{r.effect || <span className="muted">(belum ada efek)</span>}</div>
                          </>
                        )}
                      </div>

                      <div className="list-item-actions">
                        {editingReactionIndex === i ? (
                          <>
                            <button type="button" className="mini" onClick={() => saveReactionInline(i)}>Simpan</button>
                            <button type="button" className="mini" onClick={() => setEditingReactionIndex(null)}>Batal</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="mini" onClick={() => setEditingReactionIndex(i)}>Edit</button>
                            <button type="button" className="mini danger" onClick={() => removeReaction(i)}>Hapus</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="field">
              <label>Power-ups</label>
              <div className="chips-row" style={{ marginBottom: 8 }}>
                <div className="chip" onClick={() => addPowerQuick("Shield")}>Shield</div>
                <div className="chip" onClick={() => addPowerQuick("Boost")}>Boost</div>
                <div className="chip ghost" onClick={() => addPowerManual()}>Tambah manual</div>
              </div>

              <div className="list-compact">
                {form.powerups.length === 0 ? (
                  <div className="muted">Belum ada power-up — gunakan tombol di atas.</div>
                ) : (
                  form.powerups.map((p, i) => (
                    <div key={i} className="list-item">
                      <div className="list-item-main">
                        {editingPowerIndex === i ? (
                          <>
                            <input className="inline-input" value={p.name} onChange={(e) => updatePowerField(i, "name", e.target.value)} />
                            <input className="inline-input" placeholder="Efek singkat" value={p.effect} onChange={(e) => updatePowerField(i, "effect", e.target.value)} />
                          </>
                        ) : (
                          <>
                            <div className="list-item-title" style={{ fontWeight: 900 }}>{p.name}</div>
                            <div className="list-item-sub">{p.effect || <span className="muted">(belum ada efek)</span>}</div>
                          </>
                        )}
                      </div>

                      <div className="list-item-actions">
                        {editingPowerIndex === i ? (
                          <>
                            <button type="button" className="mini" onClick={() => savePowerInline(i)}>Simpan</button>
                            <button type="button" className="mini" onClick={() => setEditingPowerIndex(null)}>Batal</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="mini" onClick={() => setEditingPowerIndex(i)}>Edit</button>
                            <button type="button" className="mini danger" onClick={() => removePower(i)}>Hapus</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="cardform-actions">
            <button type="submit" className="btn-primary-lg" disabled={uploading}>
              {uploading ? "Menyimpan..." : (form.id ? "Simpan Perubahan" : "Tambahkan Kartu")}
            </button>
            <button type="button" className="btn-ghost" onClick={() => onClose()}>Tutup</button>
          </div>
        </div>
      </form>
    </div>
  );
}
