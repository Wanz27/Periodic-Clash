// src/pages/CardEditPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardForm from "../components/CardForm";
import { supabase } from "../config/supabaseClient";

/**
 * CardEditPage
 * - mengambil data kartu berdasarkan :id
 * - merender CardForm dengan prop `initial`
 * - setelah submit / close -> navigasi kembali ke halaman detail
 */
export default function CardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (!mounted) return;
        setInitial(data);
      } catch (e) {
        console.error("Failed to load card:", e);
        if (mounted) setErr(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Memuat data kartu…</div>;
  if (err) return (
    <div style={{ padding: 24 }}>
      Gagal memuat kartu. Cek konsol untuk detail.
      <div style={{ marginTop: 12 }}>
        <button className="btn ghost" onClick={() => navigate(-1)}>Kembali</button>
      </div>
    </div>
  );

  // onClose: kembali ke halaman detail kartu setelah edit selesai / batal
  function handleClose() {
    navigate(`/cards/${id}`);
  }

  return (
    <div style={{ padding: "16px" }}>
      <CardForm initial={initial} onClose={handleClose} />
    </div>
  );
}
