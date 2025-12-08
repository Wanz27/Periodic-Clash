// src/pages/About.jsx
import React, { useState, useEffect, useRef } from "react";
import "./About.css";

// ganti URL gambar berikut sesuai asetmu
const HERO_IMG = "profile.jpg";
const AVATAR_IMG = "profileps7.jpg";

/* ===== CAROUSEL IMAGES (ganti dengan path asetmu) =====
*/
const CAROUSEL_ITEMS = [
  {
    title: "Projek 1",
    desc: "Kartu ucapan digital Idul Fitri.",
    image: "projek1.png",
  },
  {
    title: "Projek 2",
    desc: "Website peminjaman ruangan untuk mahasiswa.",
    image: "projek2.png",
  },
  {
    title: "Projek 3",
    desc: "Kalkulator sederhana.",
    image: "projek3.png",
  },
];

export default function About() {
  // carousel state
  const [index, setIndex] = useState(0);
  const slideCount = CAROUSEL_ITEMS.length;
  const autoplayRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    // autoplay every 4s
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function startAutoplay() {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideCount);
    }, 3000);
  }

  function stopAutoplay() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function goTo(idx) {
    setIndex((idx + slideCount) % slideCount);
  }

  function prev() {
    goTo(index - 1);
  }

  function next() {
    goTo(index + 1);
  }

  return (
    <main className="about-page">
      <section className="about-hero container">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">About Me!</div>
            <h1>
              I’m <span className="accent">Wan Azka Khairi Muhammad</span>,
              <br />
              Kelompok 15 Praktikum PPB.
            </h1>

            <p className="lead">
              Membuat Periodic Clash sebagai wadah pembelajaran kimia berbasis permainan kartu untuk memudahkan siswa dalam memahami lebih dalam terkait unsur di tabel periodik.
            </p>

            <div className="hero-cta">
              <button
                className="btn primary"
                onClick={() => {
                  const el = document.getElementById("services-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                View My Portfolio
              </button>
            </div>

            <div className="service-tabs">
              <div className="tab">App Design</div>
              <div className="tab">Website Design</div>
              <div className="tab">Backend Developer</div>
              <div className="tab">Wireframes</div>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-image-card">
              <img src={HERO_IMG} alt="Olivia portrait" />
            </div>
          </div>
        </div>
      </section>

      <section id="services-section" className="about-services container">
        <h2 className="section-title">Services</h2>
        <p className="muted">I help teams build enjoyable interfaces and effective products.</p>

        {/* --- Carousel mulai sini --- */}
        <div
          className="services-carousel"
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
          ref={carouselRef}
        >
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-live="polite"
          >
            {CAROUSEL_ITEMS.map((item, i) => (
              <div className="carousel-slide" key={i}>
                <img src={item.image} alt={item.title} />

                <div className="slide-caption">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <button className="btn small">View Details</button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="carousel-nav prev"
            onClick={prev}
            aria-label="Previous slide"
            type="button"
          >
            ‹
          </button>
          <button
            className="carousel-nav next"
            onClick={next}
            aria-label="Next slide"
            type="button"
          >
            ›
          </button>

          <div className="carousel-dots">
            {CAROUSEL_ITEMS.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
        {/* --- Carousel selesai --- */}

      </section>

      <section className="about-profile container">
        <div className="profile-inner">
          <div className="profile-media">
            <div className="avatar-wrap">
              <img src={AVATAR_IMG} alt="Olivia avatar" />
            </div>
          </div>

          <div className="profile-copy">
            <h2>Kenalan lebih dekat dengan <span className="accent">Wan Azka!</span></h2>
            <p className="lead">
              Fullstack Developer dengan pengalaman mengembangkan aplikasi web end-to-end. Terampil dalam React & Node.js, memiliki ketertarikan kuat pada arsitektur software, UI/UX yang efektif, dan solusi berbasis teknologi yang skalable.
            </p>

            <div className="stats-row">
              <div className="stat">
                <div className="stat-value">10+</div>
                <div className="stat-label">Projek dikerjakan</div>
              </div>
              <div className="stat">
                <div className="stat-value">2+</div>
                <div className="stat-label">Tahun pengalaman</div>
              </div>
            </div>

            <div className="profile-cta">
              <button className="btn primary"
              onClick={() => window.open("https://github.com/Wanz27", "_blank")}
              >Portofolio</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
