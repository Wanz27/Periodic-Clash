// src/MainMenu.jsx
import React from "react";
import { motion } from "framer-motion";
import "./MainMenu.css";
import { Link } from "react-router-dom";

// gunakan path file palet yang sudah diupload
const paletteImage = "/mnt/data/9f985eae-5333-462e-a0e3-fe3d221db9b9.png";
const act1 = "/info.png";
const act2 = "/card.png";
const act3 = "/swords.png";

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
                <Link className="btn ghost" to="/games">Tantangan</Link>
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
                id: "about",
                title: "About",
                desc: "Lihat update fitur terbaru dari Periodic Clash.",
                cta: "About",
                image: act1,
              },
              {
                id: "cards",
                title: "Buat Deck",
                desc: "Buat deckmu dan buat reaksi antara unsur.",
                cta: "Lihat Kartu",
                image: act2,
              },
              {
                id: "games",
                title: "Games",
                desc: "Kalahkan Boss dengan kartu deck yang tersedia.",
                cta: "Mainkan",
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
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

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
              <p className="muted">Pertanyaan umum seputar fitur di Periodic Clash. Klik untuk membuka setiap pertanyaan.</p>
            </div>
          </div>

          <div className="faq-list">
            {[
              {
                id: "q1",
                q: "Apakah bisa menambahkan kartu deck?",
                a: "User bisa menambahkan kartu bebas dan mengatur power pus serta reaksi yang diberikan dari kartu unsur tersebut.",
              },
              {
                id: "q2",
                q: "Apa itu mode Boss?",
                a: "Mode Boss adalah mode duel Mode duel reaksi dari kombinasi kartu unsur melawan 1 Boss unsurr. Terapkan strategi dengan kartu unsur yang kamu kumpulkan untuk mengalahkan Boss.",
              },
              {
                id: "q3",
                q: "Apakah kartu yang kita tambahkan bisa dimasukkan ke dalam deck pada mode Boss?",
                a: "Untuk sementara, tidak bisa. Mode Boss hanya bisa dimainkan dengan deck yang tersedia di tiap arena Boss.",
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
