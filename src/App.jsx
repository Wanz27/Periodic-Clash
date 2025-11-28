// src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";      // kalau pakai header desktop
import BottomNav from "./components/BottomNav"; // kalau pakai bottom nav mobile

export default function App() {
  return (
    <div className="app-root">
      <Header />        {/* akan disembunyikan di mobile via CSS if needed */}
      <Outlet />        {/* <-- child routes render here */}
      <BottomNav />     {/* bottom nav will be visible only on small screens via CSS */}
    </div>
  );
}
