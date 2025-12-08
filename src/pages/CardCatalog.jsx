// src/pages/CardCatalog.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import CardCard from "../components/CardCard";
import CardForm from "../components/CardForm";
import "../pages/CardCatalog.css";

export default function CardCatalog(){
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(()=> {
    fetchCards();
  },[]);

  async function fetchCards(){
    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }
    setCards(data || []);
    setLoading(false);
  }

  async function handleDelete(id){
    if (!confirm('Hapus kartu ini?')) return;
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) return alert(error.message);
    setCards(cards.filter(c => c.id !== id));
  }

  return (
    <main className="container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'4rem 0' }}>
        <h1>Katalog Kartu Unsur</h1>
        <button className="btn primary" onClick={()=> setEditing({})}>Tambah Kartu</button>
      </div>

      <section className="card-grid">
        {loading ? <div>Loading…</div> : cards.map(c => (
          <CardCard key={c.id} card={c} onDelete={()=> handleDelete(c.id)} onEdit={() => setEditing(c)} />
        ))}
      </section>

      {editing !== null && (
        <CardForm
          initial={editing}
          onClose={() => { setEditing(null); fetchCards(); }}
        />
      )}
    </main>
  );
}
