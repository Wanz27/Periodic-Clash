// src/MainMenu.jsx
import React from "react";
import { motion } from "framer-motion";
import "./MainMenu.css";
import { Link } from "react-router-dom";

// gunakan path file palet yang sudah diupload
const paletteImage = "/mnt/data/9f985eae-5333-462e-a0e3-fe3d221db9b9.png";
const act1 = "/act1.jpg";
const act2 = "/act2.jpg";
const act3 = "/act3.jpg";

const heroVariants = {
  hidden: { opacity: 0, y: -40 },
  show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  hover: { scale: 1.03, y: -6, transition: { duration: 0.18 } },
};

// Accordion item component (gunakan framer-motion)
function FAQItem({ q, a }) {
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      className={`faq-item ${open ? "is-open" : ""}`}
      initial="closed"
      animate={open ? "open" : "closed"}
      variants={{
        closed: { opacity: 1 },
        open: { opacity: 1 },
      }}
    >
      <button
        className="faq-question"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <motion.span
          className="faq-chevron"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
        >
          +
        </motion.span>
      </button>

      <motion.div
        className="faq-answer-wrap"
        initial={{ height: 0, opacity: 0 }}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="faq-answer">
          {a}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MainMenu() {
  const cards = [
    { title: "Mode Duel", text: "Bertarung dengan Boss menggunakan deck unsur yang disediakan. Gunakan reaksi & strategi untuk memenangkan permainan." },
    { title: "Pelajari Unsur Dasar", text: "Jelajahi misi edukatif — puzzle reaksi untuk naik level." },
    { title: "Koleksi Kartu", text: "Kumpulkan unsur dari tabel periodik, tingkatkan rarity, dan buat deck epik." },
    { title: "Latihan Cepat", text: "latihan tapi cepet wkwk" },
  ];

  return (
    <div className="app-root">
      {/* HERO */}
      <motion.header
        className="hero"
        style={{ backgroundImage: `url(${paletteImage})` }}
        variants={heroVariants}
        initial="hidden"
        animate="show"
      >
        <div className="hero-content">
          {/* LEFT SIDE — TEXT SECTION */}
          <motion.div
            className="hero-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            >
              Periodic Clash
            </motion.h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
            >
              Belajar kimia jadi seru ~ kumpulkan unsur, rancang deck, & menangkan duel!
            </motion.p>

            <motion.div
              className="cta-row"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.3, ease: "easeOut" }}
            >
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link className="btn primary" to="/games">Mainkan</Link>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link className="btn ghost" to="/cards">Pelajari Unsur</Link>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link className="btn ghost" to="/training">Tantangan</Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE — IMAGE SLOT */}
          <motion.div
            className="hero-image-slot"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }}
          >
            <div className="image-box">
              {/* gambar hero opsional */}
              <img src="/act4.jpg" alt="hero" />
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* MAIN CONTENT */}
      <motion.main className="container" variants={containerVariants} initial="hidden" animate="show">


        {/* Activities */}
        <motion.section
          id="activities"
          className="panel activities-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
        >
          <div className="activities-header">
            <h2>Aktivitas</h2>
            <p>Pilih aktivitas untuk belajar: materi terstruktur, latihan interaktif, atau bermain untuk menguji kemampuanmu.</p>
          </div>

          <motion.div
            className="activities-grid"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } }
            }}
          >
            {[
              {
                id: "learn",
                title: "Materi",
                desc: "Pelajari konsep kimia dasar & tabel periodik lewat modul singkat dengan ilustrasi dan contoh.",
                cta: "Buka Materi",
                image: act1,
              },
              {
                id: "cards",
                title: "Latihan",
                desc: "Kerjakan soal singkat & kuis interaktif untuk menguatkan pemahaman (nilai & feedback instan).",
                cta: "Mulai Latihan",
                image: act2,
              },
              {
                id: "games",
                title: "Games",
                desc: "Mode duel & puzzle reaksi — terapkan strategi dengan kartu unsur yang kamu kumpulkan.",
                cta: "Mainkan Games",
                image: act3,
              },
            ].map((a) => (
              <motion.article
                key={a.id}
                className="activity-card"
                variants={{
                  hidden: { opacity: 0, y: 18, scale: 0.98 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" } }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div
                  className="activity-thumb"
                  style={{
                    backgroundImage: `url(${a.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                  aria-hidden="true"
                />
                <div className="activity-body">
                  <div className="activity-top">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-desc">{a.desc}</div>
                  </div>
                  <div className="activity-footer">
                    <Link className="btn primary small" to={`/${a.id}`}>{a.cta}</Link>
                    <button className="btn ghost small" onClick={() => console.log('info', a.id)}>Info</button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>


        {/* Fitur */}
        <section id="features" className="card-grid" aria-label="Fitur utama">
          {cards.map((c, i) => (
            <motion.article key={i} className="card" variants={cardVariants} whileHover="hover">
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </motion.article>
          ))}
        </section>

        {/* FAQ */}
        <motion.section
          id="faq"
          className="panel faq-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="faq-header">
            <div className="faq-title-group">
              <h2>FAQ</h2>
              <p className="muted">Jawaban cepat & panduan tentang fitur utama. Klik untuk membuka setiap pertanyaan.</p>
            </div>
          </div>

          <div className="faq-list">
            {[
              {
                id: "q1",
                q: "Apa saja Tantangan Hari Ini?",
                a: (
                  <div>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                      <li>Menangkan 3 duel menggunakan unsur golongan 1</li>
                      <li>Selesaikan puzzle reaksi H + O → H₂O</li>
                      <li>Pelajari 5 kartu baru</li>
                    </ul>
                  </div>
                ),
              },
              {
                id: "q2",
                q: "Bagaimana cara membuka kartu baru?",
                a: "Kamu bisa mendapat kartu baru melalui menyelesaikan misi, hadiah kemenangan, atau membuka pack di menu Koleksi Kartu.",
              },
              {
                id: "q3",
                q: "Apa itu mode Adventure?",
                a: "Mode Adventure adalah rangkaian misi edukatif berlapis yang menantangmu menyelesaikan puzzle reaksi dan skenario kimia dengan kartu yang kamu miliki.",
              },
            ].map((item) => (
              <FAQItem key={item.id} q={item.q} a={item.a} />
            ))}
          </div>
        </motion.section>

      </motion.main>
    </div>
  );
}
