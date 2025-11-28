// src/pages/Setting.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";

export default function SettingPage() {
  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#000b58", color: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginTop: 32 }}>
          <Link to="/">← Kembali ke Beranda</Link>
        </div>
        <h1 style={{ color: "#fdebb9"}}>Pengaturan</h1>
        <ProfileCard onLogout={() => { /* your logout logic */ console.log("logout"); }} />
      </div>
    </div>
  );
}
