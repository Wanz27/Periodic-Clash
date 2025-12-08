// src/pages/Setting.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Setting.css";
import { useToast } from "../components/ToastProvider";
import { supabase } from "../config/supabaseClient";

const INITIAL_FORM = {
  name: "",
  gender: "Male",
  email: "",
  location: "",
  avatarUrl: "/mnt/data/1b828d6f-5c02-4e75-b892-1581eaf78ddb.png",
};

export default function SettingPage() {
  const toast = useToast();

  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [avatarFile, setAvatarFile] = useState(null);

  // keep last created object URL so we can revoke it when replaced/unmount
  const currentObjectUrl = useRef(null);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleAvatarChange(e) {
    const f = e.target.files?.[0] || null;

    // revoke previous object URL if any (avoid leak)
    if (currentObjectUrl.current) {
      try { URL.revokeObjectURL(currentObjectUrl.current); } catch (err) {}
      currentObjectUrl.current = null;
    }

    setAvatarFile(f);

    if (f) {
      const obj = URL.createObjectURL(f);
      currentObjectUrl.current = obj;
      setField("avatarUrl", obj);
    } else {
      // if user cleared file selection, fallback to whatever is in form or initial
      setField("avatarUrl", form.avatarUrl || INITIAL_FORM.avatarUrl);
    }
  }

  function validateForm() {
    if (!form.name || !form.name.trim()) {
      toast.error("Nama harus diisi.");
      return false;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Email tidak valid.");
      return false;
    }
    return true;
  }

  // load profile on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const resp = await fetch("/api/public-profiles", { method: "GET" });
        if (resp.ok) {
          const body = await resp.json().catch(() => null);
          // support several shapes: { profile: {...} }, { data: {...} }, or {...}
          const p = body?.profile || body?.data || body;
          if (p && (p.full_name || p.name || p.email || p.avatar_url)) {
            if (!mounted) return;
            setForm((prev) => ({
              ...prev,
              name: p.full_name || p.name || prev.name || "",
              gender: p.gender || prev.gender || "Male",
              email: p.email || prev.email || "",
              location: p.location || prev.location || "",
              // prefer returned avatar_url, otherwise keep previous
              avatarUrl: p.avatar_url || p.avatarUrl || p.avatar || prev.avatarUrl,
            }));
            setEditing(false);
            return;
          }
        } else {
          console.warn("GET /api/public-profiles failed:", resp.status);
        }
      } catch (err) {
        console.warn("Backend fetch failed, falling back to supabase:", err?.message || err);
      }

      // fallback to supabase tables
      try {
        const tryTables = ["public_profiles", "profiles"];
        for (const tbl of tryTables) {
          const { data, error } = await supabase
            .from(tbl)
            .select("*")
            .limit(1)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            const p = data[0];
            if (!mounted) return;
            setForm((prev) => ({
              ...prev,
              name: p.full_name || p.name || prev.name || "",
              gender: p.gender || prev.gender || "Male",
              email: p.email || prev.email || "",
              location: p.location || prev.location || "",
              avatarUrl: p.avatar_url || p.avatarUrl || p.avatar || prev.avatarUrl,
            }));
            setEditing(false);
            return;
          }
          if (error) console.warn(`Supabase select ${tbl} error:`, error.message);
        }
      } catch (err) {
        console.error("Supabase fallback failed:", err);
      }
    })();

    return () => {
      mounted = false;
      // revoke object URL if component unmounts
      if (currentObjectUrl.current) {
        try { URL.revokeObjectURL(currentObjectUrl.current); } catch (err) {}
        currentObjectUrl.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e) {
    e?.preventDefault?.();
    if (!validateForm()) return;

    setSaving(true);
    toast.info("Menyimpan profil…");

    try {
      const fd = new FormData();
      fd.append("full_name", form.name);
      fd.append("email", form.email);
      fd.append("gender", form.gender);
      fd.append("location", form.location);

      // jika user upload file baru, kirim file
      if (avatarFile) {
        fd.append("avatar", avatarFile);
      } else {
        // optional: jika backend membutuhkan field avatar_url untuk menahan isian,
        // Anda bisa mengirim avatar_url saat tidak ada file. Hati-hati: server harus
        // mengimplementasikan agar tidak mengosongkan avatar jika avatar_url dikirim kosong.
        // fd.append("avatar_url", form.avatarUrl);
      }

      const resp = await fetch("/api/public-profiles", {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || `Server returned ${resp.status}`);
      }

      const data = await resp.json().catch(() => null);
      toast.success("Profil tersimpan.");

      const saved = (data?.profile || data) || {};

      // update form fully from saved response (merge, don't overwrite unknown fields)
      setForm((prev) => ({
        ...prev,
        name: saved.full_name || saved.name || prev.name,
        gender: saved.gender || prev.gender,
        email: saved.email || prev.email,
        location: saved.location || prev.location,
        avatarUrl: saved.avatar_url || saved.avatarUrl || prev.avatarUrl,
      }));

      // if backend returned a public avatar url, revoke any local blob url and adopt it
      if (saved?.avatar_url && currentObjectUrl.current) {
        try { URL.revokeObjectURL(currentObjectUrl.current); } catch (err) {}
        currentObjectUrl.current = null;
      }

      setAvatarFile(null);
      setEditing(false);
    } catch (err) {
      console.error("save error", err);
      toast.error("Gagal menyimpan: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="settings-root container">
      <div className="settings-card">
        <div className="settings-header">
          <div className="avatar-wrap">
            <div className="avatar-frame">
              <img src={form.avatarUrl} alt="avatar" className="avatar-img" />
              <label className="avatar-edit" title="Upload avatar">
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={saving} />
                ✎
              </label>
            </div>
          </div>

          <div className="header-info">
            <h1 className="profile-title">Profile</h1>
            <p className="muted header-desc">Edit informasi dasar</p>
            <button
              type="button"
              className="btn ghost header-btn"
              onClick={() => setEditing((s) => !s)}
              disabled={saving}
            >
              {editing ? "Batal" : "Edit Profile"}
            </button>
          </div>
        </div>

        <form className="settings-body" onSubmit={handleSave}>
          <section className="section-block">
            <div className="section-title">BASIC INFORMATION</div>

            <div className="field-row">
              <label>Nama</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                readOnly={!editing || saving}
                placeholder="Masukkan nama"
              />
            </div>

            <div className="field-row">
              <label>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
                disabled={!editing || saving}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="field-row">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                readOnly={!editing || saving}
                placeholder="email@domain.com"
              />
            </div>

            <div className="field-row">
              <label>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                readOnly={!editing || saving}
                placeholder="Kota, Negara"
              />
            </div>
          </section>

          <div className="settings-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                // revoke any current object URL
                if (currentObjectUrl.current) {
                  try { URL.revokeObjectURL(currentObjectUrl.current); } catch (err) {}
                  currentObjectUrl.current = null;
                }
                setForm(INITIAL_FORM);
                setAvatarFile(null);
                setEditing(true);
              }}
              disabled={saving}
            >
              Reset
            </button>

            <button type="submit" className="btn primary" disabled={!editing || saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
