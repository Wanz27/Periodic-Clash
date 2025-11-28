import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./ProfileCard.css";

// Default avatar (file you uploaded in the session)
const DEFAULT_AVATAR = "/mnt/data/A_2D_digital_illustration_features_fourteen_anthro.png";

export default function ProfileCard({ onLogout = () => console.log("logout"), initial = {} }) {
  // load saved profile from localStorage or initial props
  const saved = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("pc_profile") || "null") : null;
  const initialProfile = saved || {
    name: initial.name || "Nama Pengguna",
    email: initial.email || "user@example.com",
    bio: initial.bio || "Halo! Saya suka bereksperimen dengan unsur kimia dan deck strategy.",
    avatar: initial.avatar || DEFAULT_AVATAR,
    level: initial.level || 3,
    xp: initial.xp || 420,
    cards: initial.cards || 14,
    prefs: initial.prefs || { darkMode: true, notifications: true },
  };

  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(initialProfile);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pw, setPw] = useState({ current: "", newpw: "", confirm: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    // update temp when profile saved externally
    setTemp(profile);
  }, [profile]);

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTemp((s) => ({ ...s, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function startEdit() {
    setTemp(profile);
    setEditing(true);
  }

  function cancelEdit() {
    setTemp(profile);
    setEditing(false);
    setChangingPassword(false);
    setPw({ current: "", newpw: "", confirm: "" });
  }

  function saveProfile() {
    // minimal validation
    if (!temp.name || temp.name.trim().length < 2) {
      alert("Nama terlalu pendek.");
      return;
    }
    setProfile(temp);
    localStorage.setItem("pc_profile", JSON.stringify(temp));
    setEditing(false);
    setChangingPassword(false);
    setPw({ current: "", newpw: "", confirm: "" });
  }

  function handlePwChange() {
    if (pw.newpw.length < 6) {
      alert("Password baru harus minimal 6 karakter.");
      return;
    }
    if (pw.newpw !== pw.confirm) {
      alert("Konfirmasi password tidak sama.");
      return;
    }
    // NOTE: ini hanya UI mockup; di prod, kirim ke API
    alert("Password berhasil diubah (demo).");
    setPw({ current: "", newpw: "", confirm: "" });
    setChangingPassword(false);
  }

  function togglePref(prefKey) {
    setTemp((t) => ({ ...t, prefs: { ...t.prefs, [prefKey]: !t.prefs[prefKey] } }));
  }

  return (
    <motion.div className="pc-profile-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="profile-top">
        <div className="avatar-wrap">
          <img className="avatar-img" src={editing ? temp.avatar : profile.avatar} alt="avatar" />
          <button className="avatar-edit" onClick={() => fileInputRef.current && fileInputRef.current.click()} title="Ganti avatar">
            ✎
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </div>

        <div className="profile-info">
          <div className="profile-row">
            {editing ? (
              <input className="input-name" value={temp.name} onChange={(e) => setTemp((t) => ({ ...t, name: e.target.value }))} />
            ) : (
              <h3 className="profile-name">{profile.name}</h3>
            )}
            <div className="profile-actions">
              {editing ? (
                <>
                  <button className="btn ghost small" onClick={cancelEdit}>Cancel</button>
                  <button className="btn primary small" onClick={saveProfile}>Save</button>
                </>
              ) : (
                <>
                  <button className="btn ghost small" onClick={startEdit}>Edit</button>
                  <button className="btn ghost small" onClick={onLogout}>Logout</button>
                </>
              )}
            </div>
          </div>

          <div className="profile-meta">
            <div className="profile-email">{profile.email}</div>
            {editing ? (
              <textarea className="input-bio" rows="3" value={temp.bio} onChange={(e) => setTemp((t) => ({ ...t, bio: e.target.value }))} />
            ) : (
              <div className="profile-bio">{profile.bio}</div>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">Lvl {profile.level}</div>
              <div className="stat-label">Level</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.xp} XP</div>
              <div className="stat-label">Experience</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.cards}</div>
              <div className="stat-label">Cards</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-middle">
        <div className="prefs">
          <div className="prefs-title">Preferensi</div>
          <div className="prefs-row">
            <label className="toggle">
              <input type="checkbox" checked={editing ? temp.prefs.darkMode : profile.prefs.darkMode} onChange={() => togglePref("darkMode")} />
              <span className="toggle-ui" />
              <span className="toggle-label">Dark mode</span>
            </label>

            <label className="toggle">
              <input type="checkbox" checked={editing ? temp.prefs.notifications : profile.prefs.notifications} onChange={() => togglePref("notifications")} />
              <span className="toggle-ui" />
              <span className="toggle-label">Notifikasi</span>
            </label>
          </div>
        </div>

        <div className="security">
          <div className="prefs-title">Keamanan</div>
          {!changingPassword ? (
            <button className="btn ghost small" onClick={() => setChangingPassword(true)}>Ganti Password</button>
          ) : (
            <div className="change-password">
              <input type="password" placeholder="Password sekarang" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
              <input type="password" placeholder="Password baru" value={pw.newpw} onChange={(e) => setPw((p) => ({ ...p, newpw: e.target.value }))} />
              <input type="password" placeholder="Konfirmasi password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
              <div className="cp-actions">
                <button className="btn ghost small" onClick={() => setChangingPassword(false)}>Batal</button>
                <button className="btn primary small" onClick={handlePwChange}>Ubah</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="profile-foot">
        <div className="foot-left">
          <small className="muted">Keamanan & privasi — semua data disimpan di localStorage (demo).</small>
        </div>

        <div className="foot-right">
          <button className="btn ghost" onClick={() => {
            localStorage.removeItem("pc_profile");
            setProfile(initialProfile => initialProfile); // no-op to keep type inference but you may redirect
            alert("Profil di-reset (demo).");
          }}>Reset Demo</button>
          <button className="btn primary" onClick={() => { saveProfile(); }}>Save to device</button>
        </div>
      </div>
    </motion.div>
  );
}
