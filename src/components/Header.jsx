// src/components/Header.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import "../components/Header.css";

const paletteUrl = "/chemcat.jpg"; // atau '/mnt/data/9f985eae-5333-462e-a0e3-fe3d221db9b9.png' untuk preview

const navItems = [
  { id: "home", label: "Home", to: "/" },
  { id: "card", label: "Card", to: "/cards" },
  { id: "games", label: "Games", to: "/games" },
  { id: "about", label: "About", to: "/about" },
];

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="pc-header">
      <div className="pc-header-inner">
        <div className="brand" onClick={() => navigate("/")}>
          <div className="brand-mark" style={{ backgroundImage: `url(${paletteUrl})` }} />
          <div className="brand-text">
            <div className="brand-title">Periodic Clash</div>
            <div className="brand-sub">Learn chemistry — play cards</div>
          </div>
        </div>

        <nav className="nav-desktop" aria-label="Main navigation">
          {navItems.map((n) => (
            <NavLink
              key={n.id}
              to={n.to}
              className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
            >
              <motion.span whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                {n.label}
              </motion.span>
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {/* Settings icon: navigate to /settings */}
          <button
            className="icon-btn"
            title="Settings"
            onClick={() => navigate("/settings")}
            aria-label="Settings"
          >
            ⚙
          </button>

          <button
            className="hamburger"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            aria-label="Open menu"
          >
            <div className={`hb-line ${open ? "open" : ""}`} />
            <div className={`hb-line ${open ? "open" : ""}`} />
            <div className={`hb-line ${open ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div className="mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {navItems.map((n) => (
              <NavLink
                key={n.id}
                to={n.to}
                className={({ isActive }) => `mobile-nav-item ${isActive ? "is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
