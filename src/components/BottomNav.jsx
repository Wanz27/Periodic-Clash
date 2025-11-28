// src/components/BottomNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import "./BottomNav.css";


/* SVG icon components (same as before) */
function IconHome({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 21V12.5h14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCard({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 9h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconLearn({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2v20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M5 8h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M5 16h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconGames({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 12a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="3.5" y="4.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="14.5" y="14.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}
function IconAbout({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M11 10h1v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="7.5" r="0.6" fill="currentColor"/>
    </svg>
  );
}
function IconSettings({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M19.4 15a1.8 1.8 0 00.2 1.9l.1.1a1 1 0 01-1.2 1.6l-.1-.06a1.8 1.8 0 00-1.8.2l-.12.08a1 1 0 01-1.2-.1l-.08-.09a1.8 1.8 0 00-2.4 0l-.08.09a1 1 0 01-1.2.1l-.12-.08a1.8 1.8 0 00-1.8-.2l-.1.06a1 1 0 01-1.2-1.6l.1-.1a1.8 1.8 0 00.2-1.9l-.05-.12a1 1 0 01.9-1.4h.14a1.8 1.8 0 001.6-.9l.05-.12a1 1 0 011.7 0l.05.12c.3.6.9 1 1.6.9h.14a1 1 0 01.9 1.4l-.05.12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function BottomNav() {
  const items = [
    { id: "home", to: "/", label: "Home", Icon: IconHome },
    { id: "card", to: "/cards", label: "Card", Icon: IconCard },
    { id: "learn", to: "/learn", label: "Learn", Icon: IconLearn },
    { id: "games", to: "/games", label: "Games", Icon: IconGames },
    { id: "about", to: "/about", label: "About", Icon: IconAbout },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      <div className="bn-items">
        {items.map((it) => (
          <NavLink key={it.id} to={it.to} className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
            {({ isActive }) => (
              <div className="bn-inner">
                <motion.div
                  className="bn-icon"
                  animate={isActive ? { scale: 1.14, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <it.Icon className="svg-icon" />
                </motion.div>

                <div className="bn-label">{it.label}</div>

                {/* the glow element is purely styled in CSS via :before on .bn-item.active */}
                {isActive && <motion.span layoutId="bn-indicator" className="bn-indicator" transition={{ type: "spring", stiffness: 300, damping: 20 }} />}
              </div>
            )}
          </NavLink>
        ))}

        {/* Settings on the right */}
        <NavLink to="/settings" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
          {({ isActive }) => (
            <div className="bn-inner">
              <motion.div className="bn-icon" animate={isActive ? { scale: 1.14, y: -2 } : { scale: 1 }}>
                <IconSettings className="svg-icon" />
              </motion.div>
              <div className="bn-label">Settings</div>
              {isActive && <motion.span layoutId="bn-indicator" className="bn-indicator" transition={{ type: "spring", stiffness: 300, damping: 20 }} />}
            </div>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
