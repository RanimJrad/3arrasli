import React from "react";
import { Link } from "react-router-dom";
import logo from "./logo (2).png";

const featuredServices = [
  {
    id: 1,
    title: "Studio Lumiere - Photographe",
    price: "A partir de 1200 TND",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Palais Jasmine - Salle de fete",
    price: "A partir de 3500 TND",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Saveurs Royales - Traiteur",
    price: "A partir de 1800 TND",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Elegance Deco - Decoration",
    price: "A partir de 900 TND",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
  },
];

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Prestataires", href: "#!" },
  { label: "Services", href: "#!" },
  { label: "Login", to: "/login" },
  { label: "Sign Up", to: "/signup" },
];
const footerLinks = ["A propos", "Contact", "FAQ", "Conditions"];

const Home = () => {
  return (
    <div className="home-page">
      <style>{styles}</style>

      <header className="navbar">
        <div className="container nav-content">
          <img src={logo} alt="logo" className="logo" />
          <nav className="nav-links">
            {navLinks.map((link) => (
              link.to ? (
                <Link key={link.label} to={link.to} className="nav-link">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="nav-link">
                  {link.label}
                </a>
              )
            ))}
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1>Organisez votre mariage facilement</h1>
          <p>Trouvez les meilleurs prestataires en quelques clics</p>

          <div className="search-box">
            <select aria-label="Ville">
              <option>Ville</option>
              <option>Tunis</option>
              <option>Sousse</option>
              <option>Sfax</option>
              <option>Monastir</option>
            </select>

            <select aria-label="Budget">
              <option>Budget</option>
              <option>Moins de 1000 TND</option>
              <option>1000 - 3000 TND</option>
              <option>3000 - 5000 TND</option>
              <option>Plus de 5000 TND</option>
            </select>

            <select aria-label="Type de service">
              <option>Type de service</option>
              <option>Photographe</option>
              <option>Salle</option>
              <option>Traiteur</option>
              <option>Decoration</option>
            </select>

            <button type="button">Rechercher</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Prestataires a la une</h2>
          <div className="cards-grid">
            {featuredServices.map((service) => (
              <article key={service.id} className="card">
                <img src={service.image} alt={service.title} />
                <div className="card-body">
                  <h3>{service.title}</h3>
                  <p className="price">{service.price}</p>
                  <p className="rating">* {service.rating}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ca marche</h2>
          <div className="steps">
            <div className="step">
              <span>1</span>
              <h3>Rechercher</h3>
              <p>Filtrez les meilleurs prestataires selon votre ville et budget.</p>
            </div>
            <div className="step">
              <span>2</span>
              <h3>Reserver</h3>
              <p>Comparez les offres et reservez en quelques clics.</p>
            </div>
            <div className="step">
              <span>3</span>
              <h3>Profiter</h3>
              <p>Vivez votre jour special avec des partenaires verifies.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-box">
          <h2>Prets a planifier votre grand jour ?</h2>
          <button type="button">Commencer maintenant</button>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-content">
          <div>
            <h3>3arrasli.tn</h3>
            <p>Votre marketplace mariage en Tunisie.</p>
          </div>

          <div className="footer-links">
            {footerLinks.map((link) => (
              <a key={link} href="#!">
                {link}
              </a>
            ))}
          </div>

          <div className="socials">
            <a href="#!" aria-label="Facebook">
              f
            </a>
            <a href="#!" aria-label="Instagram">
              i
            </a>
            <a href="#!" aria-label="TikTok">
              t
            </a>
          </div>
        </div>
        <p className="copyright">(c) {new Date().getFullYear()} 3arrasli.tn - Tous droits reserves</p>
      </footer>
    </div>
  );
};

const styles = `
  :root {
    --pink-soft: #ffe8ee;
    --pink: #f8bfd0;
    --gold: #c9a44b;
    --dark: #2d2d2d;
    --white: #ffffff;
    --cream: #fff8f3;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Segoe UI", sans-serif;
    background: var(--cream);
    color: var(--dark);
  }

  .container {
    width: min(1120px, 92%);
    margin: 0 auto;
  }

  .navbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid #f2dce3;
    backdrop-filter: blur(8px);
  }

  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
  }

  .logo {
    width: 180px;
    height: auto;
    display: block;
  }

  .nav-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nav-link {
    text-decoration: none;
    color: var(--dark);
    font-weight: 600;
    padding: 0.35rem 0.7rem;
    border-radius: 99px;
    transition: 0.2s ease;
  }

  .nav-link:hover {
    background: var(--pink-soft);
    color: #9e5a72;
  }

  .hero {
    position: relative;
    min-height: 76vh;
    display: grid;
    place-items: center;
    background-image: url("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80");
    background-size: cover;
    background-position: center;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(255, 243, 247, 0.92), rgba(255, 255, 255, 0.7));
  }

  .hero-content {
    position: relative;
    text-align: center;
    padding: 2.5rem 0;
  }

  .hero h1 {
    font-size: clamp(2rem, 4vw, 3.2rem);
    line-height: 1.15;
    margin-bottom: 1rem;
    color: #81384f;
  }

  .hero p {
    font-size: clamp(1rem, 2vw, 1.2rem);
    margin-bottom: 2rem;
    color: #52363f;
  }

  .search-box {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.95);
    padding: 0.85rem;
    border-radius: 16px;
    box-shadow: 0 18px 40px rgba(159, 86, 111, 0.18);
  }

  .search-box select,
  .search-box button {
    height: 46px;
    border-radius: 10px;
    border: 1px solid #edd0d9;
    font-size: 0.95rem;
    padding: 0 0.8rem;
    outline: none;
  }

  .search-box button {
    border: none;
    background: linear-gradient(135deg, #cfa94f, #b58a32);
    color: var(--white);
    font-weight: 700;
    cursor: pointer;
  }

  .section {
    padding: 4.5rem 0;
  }

  .section-title {
    text-align: center;
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    margin-bottom: 2rem;
    color: #7f3c52;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.2rem;
  }

  .card {
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
  }

  .card:hover {
    transform: translateY(-4px);
  }

  .card img {
    width: 100%;
    height: 170px;
    object-fit: cover;
  }

  .card-body {
    padding: 1rem;
  }

  .card-body h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .price {
    color: #ad7b2a;
    font-weight: 700;
    margin-bottom: 0.35rem;
  }

  .rating {
    color: #a76b33;
    font-weight: 600;
  }

  .how-it-works {
    background: linear-gradient(180deg, #fffafc 0%, #fff2f6 100%);
  }

  .steps {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .step {
    background: var(--white);
    border: 1px solid #f4d8e0;
    border-radius: 14px;
    padding: 1.4rem;
    text-align: center;
  }

  .step span {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #f8d7e2;
    color: #8d3f57;
    display: inline-grid;
    place-items: center;
    font-weight: 800;
    margin-bottom: 0.7rem;
  }

  .step h3 {
    margin-bottom: 0.5rem;
    color: #763547;
  }

  .cta {
    padding: 2rem 0 4.5rem;
  }

  .cta-box {
    background: linear-gradient(135deg, #f9d8e4, #f5ebd6);
    border: 1px solid #f0d9bd;
    border-radius: 18px;
    padding: 2rem;
    text-align: center;
  }

  .cta-box h2 {
    margin-bottom: 1rem;
    color: #713748;
  }

  .cta-box button {
    background: #7e4155;
    color: var(--white);
    border: none;
    border-radius: 10px;
    height: 46px;
    padding: 0 1.35rem;
    font-weight: 700;
    cursor: pointer;
  }

  .footer {
    background: #321f26;
    color: #ffeef3;
    padding-top: 2.2rem;
  }

  .footer-content {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1.2fr 1fr auto;
    align-items: center;
  }

  .footer-links,
  .socials {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .footer a {
    text-decoration: none;
    color: #ffeef3;
    opacity: 0.92;
  }

  .socials a {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    display: inline-grid;
    place-items: center;
    font-weight: 700;
  }

  .copyright {
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    margin-top: 1.1rem;
    padding: 0.9rem 0;
    font-size: 0.9rem;
  }

  @media (max-width: 860px) {
    .search-box {
      grid-template-columns: 1fr;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
    }
  }
`;

export default Home;
