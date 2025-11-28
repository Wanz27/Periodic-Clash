// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider";

import App from "./App";
import MainMenu from "./MainMenu";           // halaman utama
import CardCatalog from "./pages/CardCatalog";
import CardDetail from "./pages/CardDetail";
import SettingPage from "./pages/setting";
import CardEditPage from "./pages/CardEditPage";
import Games from "./pages/Games";
import Arena from "./pages/Arena";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* App bertindak sebagai layout (Header, Outlet, BottomNav) */}
          <Route path="/" element={<App />}>
            {/* index: / */}
            <Route index element={<MainMenu />} />
            <Route path="cards" element={<CardCatalog />} />
            <Route path="cards/:id" element={<CardDetail />} />
            <Route path="cards/:id/edit" element={<CardEditPage />} />
            <Route path="settings" element={<SettingPage />} />
            <Route path="games" element={<Games />} />
            <Route path="games/:slug/arena" element={<Arena />} />

            {/* fallback 404 - letakkan terakhir */}
            <Route path="*" element={<MainMenu />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
